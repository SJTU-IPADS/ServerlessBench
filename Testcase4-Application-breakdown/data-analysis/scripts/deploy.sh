#!/bin/bash
#
# Copyright 2020 Institution of Parallel and Distributed Systems
#
# This file is a derived work from https://github.com/IBM/ibm-cloud-functions-data-processing-cloudant.
# Modifications are made to deploy functions (wage data analysis) for ServerlessBench:
#   The functions involved are changed to wage data analysis functions 
#       (see the functions in actions directory).
#   The interaction with Cloudant is changed to CouchDB (as provided 
#       with the open-source OpenWhisk).
#   Added setup command for couchdb trigger (see openwhisk-package-couchdb for details).
#   Utilities for serverlessBench scripts, such as input variables, 
#       and database reset commands.
#
# Copyright 2017 IBM Corp. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the “License”);
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#  https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an “AS IS” BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# Load configuration variables
if [ -z "$TESTCASE4_HOME" ]; then
    echo "$0: ERROR: TESTCASE4_HOME environment variable not set"
    exit
fi
source $TESTCASE4_HOME/local.env
source $TESTCASE4_HOME/eval-config

couchdb_url=http://$COUCHDB_USERNAME:$COUCHDB_PASSWORD@$COUCHDB_IP:$COUCHDB_PORT

SCRIPTS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
SRC_DIR=$SCRIPTS_DIR/../src

function usage() {
  echo -e "Usage: $0 [--install,--uninstall,--env]"
}

function install() {
  echo "Installing OpenWhisk actions, triggers, and rules for CouchDB sample..."

  echo "Binding myCouchdb package with credential parameters"
  wsk -i package bind myCouchdb "$WAGE_COUCHDB_INSTANCE"\
    --param username "$COUCHDB_USERNAME" \
    --param password "$COUCHDB_PASSWORD" \
    --param host "$COUCHDB_IP" \
    --param url "$couchdb_url"

  echo "Creating trigger to fire events when data is inserted"
  wsk -i trigger create data-inserted \
    --feed "/_/$WAGE_COUCHDB_INSTANCE/changes" \
    --param dbname "$WAGE_COUCHDB_DATABASE"

  echo "Creating wage-insert actions"
  
  cd $SRC_DIR

  cp wage-package.json package.json
  npm install

  cp wage-insert.js index.js
  zip -rq wage-insert.zip index.js node_modules constances.js
  wsk -i action update wage-insert wage-insert.zip -a provide-api-key true --kind nodejs:10

  cp wage-format.js index.js
  zip -rq wage-format.zip index.js node_modules constances.js
  wsk -i action update wage-format wage-format.zip -a provide-api-key true --kind nodejs:10

  cp wage-db-writer.js index.js
  zip -rq wage-db-writer.zip index.js node_modules
  wsk -i action update wage-db-writer wage-db-writer.zip -a provide-api-key true --kind nodejs:10 \
    --param COUCHDB_URL "$couchdb_url" \
    --param COUCHDB_DATABASE "$WAGE_COUCHDB_DATABASE"

  echo "Creating actions to respond to database insertions"

  cp wage-fillup.js index.js
  zip -rq wage-fillup.zip index.js node_modules
  wsk -i action update wage-fillup wage-fillup.zip --kind nodejs:10 \
    --param COUCHDB_URL "$couchdb_url" \
    --param COUCHDB_DATABASE "$WAGE_COUCHDB_DATABASE"

  wsk -i action update wage-analysis-total wage-analysis-total.js

  cp wage-analysis-realpay.js index.js
  zip -rq wage-analysis-realpay.zip index.js constances.js
  wsk -i action update wage-analysis-realpay wage-analysis-realpay.zip --kind nodejs:10

  cp wage-analysis-merit-percent.js index.js
  zip -rq wage-analysis-merit-percent.zip index.js constances.js
  wsk -i action update wage-analysis-merit-percent wage-analysis-merit-percent.zip --kind nodejs:10

  cp wage-analysis-result.js index.js
  zip -rq wage-analysis-result.zip index.js node_modules
  wsk -i action update wage-analysis-result wage-analysis-result.zip --kind nodejs:10 \
    --param COUCHDB_URL "$couchdb_url" \
    --param COUCHDB_DATABASE_STATISTICS "$WAGE_COUCHDB_DATABASE_STATISTICS"

  echo "Creating sequence that ties database read to handling action"
  wsk -i action update wage-analysis-sequence \
    --sequence /_/$WAGE_COUCHDB_INSTANCE/read,wage-fillup,wage-analysis-total,wage-analysis-realpay,wage-analysis-merit-percent,wage-analysis-result

  echo "Creating rule that maps database change trigger to sequence"
  wsk -i rule update data-analysis data-inserted wage-analysis-sequence

  echo "Generating initial records"
  rm -f $SCRIPTS_DIR/records.json
  $SCRIPTS_DIR/records_generator.sh $record_num

  echo "Install complete"
}

function uninstall() {
  echo "Uninstalling..."

  echo "Removing rules..."
  if [[ $(wsk -i rule list | grep data-analysis) ]]; then
      wsk -i rule disable data-analysis
      sleep 1
      wsk -i rule delete data-analysis
  fi

  echo "Removing triggers..."
  if [[ $(wsk -i trigger list | grep data-inserted) ]]; then
    wsk -i trigger delete data-inserted
  fi

  echo "Removing actions..."
  if [[ $(wsk -i action list | grep wage-insert) ]]; then
      wsk -i action delete wage-insert
  fi

  if [[ $(wsk -i action list | grep wage-format) ]]; then
      wsk -i action delete wage-format
  fi

  if [[ $(wsk -i action list | grep wage-db-writer) ]]; then
      wsk -i action delete wage-db-writer
  fi

  if [[ $(wsk -i action list | grep wage-fillup) ]]; then
      wsk -i action delete wage-fillup
  fi

  if [[ $(wsk -i action list | grep wage-analysis-sequence) ]]; then
      wsk -i action delete wage-analysis-sequence
  fi

  if [[ $(wsk -i action list | grep wage-analysis-merit-percent) ]]; then
      wsk -i action delete wage-analysis-merit-percent
  fi

  if [[ $(wsk -i action list | grep wage-analysis-realpay) ]]; then
      wsk -i action delete wage-analysis-realpay
  fi

  if [[ $(wsk -i action list | grep wage-analysis-result) ]]; then
      wsk -i action delete wage-analysis-result
  fi

  if [[ $(wsk -i action list | grep wage-analysis-total) ]]; then
      wsk -i action delete wage-analysis-total
  fi

  echo "Removing packages..."
  if [[ $(wsk -i package list | grep $WAGE_COUCHDB_INSTANCE) ]]; then
      wsk -i package delete "$WAGE_COUCHDB_INSTANCE"
  fi

  echo "Removing action packages..."
  rm -f $SRC_DIR/package.json
  rm -rf $SRC_DIR/package-lock.json $SRC_DIR/*.zip
  echo "removing existing node_modules:"
  find . -name "node_modules" -type d
  find . -name "node_modules" -type d -exec rm -rf {} +

  echo "removing old records.json"
  rm -rf $SCRIPTS_DIR/records.json

  echo "Uninstall complete"
}

function showenv() {
  echo -e COUCHDB_URL="$couchdb_url"
  echo -e COUCHDB_INSTANCE="$WAGE_COUCHDB_INSTANCE"
  echo -e COUCHDB_USERNAME="$COUCHDB_USERNAME"
  echo -e COUCHDB_PASSWORD="$COUCHDB_PASSWORD"
  echo -e COUCHDB_DATABASE="$WAGE_COUCHDB_DATABASE"
  echo -e COUCHDB_DATABASE_STATISTICS="$WAGE_COUCHDB_DATABASE_STATISTICS"
}

function clearDB() {
  curl -X DELETE $couchdb_url/$WAGE_COUCHDB_DATABASE
  curl -X DELETE $couchdb_url/$WAGE_COUCHDB_DATABASE_STATISTICS
  curl -X PUT $couchdb_url/$WAGE_COUCHDB_DATABASE
  curl -X PUT $couchdb_url/$WAGE_COUCHDB_DATABASE_STATISTICS
}

if [[ $# -lt 1 ]]; then
    echo "0. preparing data change trigger..."
    $SCRIPTS_DIR/run-provider.sh

    echo "1. clearing functions..."
    uninstall

    echo "2. Re-creating databases"
    clearDB

    echo "3. installing functions..."
    install
else
    case "$1" in
    "--install" )
    install
    ;;
    "--uninstall" )
    uninstall
    ;;
    "--env" )
    showenv
    ;;
    * )
    usage
    ;;
    esac
fi

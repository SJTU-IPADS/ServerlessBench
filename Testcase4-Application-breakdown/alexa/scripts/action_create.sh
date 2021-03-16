#!/bin/bash
#
# Copyright (c) 2020 Institution of Parallel and Distributed System, Shanghai Jiao Tong University
# ServerlessBench is licensed under the Mulan PSL v1.
# You can use this software according to the terms and conditions of the Mulan PSL v1.
# You may obtain a copy of Mulan PSL v1 at:
#     http://license.coscl.org.cn/MulanPSL
# THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR
# PURPOSE.
# See the Mulan PSL v1 for more details.
#

if [ -z "$TESTCASE4_HOME" ]; then
    echo "$0: ERROR: TESTCASE4_HOME environment variable not set"
    exit
fi

source $TESTCASE4_HOME/local.env
couchdb_url=http://$COUCHDB_USERNAME:$COUCHDB_PASSWORD@$COUCHDB_IP:$COUCHDB_PORT

SCRIPTS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
SRC_DIR=$SCRIPTS_DIR/../src

# frontend
cd $SRC_DIR/frontend
# install dependencies -- making this script need sudo to execute
npm install
# package handler with dependencies
zip -rq index.zip *
# create/update action
wsk -i action update alexa-frontend index.zip -a provide-api-key true --kind nodejs:10

# interact
cd $SRC_DIR/interact
# install dependencies -- making this script need sudo to execute
npm install
# package handler with dependencies
zip -rq index.zip * ../infra
# create/update action
wsk -i action update alexa-interact index.zip -a provide-api-key true --kind nodejs:10

# fact
cd $SRC_DIR/fact
# install dependencies -- making this script need sudo to execute
npm install
# package handler with dependencies
zip -rq index.zip index.js handler.js node_modules ../infra/language.js
# create/update action
wsk -i action update alexa-fact index.zip --kind nodejs:10

# reminder
cd $SRC_DIR/reminder
# install dependencies -- making this script need sudo to execute
npm install
# package handler with dependencies
zip -rq index.zip index.js handler.js node_modules ../infra/language.js
# create/update action
wsk -i action update alexa-reminder index.zip --kind nodejs:10 \
  --param COUCHDB_URL $couchdb_url \
  --param DATABASE $ALEXA_REMINDER_COUCHDB_DATABASE

# smarthome
cd $SRC_DIR/smarthome
# create actions for devices
$SCRIPTS_DIR/action_create_devices.sh

# install dependencies for smarthome entry
rm -rf node_modules
cp package-smarthome.json package.json
npm install

# smarthome entry
cp smarthome-index.js index.js
# package handler with dependencies
zip -rq smarthome.zip index.js smarthome-handler.js node_modules ../infra ./en-US.json
# create/update action
wsk -i action update alexa-smarthome smarthome.zip -a provide-api-key true --kind nodejs:10 \
  --param SMARTHOME_PASSWORD "$ALEXA_SMARTHOME_PASSWORD"

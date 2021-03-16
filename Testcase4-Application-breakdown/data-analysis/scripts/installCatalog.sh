#!/bin/bash

#
# Licensed to the Apache Software Foundation (ASF) under one or more
# contributor license agreements.  See the NOTICE file distributed with
# this work for additional information regarding copyright ownership.
# The ASF licenses this file to You under the Apache License, Version 2.0
# (the "License"); you may not use this file except in compliance with
# the License.  You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

#
# use the command line interface to install standard actions deployed
# automatically
#

set -e
set -x

WSK_CLI=wsk

if [ $# -eq 0 ]; then
    echo "Usage: ./installCatalog.sh <workers>"
fi

if [ -z "$TESTCASE4_HOME" ]; then
    echo "$0: ERROR: TESTCASE4_HOME environment variable not set"
    exit
fi
source $TESTCASE4_HOME/local.env

SCRIPTS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
SRC_DIR="$( cd "$SCRIPTS_DIR/../src/openwhisk-package-couchdb" >/dev/null 2>&1 && pwd )"
echo "SRC_DIR=$SRC_DIR"

couchdb_url=http://$COUCHDB_USERNAME:$COUCHDB_PASSWORD@$COUCHDB_IP:$COUCHDB_PORT
DB_NAME=$COUCHDB_PROVIDER_DATABASE_TRIGGER
APIHOST=$COUCHDB_PROVIDER_ROUTER_HOST
WORKERS="$1"
ACTION_RUNTIME_VERSION=${ACTION_RUNTIME_VERSION:="nodejs:10"}
INSTALL_FEED_ONLY=${INSTALL_FEED_ONLY:="false"}

#export WSK_CONFIG_FILE= # override local property file to avoid namespace clashes

echo Installing myCouchdb package.

$WSK_CLI -i package update --shared yes myCouchdb \
    -p host "$APIHOST" \
    -a description "CouchDB database service"
#    -a parameters '[  {"name":"bluemixServiceName", "required":false, "bindTime":true}, {"name":"username", "required":false, "bindTime":true, "description": "Your Cloudant username"}, {"name":"password", "required":false, "type":"password", "bindTime":true, "description": "Your Cloudant password"}, {"name":"host", "required":true, "bindTime":true, "description": "This is usually your username.cloudant.com"}, {"name":"iamApiKey", "required":false}, {"name":"iamUrl", "required":false}, {"name":"dbname", "required":false, "description": "The name of your Cloudant database"}, {"name":"overwrite", "required":false, "type": "boolean"} ]' \
#    -p bluemixServiceName 'couchNoSQLDB' \

# make changesFeed.zip
cd $SRC_DIR/actions/event-actions

rm -rf changesFeed.zip
cp -f changesFeed_package.json package.json
npm install
zip -r changesFeed.zip lib package.json changes.js node_modules -q

$WSK_CLI -i action update --kind "$ACTION_RUNTIME_VERSION" myCouchdb/changes "$SRC_DIR/actions/event-actions/changesFeed.zip" \
    -t 90000 \
    -a feed true \
    -a description 'Database change feed' \
    -a parameters '[ {"name":"dbname", "required":true, "updatable":false}, {"name":"iamApiKey", "required":false, "updatable":false}, {"name":"iamUrl", "required":false, "updatable":false}, {"name": "filter", "required":false, "updatable":true, "type": "string", "description": "The name of your Cloudant database filter"}, {"name": "query_params", "required":false, "updatable":true, "description": "JSON Object containing query parameters that are passed to the filter"} ]' \
    -a sampleInput '{ "dbname": "mydb", "filter": "mailbox/by_status", "query_params": {"status": "new"} }'

COMMAND=" -i package update --shared no couchdbWeb \
     -p DB_URL $couchdb_url \
     -p DB_NAME $DB_NAME \
     -p apihost $APIHOST"

if [ -n "$WORKERS" ]; then
    COMMAND+=" -p workers $WORKERS"
fi

$WSK_CLI $COMMAND

# make changesWebAction.zip
rm -rf changesWebAction.zip
cp -f changesWeb_package.json package.json
npm install
zip -r changesWebAction.zip lib package.json changesWebAction.js node_modules -q

$WSK_CLI -i action update --kind "$ACTION_RUNTIME_VERSION" couchdbWeb/changesWebAction "$SRC_DIR/actions/event-actions/changesWebAction.zip" \
    -p DB_URL $couchdb_url \
    -a description 'Create/Delete a trigger in couchdb provider Database' \
    --web true

if [ $INSTALL_FEED_ONLY == "false" ]; then
    # Cloudant account actions

    $WSK_CLI -i action update myCouchdb/create-database "$SRC_DIR/actions/account-actions/create-database.js" \
        --docker yellyyu/openwhisk-nodejs10-nano:latest \
        -a description 'Create Couchdb database' \
        -a parameters '[ {"name":"dbname", "required":true} ]'

    $WSK_CLI -i action update myCouchdb/read-database "$SRC_DIR/actions/account-actions/read-database.js" \
        --docker yellyyu/openwhisk-nodejs10-nano:latest  \
        -a description 'Read Couchdb database' \
        -a parameters '[ {"name":"dbname", "required":true} ]'

    $WSK_CLI -i action update myCouchdb/delete-database "$SRC_DIR/actions/account-actions/delete-database.js" \
        --docker yellyyu/openwhisk-nodejs10-nano:latest  \
        -a description 'Delete Couchdb database' \
        -a parameters '[ {"name":"dbname", "required":true} ]'

    $WSK_CLI -i action update myCouchdb/list-all-databases "$SRC_DIR/actions/account-actions/list-all-databases.js" \
        --docker yellyyu/openwhisk-nodejs10-nano:latest  \
        -a description 'List all Couchdb databases'

    $WSK_CLI -i action update myCouchdb/read-updates-feed "$SRC_DIR/actions/account-actions/read-updates-feed.js" \
        --docker yellyyu/openwhisk-nodejs10-nano:latest  \
        -a description 'Read updates feed from Couchdb account (non-continuous)' \
        -a parameters '[ {"name":"dbname", "required":true}, {"name":"params", "required":false} ]'

    # Cloudant database actions

    $WSK_CLI -i action update myCouchdb/create-document "$SRC_DIR/actions/database-actions/create-document.js" \
        --docker yellyyu/openwhisk-nodejs10-nano:latest  \
        -a description 'Create document in database' \
        -a parameters '[ {"name":"dbname", "required":true}, {"name":"doc", "required":true, "description": "The JSON document to insert"}, {"name":"params", "required":false} ]' \

    $WSK_CLI -i action update myCouchdb/read "$SRC_DIR/actions/database-actions/read-document.js" \
        --docker yellyyu/openwhisk-nodejs10-nano:latest  \
        -a description 'Read document from database' \
        -a parameters '[ {"name":"dbname", "required":true}, {"name":"id", "required":true, "description": "The Couchdb document id to fetch"}, {"name":"params", "required":false}]' \
        -p id ''

    $WSK_CLI -i action update myCouchdb/read-document "$SRC_DIR/actions/database-actions/read-document.js" \
        --docker yellyyu/openwhisk-nodejs10-nano:latest \
        -a description 'Read document from database' \
        -a parameters '[ {"name":"dbname", "required":true}, {"name":"docid", "required":true, "description": "The Couchdb document id to fetch"}, {"name":"params", "required":false}]' \
        -p docid ''

    $WSK_CLI -i action update myCouchdb/write "$SRC_DIR/actions/database-actions/write-document.js" \
        --docker yellyyu/openwhisk-nodejs10-nano:latest  \
        -a description 'Write document in database' \
        -a parameters '[ {"name":"dbname", "required":true}, {"name":"doc", "required":true} ]' \
        -p doc '{}'

    $WSK_CLI -i action update myCouchdb/update-document "$SRC_DIR/actions/database-actions/update-document.js" \
        --docker yellyyu/openwhisk-nodejs10-nano:latest  \
       -a description 'Update document in database' \
        -a parameters '[ {"name":"dbname", "required":true}, {"name":"doc", "required":true}, {"name":"params", "required":false} ]' \
        -p doc '{}'

    $WSK_CLI -i action update myCouchdb/delete-document "$SRC_DIR/actions/database-actions/delete-document.js" \
        --docker yellyyu/openwhisk-nodejs10-nano:latest  \
        -a description 'Delete document from database' \
        -a parameters '[ {"name":"dbname", "required":true}, {"name":"docid", "required":true, "description": "The Couchdb document id to delete"},  {"name":"docrev", "required":true, "description": "The document revision number"} ]' \
        -p docid '' \
        -p docrev ''

    $WSK_CLI -i action update myCouchdb/list-documents "$SRC_DIR/actions/database-actions/list-documents.js" \
        --docker yellyyu/openwhisk-nodejs10-nano:latest  \
        -a description 'List all docs from database' \
        -a parameters '[ {"name":"dbname", "required":true}, {"name":"params", "required":false} ]'

    $WSK_CLI -i action update myCouchdb/list-design-documents "$SRC_DIR/actions/database-actions/list-design-documents.js" \
        --docker yellyyu/openwhisk-nodejs10-nano:latest  \
        -a description 'List design documents from database' \
        -a parameters '[ {"name":"dbname", "required":true}, {"name":"includedocs", "required":false} ]' \

    $WSK_CLI -i action update myCouchdb/create-query-index "$SRC_DIR/actions/database-actions/create-query-index.js" \
        --docker yellyyu/openwhisk-nodejs10-nano:latest  \
        -a description 'Create a Couchdb Query index into database' \
        -a parameters '[ {"name":"dbname", "required":true}, {"name":"index", "required":true} ]' \
        -p index ''

    $WSK_CLI -i action update myCouchdb/list-query-indexes "$SRC_DIR/actions/database-actions/list-query-indexes.js" \
        --docker yellyyu/openwhisk-nodejs10-nano:latest  \
        -a description 'List Couchdb Query indexes from database' \
        -a parameters '[ {"name":"dbname", "required":true} ]' \

    $WSK_CLI -i action update myCouchdb/exec-query-find "$SRC_DIR/actions/database-actions/exec-query-find.js" \
        --docker yellyyu/openwhisk-nodejs10-nano:latest  \
        -a description 'Execute query against Couchdb Query index' \
        -a parameters '[ {"name":"dbname", "required":true}, {"name":"query", "required":true} ]' \
        -p query ''

    $WSK_CLI -i action update myCouchdb/exec-query-search "$SRC_DIR/actions/database-actions/exec-query-search.js" \
        --docker yellyyu/openwhisk-nodejs10-nano:latest  \
        -a description 'Execute query against Couchdb search' \
        -a parameters '[ {"name":"dbname", "required":true}, {"name":"docid", "required":true}, {"name":"indexname", "required":true}, {"name":"search", "required":true} ]' \
        -p docid '' \
        -p indexname '' \
        -p search ''

    $WSK_CLI -i action update myCouchdb/exec-query-view "$SRC_DIR/actions/database-actions/exec-query-view.js" \
        --docker yellyyu/openwhisk-nodejs10-nano:latest  \
        -a description 'Call view in design document from database' \
        -a parameters '[ {"name":"dbname", "required":true}, {"name":"docid", "required":true}, {"name":"viewname", "required":true}, {"name":"params", "required":false} ]' \
        -p docid '' \
        -p viewname ''

    $WSK_CLI -i action update myCouchdb/manage-bulk-documents  "$SRC_DIR/actions/database-actions/manage-bulk-documents.js" \
        --docker yellyyu/openwhisk-nodejs10-nano:latest \
        -a description 'Create, Update, and Delete documents in bulk' \
        -a parameters '[ {"name":"dbname", "required":true}, {"name":"docs", "required":true}, {"name":"params", "required":false} ]' \
        -p docs '{}'

    $WSK_CLI -i action update myCouchdb/delete-view "$SRC_DIR/actions/database-actions/delete-view.js" \
        --docker yellyyu/openwhisk-nodejs10-nano:latest  \
        -a description 'Delete view from design document' \
        -a parameters '[ {"name":"dbname", "required":true}, {"name":"docid", "required":true}, {"name":"viewname", "required":true}, {"name":"params", "required":false} ]' \
        -p docid '' \
        -p viewname ''

    $WSK_CLI -i action update myCouchdb/delete-query-index "$SRC_DIR/actions/database-actions/delete-query-index.js" \
        --docker yellyyu/openwhisk-nodejs10-nano:latest  \
        -a description 'Delete index from design document' \
        -a parameters '[ {"name":"dbname", "required":true}, {"name":"docid", "required":true}, {"name":"indexname", "required":true}, {"name":"params", "required":false} ]' \
        -p docid '' \
        -p indexname ''

    $WSK_CLI -i action update myCouchdb/read-changes-feed "$SRC_DIR/actions/database-actions/read-changes-feed.js" \
        --docker yellyyu/openwhisk-nodejs10-nano:latest  \
        -a description 'Read Couchdb database changes feed (non-continuous)' \
        -a parameters '[ {"name":"dbname", "required":true}, {"name":"params", "required":false} ]'

    $WSK_CLI -i action update myCouchdb/create-attachment "$SRC_DIR/actions/database-actions/create-update-attachment.js" \
        --docker yellyyu/openwhisk-nodejs10-nano:latest  \
        -a description 'Create document attachment in database' \
        -a parameters '[ {"name":"dbname", "required":true}, {"name":"docid", "required":true}, {"name":"docrev", "required":true}, {"name":"attachment", "required":true}, {"name":"attachmentname", "required":true}, {"name":"contenttype", "required":true}, {"name":"params", "required":false} ]' \
        -p docid '' \
        -p docrev '' \
        -p attachment '{}' \
        -p attachmentname '' \
        -p contenttype ''

    $WSK_CLI -i action update myCouchdb/read-attachment "$SRC_DIR/actions/database-actions/read-attachment.js" \
        --docker yellyyu/openwhisk-nodejs10-nano:latest  \
        -a description 'Read document attachment from database' \
        -a parameters '[ {"name":"dbname", "required":true}, {"name":"docid", "required":true}, {"name":"attachmentname", "required":true}, {"name":"params", "required":false} ]' \
        -p docid '' \
        -p attachmentname ''

    $WSK_CLI -i action update myCouchdb/update-attachment "$SRC_DIR/actions/database-actions/create-update-attachment.js" \
        --docker yellyyu/openwhisk-nodejs10-nano:latest  \
        -a description 'Update document attachment in database' \
        -a parameters '[ {"name":"dbname", "required":true}, {"name":"docid", "required":true}, {"name":"docrev", "required":true}, {"name":"attachment", "required":true}, {"name":"attachmentname", "required":true}, {"name":"contenttype", "required":true}, {"name":"params", "required":false} ]' \
        -p docid '' \
        -p docrev '' \
        -p attachment '{}' \
        -p attachmentname '' \
        -p contenttype ''

    $WSK_CLI -i action update myCouchdb/delete-attachment "$SRC_DIR/actions/database-actions/delete-attachment.js" \
        --docker yellyyu/openwhisk-nodejs10-nano:latest  \
        -a description 'Delete document attachment from database' \
        -a parameters '[ {"name":"dbname", "required":true}, {"name":"docid", "required":true}, {"name":"docrev", "required":true}, {"name":"attachmentname", "required":true}, {"name":"params", "required":false} ]' \
        -p docid '' \
        -p docrev '' \
        -p attachmentname ''
fi

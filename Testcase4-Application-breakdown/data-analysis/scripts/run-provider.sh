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
SRC_DIR=$SCRIPTS_DIR/../src/openwhisk-package-couchdb

# 0. delete databases
docker rm -f couchdb-provider
curl -X DELETE $couchdb_url/$COUCHDB_PROVIDER_DATABASE_TRIGGER

# 1. create database
curl -X PUT $couchdb_url/$COUCHDB_PROVIDER_DATABASE_TRIGGER

# 2. run provider
if [[ ! $(docker images | grep couchdb-provider) ]]; then
    docker build -t couchdb-provider $SRC_DIR
fi

docker run --name couchdb-provider --rm \
    --env PORT=$COUCHDB_PROVIDER_PORT \
    --env DB_USERNAME=$COUCHDB_USERNAME \
    --env DB_PASSWORD=$COUCHDB_PASSWORD \
    --env DB_HOST=$COUCHDB_IP \
    --env DB_PROTOCOL=$COUCHDB_PROVIDER_PROTOCOL \
    --env DB_PREFIX=$COUCHDB_PROVIDER_DB_PREFIX \
    --env DB_URL=$couchdb_url \
    --env ROUTER_HOST=$COUCHDB_PROVIDER_ROUTER_HOST \
    couchdb-provider &

sleep 5

# 3. install couchdb actions
$SCRIPTS_DIR/installCatalog.sh

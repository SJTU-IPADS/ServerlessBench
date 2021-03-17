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

# deploy.sh should be executed in parent dir of src
# ASSET_DIR=$(pwd)/assets
ASSET_DIR=$TESTCASE4_HOME/image-process/assets
cd $TESTCASE4_HOME/image-process/src

echo "1. building functions..."
mvn clean
mvn package

echo "2. uploading image to be processed"
image=$ASSET_DIR/test.jpg
if [ ! -f $image ]; then
    echo "image $image does not exist, quit."
    exit
fi
java -cp upload-image/target/upload-image.jar org.serverlessbench.UploadImage $image test.jpg $couchdb_url $COUCHDB_USERNAME $COUCHDB_PASSWORD $IMAGE_DATABASE

echo "3. uploading functions to OpenWhisk..."
wsk action update extractImageMetadata extract-image-metadata/target/extract-image-metadata.jar --main org.serverlessbench.ExtractImageMetadata --docker dplsming/java8action-imagemagic -i \
    --param COUCHDB_URL "$couchdb_url" \
    --param COUCHDB_USERNAME "$COUCHDB_USERNAME" \
    --param COUCHDB_PASSWORD "$COUCHDB_PASSWORD" \
    --param COUCHDB_DBNAME "$IMAGE_DATABASE"
 
wsk action update transformMetadata transform-metadata/target/transform-metadata.jar --main org.serverlessbench.TransformMetadata --docker openwhisk/java8action -i

wsk action update handler handler/target/handler.jar --main org.serverlessbench.Handler --docker openwhisk/java8action -i \
    --param COUCHDB_URL "$couchdb_url" \
    --param COUCHDB_USERNAME "$COUCHDB_USERNAME" \
    --param COUCHDB_PASSWORD "$COUCHDB_PASSWORD" \
    --param COUCHDB_LOGDB "$IMAGE_DATABASE_LOG"

wsk action update thumbnail thumbnail/target/thumbnail.jar --main org.serverlessbench.Thumbnail --docker openwhisk/java8action -i \
    --param COUCHDB_URL "$couchdb_url" \
    --param COUCHDB_USERNAME "$COUCHDB_USERNAME" \
    --param COUCHDB_PASSWORD "$COUCHDB_PASSWORD" \
    --param COUCHDB_DBNAME "$IMAGE_DATABASE"

wsk action update storeImageMetadata  store-image-metadata/target/store-image-metadata.jar --main org.serverlessbench.StoreImageMetadata --docker openwhisk/java8action -i \
    --param COUCHDB_URL "$couchdb_url" \
    --param COUCHDB_USERNAME "$COUCHDB_USERNAME" \
    --param COUCHDB_PASSWORD "$COUCHDB_PASSWORD" \
    --param COUCHDB_DBNAME "$IMAGE_DATABASE"

wsk action update imageProcessSequence --sequence extractImageMetadata,transformMetadata,handler,thumbnail,storeImageMetadata -i


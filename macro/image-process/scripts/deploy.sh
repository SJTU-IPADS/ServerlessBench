#!/bin/bash

if [ -z "$SERVERLESSBENCH_HOME" ]; then
    echo "$0: ERROR: SERVERLESSBENCH_HOME environment variable not set"
    exit
fi
source $SERVERLESSBENCH_HOME/local.env

couchdb_url=http://$COUCHDB_USERNAME:$COUCHDB_PASSWORD@$COUCHDB_IP:$COUCHDB_PORT

# deploy.sh should be executed in parent dir of src
ASSET_DIR=$(pwd)/assets
cd src

echo "1. building functions..."
mvn clean
mvn package

echo "2. uploading image to be processed"
image=$ASSET_DIR/test.jpg
if [ ! -f $image ]; then
    echo "image $image does not exist, quit."
    exit
fi
java -cp upload-image/target/upload-image.jar org.ipads.UploadImage $image test.jpg $couchdb_url $COUCHDB_USERNAME $COUCHDB_PASSWORD $IMAGE_DATABASE

echo "3. uploading functions to OpenWhisk..."
wsk action update extractImageMetadata extract-image-metadata/target/extract-image-metadata.jar --main org.ipads.ExtractImageMetadata --docker dplsming/java8action-imagemagic -i \
    --param COUCHDB_URL "$couchdb_url" \
    --param COUCHDB_USERNAME "$COUCHDB_USERNAME" \
    --param COUCHDB_PASSWORD "$COUCHDB_PASSWORD" \
    --param COUCHDB_DBNAME "$IMAGE_DATABASE"
 
wsk action update transformMetadata transform-metadata/target/transform-metadata.jar --main org.ipads.TransformMetadata --docker openwhisk/java8action -i

wsk action update handler handler/target/handler.jar --main org.ipads.Handler --docker openwhisk/java8action -i \
    --param COUCHDB_URL "$couchdb_url" \
    --param COUCHDB_USERNAME "$COUCHDB_USERNAME" \
    --param COUCHDB_PASSWORD "$COUCHDB_PASSWORD" \
    --param COUCHDB_LOGDB "$IMAGE_DATABASE_LOG"

wsk action update thumbnail thumbnail/target/thumbnail.jar --main org.ipads.Thumbnail --docker openwhisk/java8action -i \
    --param COUCHDB_URL "$couchdb_url" \
    --param COUCHDB_USERNAME "$COUCHDB_USERNAME" \
    --param COUCHDB_PASSWORD "$COUCHDB_PASSWORD" \
    --param COUCHDB_DBNAME "$IMAGE_DATABASE"

wsk action update storeImageMetadata  store-image-metadata/target/store-image-metadata.jar --main org.ipads.StoreImageMetadata --docker openwhisk/java8action -i \
    --param COUCHDB_URL "$couchdb_url" \
    --param COUCHDB_USERNAME "$COUCHDB_USERNAME" \
    --param COUCHDB_PASSWORD "$COUCHDB_PASSWORD" \
    --param COUCHDB_DBNAME "$IMAGE_DATABASE"

wsk action update imageProcessSequence --sequence extractImageMetadata,transformMetadata,handler,thumbnail,storeImageMetadata -i


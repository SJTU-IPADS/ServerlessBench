wsk action update extractImageMetadata extract-image-metadata/target/extract-image-metadata.jar --main org.ipads.ExtractImageMetadata --docker dplsming/java8action-imagemagic -i
wsk action update transformMetadata transform-metadata/target/transform-metadata.jar --main org.ipads.TransformMetadata --docker openwhisk/java8action -i
wsk action update handler handler/target/handler.jar --main org.ipads.Handler --docker openwhisk/java8action -i
wsk action update thumbnail thumbnail/target/thumbnail.jar --main org.ipads.Thumbnail --docker dplsming/java8action-imagemagic -i
wsk action update storeImageMetadata  store-image-metadata/target/store-image-metadata.jar --main org.ipads.StoreImageMetadata --docker openwhisk/java8action -i

wsk action update imageProcessSequence --sequence extractImageMetadata,transformMetadata,handler,thumbnail,storeImageMetadata -i

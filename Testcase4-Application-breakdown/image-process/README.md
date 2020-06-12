# Image Process Application

Image process application contains a function sequence which processes a specified image in CouchDB.

The function sequence is composed of 5 actions which will be called sequentially: extract-image-metadata, transform-metadata, handler, thumbnail, and store-image-metadata.

ACKNOWLEDGEMENT:

Image process application referred the [AWS example of image recognition and processing using AWS Step Functions](https://github.com/aws-samples/lambda-refarch-imagerecognition) to construct the application, with adaptation to OpenWhisk framework.

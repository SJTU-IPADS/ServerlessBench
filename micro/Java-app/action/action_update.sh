#!/bin/bash
docker run --rm -it -v $PWD:/action/ -w /action/ openwhisk/java8action ./build.sh

wsk -i action update complex-java JavaResize.jar --main JavaResize --docker openwhisk/java8action

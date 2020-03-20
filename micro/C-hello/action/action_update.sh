#!/bin/bash
docker run --rm -it -v $PWD:/action/ -w /action/ lqyuan980413/dockerskeleton ./build.sh
zip -r action.zip exec
wsk -i action update hello-c action.zip --docker lqyuan980413/dockerskeleton --timeout 90000


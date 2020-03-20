#!/bin/bash
docker run --rm -it -v $PWD:/action/ -w /action/ lqyuan980413/dockerskeleton:primesieve ./build.sh
zip -r action.zip exec
wsk -i action update complex-c action.zip --docker lqyuan980413/dockerskeleton:primesieve

#~/bin/bash

echo "1. building functions..."
make clean
#./fetch-submodules.sh
./autogen.sh
./configure

make -j8
sudo make install

cd src/remote
make ggfunctions-openwhisk

echo "2. uploading function to OpenWhisk..."
wsk -i action update gg --kind python:3 gg-openwhisk-function.zip --web true --memory 512

echo "3. creating OpenWhisk API..."
wsk -i api delete /guest
wsk -i api create /guest /gg-openwhisk-function post gg --response-type json

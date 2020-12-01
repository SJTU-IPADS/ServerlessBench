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
#~/bin/bash

echo "1. building functions..."
make clean
#./fetch-submodules.sh
./autogen.sh
./configure

make -j8
sudo make install

cd src/remote
rm -f gg-openwhisk-function.zip
make ggfunctions-openwhisk

echo "2. uploading function to OpenWhisk..."
wsk -i action update gg --kind python:3 gg-openwhisk-function.zip --web true --memory 512

echo "3. creating OpenWhisk API..."
wsk -i api delete /guest
wsk -i api create /guest /gg-openwhisk-function post gg --response-type json

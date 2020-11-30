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
source eval-config
result=eval-result.log
if [[ -z `wsk -i action list | grep $ACTIONNAME` ]];then
    echo "The action is not deployed, deploy it now."
    cd ../action/
    ./action_update.sh
    cd ../test
    echo -e "\n\n"
fi
if [[ -e $result ]]; then
    rm $result
fi
echo "1. measuring cold-invoke..."
./single-cold_warm.sh -m cold -t $cold_loop -r $result

echo "2. measuring warm-invoke..."
./single-cold_warm.sh -t $warm_loop -r $result

echo "3. measuring concurrent invoking..."
python3 run.py $concurrent_client $concurrent_loop $concurrent_warmup

echo "$ACTIONNAME running result: "
cat $result

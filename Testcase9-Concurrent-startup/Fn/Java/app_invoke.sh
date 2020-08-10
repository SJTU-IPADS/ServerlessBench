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
export FN_API_URL=http://127.0.0.1:7777
for i in $(seq 1 $1)
do
    invokeTime=`date +%s%3N`
    times=`fn invoke javaapp javafn`
    endTime=`date +%s%3N`
    startTime=`echo $times | jq -r '.startTime'`
    echo "invokeTime: $invokeTime, startTime: $startTime, endTime: $endTime" 
done

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
for j in {0..10}
do
    PAYLOAD_SIZE=`expr $j \* 5000`
    echo "test $PAYLOAD_SIZE payload"
    LOGFILE=result-$PAYLOAD_SIZE.csv
    echo "LOGFILE: $LOGFILE"
    for i in {1..6}
    do    
        echo "the $i-th test of $j M payload"
        echo $PAYLOAD_SIZE | fn invoke flow101 simple-flow >> $LOGFILE
    done
done
 

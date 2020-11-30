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

Sizesdic=(0 1024 5120 10240 15360 20480 25600 30720 35840 40960 46080 51200)
#Sizesdic=(0)

for payload_size in ${Sizesdic[@]}
do
    TIMES=20
    LATENCYSUM=0
    LOGFILE="test-results/Result-$payload_size.csv"
    echo "Payload size: $payload_size"
    echo "Log file: $LOGFILE"
    for i in $(seq 1 $TIMES)
    do
        invokeTime=`date +%s%3N`
        rawres=`wsk -i action invoke ParamPassSeq --param-file payload_$payload_size.json --blocking --result` 
        latency=`echo $rawres | jq -r '.comTime'`
        echo $latency
        echo $latency >> $LOGFILE
        LATENCYSUM=`expr $latency + $LATENCYSUM`
        LATENCIES[$i]=$latency
        echo "time $i finished"
    done

    # Sort the latencies
    for((i=0; i<$TIMES+1; i++)){
    for((j=i+1; j<$TIMES+1; j++)){
        if [[ ${LATENCIES[i]} -gt ${LATENCIES[j]} ]]
        then
        temp=${LATENCIES[i]}
        LATENCIES[i]=${LATENCIES[j]}
        LATENCIES[j]=$temp
        fi
        if [[ ${STARTS[i]} -gt ${STARTS[j]} ]]
        then
        temp=${STARTS[i]}
        STARTS[i]=${STARTS[j]}
        STARTS[j]=$temp
        fi
    }
    }

    echo "------------------ result ---------------------" >> $LOGFILE
    _50platency=${LATENCIES[`echo "$TIMES * 0.5"| bc | awk '{print int($0)}'`]}
    _75platency=${LATENCIES[`echo "$TIMES * 0.75"| bc | awk '{print int($0)}'`]}
    _90platency=${LATENCIES[`echo "$TIMES * 0.90"| bc | awk '{print int($0)}'`]}
    _95platency=${LATENCIES[`echo "$TIMES * 0.95"| bc | awk '{print int($0)}'`]}
    _99platency=${LATENCIES[`echo "$TIMES * 0.99"| bc | awk '{print int($0)}'`]}

    echo "Communicate Latency (ms):" >> $LOGFILE
    echo -e "Avg\t50%\t75%\t90%\t95%\t99%\t" >> $LOGFILE
    AVGLAT=`awk 'BEGIN{printf "%.2f\n",'$LATENCYSUM'/'$TIMES'}'`
    echo -e "$AVGLAT\t$_50platency\t$_75platency\t$_90platency\t$_95platency\t$_99platency\t" >> $LOGFILE
done

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

if [ -z "$TESTCASE4_HOME" ]; then
    echo "$0: ERROR: TESTCASE4_HOME environment variable not set"
    exit
fi

set -a
source $TESTCASE4_HOME/local.env

SCRIPTS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $SCRIPTS_DIR/../

ACTIONNAME=gg-openwhisk-function
IMAGENAME=python3action

PRINTLOG=false
WARMUPONLY=false
RUNONLY=false
while getopts "r:m:p:w:lWR" OPT; do
    case $OPT in
    # result file
    r)
        RESULT=$OPTARG
        ;;

    # Mode: cold or warm.
    m)
        MODE=$OPTARG
        if [[ $MODE != 'cold' && $MODE != 'warm' ]] ;then
            echo "usage: "
            echo "./single-code_warm -m <mode> -t <loop times> -w <warm ups>"
            echo 'mode: warm, cold'
            exit
        fi
        ;;
    
    # The client number
    p)
        JOBS=$OPTARG
        expr $JOBS + 0 &>/dev/null
        if [[ $? != 0 ]] || [[ $JOBS -lt 1 ]]; then
            echo "Error: jobs (parallel) must be a positive integer"
            exit
        fi
        ;;
    
    # The warm up times
    w)
        WARMUP=$OPTARG
        expr $WARMUP + 0 &>/dev/null
        if [[ $? != 0 ]] || [[ $WARMUP -lt 1 ]]; then
            echo "Error: warm up times must be a positive integer"
            exit
        fi
        ;;

    # Output the results to the log with this argument.
    l)
        PRINTLOG=true
        ;;

    ?)
        echo "unknown arguments"
    esac
done

if [[ -z $MODE ]];then
    echo "default mode: warm"
    MODE="warm"
fi

if [[ $MODE = "warm" ]] && [[ -z $WARMUP ]] && [[ $RUNONLY = false ]]; then
    echo "default warm up times: 1"
    WARMUP=1
fi

# mode = warm: kill all the running containers and then warm up
if [[ $MODE = "warm" && $RUNONLY = false ]]; then
    echo "Warm up.."
    if [[ -n `docker ps | grep $IMAGENAME | awk {'print $1'}` ]];then
        echo 'Stop the running container..'
        docker stop `docker ps | grep $IMAGENAME | awk {'print $1'}`
    fi
    for i in $(seq 1 $WARMUP)
    do
        echo "The $i-th warmup..."
        $SCRIPTS_DIR/setup.sh
	    cd llvm-build
        $SCRIPTS_DIR/action_invoke.sh $JOBS > /dev/null
	    cd ..
    done
    echo "Warm up complete"
    if [[ $WARMUPONLY = true ]]; then
        echo "No real action is needed."
        exit
    fi
fi


LOGFILE=$ACTIONNAME-$MODE.csv

if [[ $PRINTLOG = true && ! -e $LOGFILE ]]; then
    echo logfile:$LOGFILE
    echo "invokeTime,endTime" > $LOGFILE
fi

# For parallel online-compiling, just run once
if [[ $MODE = 'cold' ]]; then
    echo 'Stop the running container..'
    docker stop `docker ps | grep $IMAGENAME | awk {'print $1'}`
fi

$SCRIPTS_DIR/setup.sh
cd llvm-build
invokeTime=`date +%s%3N`
$SCRIPTS_DIR/action_invoke.sh $JOBS
endTime=`date +%s%3N`
cd ..

# check invoke result
python3 $SCRIPTS_DIR/checkInvoke.py "${output[@]}"
if [[ $? -eq 0 ]]; then
    echo "invokeTime: $invokeTime, endTime: $endTime"
    latency=`expr $endTime - $invokeTime`
    success=true
else
    latency=-1
    success=false
fi

echo "------------------ result ---------------------"
if [ "$success" = true ]; then
    echo "Invocation SUCCEED!"
    echo "Latency (ms): $latency"
else
    echo "Invocation FAILED!"
fi

# output to result file
if [ ! -z $RESULT ]; then
    echo -e "\n\n------------------ (concurrent)result ---------------------" >> $RESULT
    echo "mode: $MODE, concurrency: $JOBS, warmup_times: $WARMUP" >> $RESULT
    if [ "$success" = true ]; then
        echo "Invocation SUCCEED!" >> $RESULT
        echo "Latency (ms): $latency" >> $RESULT
    else
        echo "Invocation FAILED!" >> $RESULT
    fi
fi

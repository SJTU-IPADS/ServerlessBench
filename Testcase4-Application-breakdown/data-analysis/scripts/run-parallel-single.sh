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

# This script should be invoked in parent dir of scripts

SCRIPTS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

ACTIONNAME=wage-insert
IMAGENAME=wage

PRINTLOG=false
WARMUPONLY=false
RUNONLY=false
while getopts "m:t:w:b:lWR" OPT; do
    case $OPT in
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
    
    # The loop time
    t)
        TIMES=$OPTARG
        expr $TIMES + 0 &>/dev/null
        if [[ $? != 0 ]] || [[ $TIMES -lt 1 ]]; then
            echo "Error: loop times must be a positive integer"
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
    
    # The base id
    b)
        BASE=$OPTARG
        expr $BASE + 0 &>/dev/null
        if [[ $? != 0 ]] || (( BASE < 0 )); then
            echo "Error: base id ($BASE) must not be a negative integer"
            exit
        fi
        ;;

    # Output the results to the log with this argument.
    l)
        PRINTLOG=true
        ;;

    # "Warm up only" with this argument: warm up and then exit with no output.
    W)
        if [[ $RUNONLY = true || $MODE = "cold" ]]; then
            echo "Error: contradictory arguments"
            exit
        fi
        echo "Warm up only mode."
        WARMUPONLY=true
        ;;
    
    # "Run only" with this argument: invoke the first action without warm up. Paused containers are needed.
    R)
        if [[ $WARMUPONLY = true ]]; then
            echo "Error: contradictory arguments"
            exit
        fi
        # If there's no paused container, the mode should not be supported
        if [[ -z `docker ps | grep $IMAGENAME | awk {'print $1'}` ]];then
            echo "Error: could not find paused containers of the action"
            exit
        fi
        echo "Run only mode"
        RUNONLY=true
        ;;
    ?)
        echo "unknown arguments"
    esac
done

if [[ -z $MODE ]];then
    echo "default mode: warm"
    MODE="warm"
fi

if [[ -z $TIMES && $WARMUPONLY = false ]]; then
    if [ $MODE = "warm" ];then
        echo "default warm loop times: 10"
        TIMES=10
    else
        echo "default cold loop times: 3"
        TIMES=3
    fi
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
        $SCRIPTS_DIR/input_generator.sh $(( 1000 * BASE + 500000 + i )) myname staff 1000 2000 $BASE
        wsk -i action invoke $ACTIONNAME --param-file $SCRIPTS_DIR/parameters-$BASE.json --result --blocking
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

LATENCYSUM=0

#rm start-$BASE.log

for i in $(seq 1 $TIMES)
do
    if [[ $MODE = 'cold' ]]; then
        echo 'Stop the running container..'
        docker stop `docker ps | grep $IMAGENAME | awk {'print $1'}`
    fi

    echo Measure $MODE start up time: no.$i
   
    $SCRIPTS_DIR/input_generator.sh $(( 1000 * BASE + 1000000 + i )) myname staff 3000 2000 $BASE
    invokeTime=$(date -d "-8 hours" '+%Y-%m-%dT%H:%M:%S.%N')Z
    wsk -i action invoke $ACTIONNAME --param-file $SCRIPTS_DIR/parameters-$BASE.json --result --blocking
    echo "$invokeTime DATA-ANALYSIS starts" 
done

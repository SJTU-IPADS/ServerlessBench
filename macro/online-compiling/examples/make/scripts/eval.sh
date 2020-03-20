#!/bin/bash

if [ -z "$SERVERLESSBENCH_HOME" ]; then
    echo "$0: ERROR: SERVERLESSBENCH_HOME environment variable not set"
    exit
fi

source $SERVERLESSBENCH_HOME/eval-config

SCRIPTS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $SCRIPTS_DIR/../

result=$(pwd)/eval-result.log
rm -f $result 

echo "1. measuring cold-invoke..."
$SCRIPTS_DIR/run-single.sh -m cold -t $cold_loop -r $result

echo "2. measuring warm-inovke..."
$SCRIPTS_DIR/run-single.sh -m warm -t $warm_loop -w $warm_warmup -r $result

echo "3. measuring concurrent invoking..."
$SCRIPTS_DIR/run-parallel.sh -m warm -p $concurrent_client -w $concurrent_warmup -r $result

echo "online-compiling application running result: "
cat $result

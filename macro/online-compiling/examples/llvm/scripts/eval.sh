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

# single execution takes too long so we don't measure it for online-compiling (llvm)
echo "measuring concurrent invoking..."
$SCRIPTS_DIR/run-parallel.sh -m warm -p $concurrent_client -w $concurrent_warmup -r $result

echo "online-compiling application running result: "
cat $result

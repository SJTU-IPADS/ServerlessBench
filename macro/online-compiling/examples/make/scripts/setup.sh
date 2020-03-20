#!/bin/bash

if [ -z "$SERVERLESSBENCH_HOME" ]; then
    echo "$0: ERROR: SERVERLESSBENCH_HOME environment variable not set"
    exit
fi

set -a
source $SERVERLESSBENCH_HOME/local.env


SCRIPTS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $SCRIPTS_DIR/../

echo GG_MODELPATH=$GG_MODELPATH
echo GG_STORAGE_URI=$GG_STORAGE_URI

printf "1. Clear workspace\n"
$SCRIPTS_DIR/clear.sh

cd src
printf "2. Initialize gg\n"
gg init

printf "3. Create thunks for building hello\n"
gg infer make hellomake

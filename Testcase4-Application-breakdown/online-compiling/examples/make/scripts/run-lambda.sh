#!/bin/bash

if [ -z "$GG_MODELPATH" ]; then
    echo "$0: ERROR: GG_MODELPATH environment variable not set"
    exit
else
    echo GG_MODELPATH=$GG_MODELPATH
fi

if [ -z "$GG_STORAGE_URI" ]; then
    echo "$0: ERROR: GG_STORAGE_URI environment variable not set"
    exit
else
    echo GG_STORAGE_URI=$GG_STORAGE_URI
fi

if [ -z "$AWS_ACCESS_KEY_ID" ]; then
    echo "$0: ERROR: AWS_ACCESS_KEY_ID environment variable not set"
    exit
fi

if [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
    echo "$0: ERROR: AWS_SECRET_ACCESS_KEY environment variable not set"
    exit
fi

if [ -z "$AWS_REGION" ]; then
    echo "$0: ERROR: AWS_REGION environment variable not set"
    exit
fi

SCRIPTS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $SCRIPTS_DIR/../

USAGE="$0 <JOBS-COUNT>"

JOBS_COUNT=${1?$USAGE}

printf "1. Clear workspace\n"
$SCRIPTS_DIR/clear.sh

cd src
printf "2. Initialize gg\n"
gg init

printf "3. Create thunks for building hello\n"
gg infer make hellomake

printf "4. Build hello\n"
gg force --jobs=$JOBS_COUNT --engine=lambda hellomake

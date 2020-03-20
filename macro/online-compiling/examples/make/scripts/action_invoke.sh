#!/bin/bash

# action_invoke.sh should be called in the directory with .gg (created by gg init)

USAGE="$0 <JOBS-COUNT>"

JOBS_COUNT=${1?$USAGE}

gg force --jobs=$JOBS_COUNT --engine=openwhisk hellomake 
#gg force --jobs=$JOBS_COUNT --engine=local bin/llvm-tblgen

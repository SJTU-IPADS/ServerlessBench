#!/bin/bash

USAGE="$0 <JOBS-COUNT>"

JOBS_COUNT=${1?$USAGE}

gg force --jobs=$JOBS_COUNT --engine=openwhisk bin/llvm-tblgen 

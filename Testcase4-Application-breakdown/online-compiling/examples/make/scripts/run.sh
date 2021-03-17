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

USAGE="$0 <JOBS-COUNT>"

JOBS_COUNT=${1?$USAGE}

echo GG_MODELPATH=$GG_MODELPATH
echo GG_STORAGE_URI=$GG_STORAGE_URI

printf "1. Clear workspace\n"
$SCRIPTS_DIR/clear.sh

cd src
printf "2. Initialize gg\n"
gg init

printf "3. Create thunks for building hello\n"
gg infer make hellomake

printf "4. Build hello\n"
gg force --jobs=$JOBS_COUNT --engine=openwhisk hellomake
#gg force --jobs=$JOBS_COUNT --engine=local bin/llvm-tblgen

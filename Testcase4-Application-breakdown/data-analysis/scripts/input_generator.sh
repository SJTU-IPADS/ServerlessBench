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

if [[ $# -lt 6 ]]; then
    echo "Usage: ./input_generator.sh <id> <name> <role> <base> <merit> <fid>"
fi

SCRIPTS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

id=$1
name=$2
role=$3
base=$4
merit=$5
paramFile="$SCRIPTS_DIR/parameters-$6.json"
operator=$6

rm -f $paramFile

echo "{" > $paramFile
echo "    \"id\": $id," >> $paramFile
echo "    \"name\": \"$name\"," >> $paramFile
echo "    \"role\": \"$role\"," >> $paramFile
echo "    \"base\": $base," >> $paramFile
echo "    \"merit\": $merit," >> $paramFile
echo "    \"operator\": $operator" >> $paramFile
echo "}" >> $paramFile

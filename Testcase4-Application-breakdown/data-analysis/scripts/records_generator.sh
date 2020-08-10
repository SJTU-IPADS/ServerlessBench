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

if [[ $# -lt 1 ]]; then
    echo "Usage: ./records_generator.sh <number>"
fi

SCRIPTS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

number=$1
outputFile="$SCRIPTS_DIR/records.json"

rm -f $outputFile

INSURANCE=1500
TAXDIGIT=9613
roles=("staff" "manager" "teamleader")
bases=(5000 8000 8000)
merit_max=(5000 10000 50000)
# Seed random generator
RANDOM=$$$(date +%s)

echo "{" > $outputFile
echo "    \"docs\" : [" >> $outputFile

for id in $(seq 1 $(( number - 1 )) )
do
    name=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 8 | head -n 1)
    sel=$[$RANDOM % ${#roles[@]}]
    role=${roles[$sel]}
    base=${bases[$sel]}
    merit=$[$RANDOM % ${merit_max[$sel]}]
    total=$(( base + merit + INSURANCE ))
    realpay=$(( (base + merit) * TAXDIGIT / 10000 ))
    echo "name: $name, role: $role, base: $base, merit: $merit, INSURANCE: $INSURANCE, total: $total, realpay: $realpay"

    echo "      {" >> $outputFile
    echo "          \"_id\": \"id$id\"," >> $outputFile
    echo "          \"wage-person\": {" >> $outputFile
    echo "              \"id\": $id," >> $outputFile
    echo "              \"name\": \"$name\"," >> $outputFile
    echo "              \"role\": \"$role\"," >> $outputFile
    echo "              \"base\": $base," >> $outputFile
    echo "              \"merit\": $merit," >> $outputFile
    echo "              \"INSURANCE\": $INSURANCE," >> $outputFile
    echo "              \"total\": $total," >> $outputFile
    echo "              \"realpay\": $realpay," >> $outputFile
    echo "              \"operator\": 0" >> $outputFile
    echo "          }" >> $outputFile
    echo "      }," >> $outputFile
done

# output final record
id=$number
name=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 8 | head -n 1)
sel=$[$RANDOM % ${#roles[@]}]
role=${roles[$sel]}
base=${bases[$sel]}
merit=$[$RANDOM % ${merit_max[$sel]}]
total=$(( base + merit + INSURANCE ))
realpay=$(( (base + merit) * TAXDIGIT / 10000 ))
echo "name: $name, role: $role, base: $base, merit: $merit, INSURANCE: $INSURANCE, total: $total, realpay: $realpay"

echo "      {" >> $outputFile
echo "          \"_id\": \"id$id\"," >> $outputFile
echo "          \"wage-person\": {" >> $outputFile
echo "              \"id\": $id," >> $outputFile
echo "              \"name\": \"$name\"," >> $outputFile
echo "              \"role\": \"$role\"," >> $outputFile
echo "              \"base\": $base," >> $outputFile
echo "              \"merit\": $merit," >> $outputFile
echo "              \"INSURANCE\": $INSURANCE," >> $outputFile
echo "              \"total\": $total," >> $outputFile
echo "              \"realpay\": $realpay," >> $outputFile
echo "              \"operator\": 0" >> $outputFile
echo "          }" >> $outputFile
echo "      }" >> $outputFile
echo "    ]" >> $outputFile
echo "}" >> $outputFile

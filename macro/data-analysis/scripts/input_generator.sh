#!/bin/bash

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

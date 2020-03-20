#!/bin/bash
ERROR="{\"error\":\"Wrong arguments.\"}"

read ARGS
SIZE=`echo "$ARGS" | jq -r '."size"'`
WORK=`echo "$ARGS" | jq -r '."work"'`

if [[ $SIZE = "null" ]] || [[ $WORK = "null" ]]; then
    echo $ERROR
    exit
fi

expr $SIZE + 0 &>/dev/null
# SIZE must > 512
if [[ $? != 0 ]] || [[ $SIZE -lt 512 ]]; then
    echo $ERROR
    exit
fi

if [[ $WORK != 'rd' ]] && [[ $WORK != 'wr' ]] && [[ $WORK != 'rdwr' ]] && [[ $WORK != 'cp' ]] && [[ $WORK != 'frd' ]] && [[ $WORK != 'fwr' ]] && [[ $WORK != 'fcp' ]] && [[ $WORK != 'bzero' ]] && [[ $WORK != 'bcopy' ]]; then
    echo $ERROR
    exit
fi

BWARG=""

PARALLELISM=`echo "$ARGS" | jq -r '."parallelism"'`
if [[ $PARALLELISM != 'null' ]]; then
    BWARG=`echo "$BWARG -P $PARALLELISM"`
fi

WARMUPS=`echo "$ARGS" | jq -r '."warmups"'`
if [[ $WARMUPS != 'null' ]]; then
    BWARG=`echo "$BWARG -W $WARMUPS"`
fi

REPETITIONS=`echo "$ARGS" | jq -r '."repetitions"'`
if [[ $REPETITIONS != 'null' ]]; then
    BWARG=`echo "$BWARG -N $REPETITIONS"`
fi

BWARG=`echo "$BWARG $SIZE $WORK"`
echo "size: "$SIZE
echo "work: "$WORK
echo "args: "$BWARG
RES=`./bw_mem_static $BWARG`

echo $RES

#!/bin/bash
wsk -i action update arraySum_chained arraySum_chained.js --memory 256 --docker lqyuan980413/wsk-fibonacci
if [[ $# < 1 ]];then
    n=100
else
    expr $1 + 0 &> /dev/null
    if [[ $? != 0 ]]; then
        echo "Argument error: the n should be integer"
	echo "usage: ./action_update [n]"
        exit
    fi
    n_minus_1=`expr $1 - 1`
fi
cmd="wsk -i action update arraySum_sequence --sequence arraySum_chained"
for i in $(seq 1 $n_minus_1)
do
    cmd=`echo "$cmd,arraySum_chained"`
done
$cmd
# wsk -i action update arraySum_sequence --sequence arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained

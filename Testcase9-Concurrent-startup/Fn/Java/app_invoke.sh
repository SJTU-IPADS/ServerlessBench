#!/bin/bash
export FN_API_URL=http://127.0.0.1:7777
for i in $(seq 1 $1)
do
    invokeTime=`date +%s%3N`
    times=`fn invoke javaapp javafn`
    endTime=`date +%s%3N`
    startTime=`echo $times | jq -r '.startTime'`
    echo "invokeTime: $invokeTime, startTime: $startTime, endTime: $endTime" 
done
#!/bin/bash

t=1
if [ $# != 1 ]
then
    echo "Warning: run times not provided, default to $t" 
else
    t=$1
fi

CONTROLLER_LOG=~/tmp/openwhisk/controller/logs/controller-local_logs.log
INVOKER_LOG=~/tmp/openwhisk/invoker/logs/invoker-local_logs.log

sudo chmod 666 $CONTROLLER_LOG
sudo chmod 666 $INVOKER_LOG

echo "THIS IS A NEW BEGINNING" > ~/tmp/openwhisk/controller/logs/controller-local_logs.log
echo "THIS IS A NEW BEGINNING" > ~/tmp/openwhisk/invoker/logs/invoker-local_logs.log 

# remove pausing docker to observe a cold start (the first one)
docker ps -a | awk '{ print $1,$2 }' | grep python3action:nightly | awk '{print $1 }' | xargs -I {} docker rm -f {}

for i in $(seq 1 $t)
do
    start_time=$(date -d "-8 hours" '+%Y-%m-%dT%H:%M:%S.%N')Z
    echo "[$start_time] >>>>>>>>>>>>>>>>>>>>>> YELLY GG starts [$i]"
    echo "[$start_time] >>>>>>>>>>>>>>>>>>>>>> YELLY GG starts [$i]" >> $CONTROLLER_LOG
    echo "[$start_time] >>>>>>>>>>>>>>>>>>>>>> YELLY GG starts [$i]" >> $INVOKER_LOG

    ./bin/run.sh 1

    end_time=$(date -d "-8 hours" '+%Y-%m-%dT%H:%M:%S.%N')Z
    echo "[$end_time] >>>>>>>>>>>>>>>>>>>>>> YELLY GG ends [$i]"
    echo "[$end_time] >>>>>>>>>>>>>>>>>>>>>> YELLY GG ends [$i]" >> $CONTROLLER_LOG
    echo "[$end_time] >>>>>>>>>>>>>>>>>>>>>> YELLY GG ends [$i]" >> $INVOKER_LOG
done


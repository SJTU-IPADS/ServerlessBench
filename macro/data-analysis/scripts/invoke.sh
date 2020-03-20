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
docker ps -a | awk '{ print $1,$2 }' | grep action-nodejs-v10:nightly | awk '{print $1 }' | xargs -I {} docker rm -f {}
docker ps -a | awk '{ print $1,$2 }' | grep nodejs6action:nightly | awk '{print $1 }' | xargs -I {} docker rm -f {}

id=111
for i in $(seq 1 $t)
do
    start_time=$(date -d "-8 hours" '+%Y-%m-%dT%H:%M:%S.%N')Z
    echo "[$start_time] >>>>>>>>>>>>>>>>>>>>>> YELLY DATA-ANALYSIS starts [$i]"
    echo "[$start_time] >>>>>>>>>>>>>>>>>>>>>> YELLY DATA-ANALYSIS starts [$i]" >> $CONTROLLER_LOG
    echo "[$start_time] >>>>>>>>>>>>>>>>>>>>>> YELLY DATA-ANALYSIS starts [$i]" >> $INVOKER_LOG

#    wsk -i action invoke wage-insert --param id $id --param name yelly --param role staff --param base 2000 --param merit 3000 --result --blocking 
    wsk -i action invoke wage-insert --param id $id --param-file parameters.json --result --blocking 

    end_time=$(date -d "-8 hours" '+%Y-%m-%dT%H:%M:%S.%N')Z
    echo "[$end_time] >>>>>>>>>>>>>>>>>>>>>> YELLY DATA-ANALYSIS ends [$i]"
    echo "[$end_time] >>>>>>>>>>>>>>>>>>>>>> YELLY DATA-ANALYSIS ends [$i]" >> $CONTROLLER_LOG
    echo "[$end_time] >>>>>>>>>>>>>>>>>>>>>> YELLY DATA-ANALYSIS ends [$i]" >> $INVOKER_LOG

#    sleep 15
    id=$[$id+1]
done


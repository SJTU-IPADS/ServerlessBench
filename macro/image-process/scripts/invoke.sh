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

echo "THIS IS NEW BEGINNING OF IMAGE PROCESSING" > $CONTROLLER_LOG
echo "THIS IS NEW BEGINNING OF IMAGE PROCESSING" > $INVOKER_LOG

for i in $(seq 1 $t)
do
    start_time=$(date -d "-8 hours" '+%Y-%m-%dT%H:%M:%S.%N')Z
    echo "[$start_time] >>>>>>>>>>>>>>>>>>>>>> YELLY ImageProcessing starts [$i]"
    echo "[$start_time] >>>>>>>>>>>>>>>>>>>>>> YELLY ImageProcessing starts [$i]" >> $CONTROLLER_LOG
    echo "[$start_time] >>>>>>>>>>>>>>>>>>>>>> YELLY ImageProcessing starts [$i]" >> $INVOKER_LOG

    wsk action invoke imageProcessSequence -i --result --param imageName test.jpg

    end_time=$(date -d "-8 hours" '+%Y-%m-%dT%H:%M:%S.%N')Z
    echo "[$end_time] >>>>>>>>>>>>>>>>>>>>>> YELLY ImageProcessing ends [$i]"
    echo "[$end_time] >>>>>>>>>>>>>>>>>>>>>> YELLY ImageProcessing ends [$i]" >> $CONTROLLER_LOG
    echo "[$end_time] >>>>>>>>>>>>>>>>>>>>>> YELLY ImageProcessing ends [$i]" >> $INVOKER_LOG
done

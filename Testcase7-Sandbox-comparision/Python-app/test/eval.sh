#!/bin/bash
source eval-config
result=eval-result.log
if [[ -z `wsk -i action list | grep $ACTIONNAME` ]];then
    echo "The action is not deployed, deploy it now."
    cd ../action/
    ./action_update.sh
    cd ../test
    echo -e "\n\n"

fi
if [[ -e $result ]]; then
    rm $result
fi
echo "1. measuring cold-invoke..."
./single-cold_warm.sh -m cold -t $cold_loop -r $result

echo "2. measuring warm-invoke..."
./single-cold_warm.sh -t $warm_loop -r $result

echo "3. measuring concurrent invoking..."
python3 run.py $concurrent_client $concurrent_loop $concurrent_warmup

echo "$ACTIONNAME running result: "
cat $result

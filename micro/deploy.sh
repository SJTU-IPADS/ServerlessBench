#!/bin/bash
RUNTIME=("C" "Java" "Nodejs" "Python" "Ruby")
MODE=("hello" "app")
APPDIR=("Lmbench" "Alu" "Sequence/Sequence-chained")
DIR=$PWD

for i in ${RUNTIME[@]}
do
    for j in ${MODE[@]}
    do
        cd ./$i-$j/action/
        ./action_update.sh
        cd $DIR
    done
done

for app in ${APPDIR[@]}
do
    cd ./$app/action
    ./action_update.sh
    cd $DIR
done


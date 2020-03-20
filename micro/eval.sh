#!/bin/bash
result=eval-result.log
RUNTIME=("C" "Java" "Nodejs" "Python" "Ruby")
MODE=("hello" "app")
APPDIR=("Lmbench" "Alu" "Sequence/Sequence-chained")
DIR=$PWD
if [[ -f $result ]]; then
    rm $result
fi
for i in ${RUNTIME[@]}
do
    for j in ${MODE[@]}
    do
        echo -e "\nmeasuring $i-$j application..."
        cd ./$i-$j/test/
        ./eval.sh
        cd $DIR
        echo -e "\n\n$i-$j:\n" >> $result
        cat ./$i-$j/test/$result >> $result
    done
done

for app in ${APPDIR[@]}
do
    echo -e "\nmeasuring $app application..."
    cd ./$app/test
    ./eval.sh
    cd $DIR
    echo -e "\n\n$app:\n" >> $result
    cat ./$app/test/$result >> $result
done

echo "serverless micro result: "
cat $result

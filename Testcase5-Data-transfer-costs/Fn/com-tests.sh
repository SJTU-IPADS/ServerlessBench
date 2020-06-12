#!/bin/bash
for j in {0..10}
do
    PAYLOAD_SIZE=`expr $j \* 5000`
    echo "test $PAYLOAD_SIZE payload"
    LOGFILE=result-$PAYLOAD_SIZE.csv
    echo "LOGFILE: $LOGFILE"
    for i in {1..6}
    do    
        echo "the $i-th test of $j M payload"
        echo $PAYLOAD_SIZE | fn invoke flow101 simple-flow >> $LOGFILE
    done
done
 

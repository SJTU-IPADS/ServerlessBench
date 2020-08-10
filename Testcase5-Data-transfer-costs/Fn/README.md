This application evaluates the communication time of different payload sizes between chained functions with Fn flow.

## Prerequisite
1. Setup fn server and fn flow server
2. configure environment variable `FLOWSERVER_IP`

## Deploy
```
./update.sh
```

## Run
1. Test the correctness:
```
echo $PARAM_SIZE | fn invoke flow101 simple-flow
```
`PARAM_SIZE` is the payload size between functions, in bytes.

2. Calculate the communication time with different payload sizes:
```
./com-tests.sh
```
The communication times for each `PARAM_SIZE` configuration is listed in result-`PARAM_SIZE`.csv files

## NOTICE
The Fn workload refers to the helloworld project of Fnproject (https://github.com/fnproject), which is licensed by Apache License 2.0
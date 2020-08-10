
# Copyright (c) 2020 Institution of Parallel and Distributed System, Shanghai Jiao Tong University
# ServerlessBench is licensed under the Mulan PSL v1.
# You can use this software according to the terms and conditions of the Mulan PSL v1.
# You may obtain a copy of Mulan PSL v1 at:
#     http://license.coscl.org.cn/MulanPSL
# THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR
# PURPOSE.
# See the Mulan PSL v1 for more details.

import random
import time
import boto3
import threading
import json 

AluFunctionArn = 'Your AWS Arn of the ALU function (doAlu.py)'
def parallel_handler(event, context):
    startTime = GetTime()
    if 'n' in event:
        times = event['n']
        parallelIndex = event['parallelIndex']
        temp = alu(times,parallelIndex)
        tot_exec = 0
        tempdict = eval(temp)
        for execTime in tempdict:
            print(execTime)
            tot_exec += int(execTime)
        avg_exec = tot_exec / parallelIndex
        return{
            'result': temp,
            'avg_exec':avg_exec,
            'times': times,
            'execTime': GetTime() - startTime
        }
    else:
        return{
            'error': "No n in event"
        }
    


def GetTime():
    return int(round(time.time() * 1000))

def alu(times, parallelIndex):
    botoClient = boto3.client('lambda')
    payload = bytes("{\"n\": %d}" %(times / parallelIndex), encoding="utf8")
    resultTexts = []
    threads = []
    for i in range(parallelIndex):
        t = threading.Thread(target=singleAlu, args=(payload, resultTexts, botoClient, i))
        threads.append(t)
        resultTexts.append('')
    for i in range(parallelIndex):
        threads[i].start()
    for i in range(parallelIndex):
        threads[i].join()

    return str(resultTexts)

def singleAlu(payload, resultTexts, botoClient, clientId):
    clientStartTime = GetTime()
    response = botoClient.invoke(
        FunctionName = AluFunctionArn,
        Payload = payload,
    )
    clientEndTime = GetTime()
    clientExecTime = clientEndTime - clientStartTime
    singleAluTimeinfo = "client %d startTime: %s, retTime: %s, execTime %s" %(clientId, clientStartTime, clientEndTime, clientExecTime)
    result = json.loads(response['Payload'].read())
    resultTexts[clientId] = str(result['execTime'])
    print("client %d finished" %clientId)
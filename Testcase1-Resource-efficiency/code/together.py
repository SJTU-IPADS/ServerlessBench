
# Copyright (c) 2020 Institution of Parallel and Distributed System, Shanghai Jiao Tong University
# ServerlessBench is licensed under the Mulan PSL v1.
# You can use this software according to the terms and conditions of the Mulan PSL v1.
# You may obtain a copy of Mulan PSL v1 at:
#     http://license.coscl.org.cn/MulanPSL
# THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR
# PURPOSE.
# See the Mulan PSL v1 for more details.

import boto3
import time
import os
import random
from multiprocessing import Process, Pipe

bucketName = "resource-efficient"
defaultKey = "loopTime.txt"
defaultLoopTime = 10000000
defaultParallelIndex = 100

def lambda_handler(event, context):
    startTime = GetTime()
    if 'key' in event:
        key = event['key']
    else:
        key = defaultKey

    download_file(key)
    loopTime = extractLoopTime(key)

    retTime = GetTime()
    result1 = {
        "startTime": startTime,
        "retTime": retTime,
        "execTime": retTime - startTime,
        "loopTime": loopTime,
        "key": key
    }
    return alu_handler(result1,"")


def download_file(key):
    filepath = "/tmp/%s" %key

    s3 = boto3.client('s3')
    with open(filepath, 'wb+') as f:
        s3.download_fileobj(bucketName, key, f)


def extractLoopTime(key):
    filepath = "/tmp/%s" %key
    txtfile = open(filepath, 'r')
    loopTime = int(txtfile.readline())
    print("loopTime: " + str(loopTime))
    txtfile.close()
    return loopTime

def alu_handler(event, context):
    startTime = GetTime()
    if 'execTime' in event:
        execTime_prev = event['execTime']
    else:
        execTime_prev = 0
    if 'loopTime' in event:
        loopTime = event['loopTime']
    else:
        loopTime = defaultLoopTime
    parallelIndex = defaultParallelIndex
    temp = alu(loopTime, parallelIndex)
    retTime = GetTime()
    return {
        "startTime": startTime,
        "retTime": retTime,
        "execTime": retTime - startTime,
        "result": temp,
        'execTime_prev': execTime_prev
    }

def doAlu(times, childConn, clientId):
    a = random.randint(10, 100)
    b = random.randint(10, 100)
    temp = 0
    for i in range(times):
        if i % 4 == 0:
            temp = a + b
        elif i % 4 == 1:
            temp = a - b
        elif i % 4 == 2:
            temp = a * b
        else:
            temp = a / b
    print(times)
    childConn.send(temp)
    childConn.close()
    return temp

def alu(times, parallelIndex):
    per_times = int(times / parallelIndex)
    threads = []
    childConns = []
    parentConns = []
    for i in range(parallelIndex):
        parentConn, childConn = Pipe()
        parentConns.append(parentConn)
        childConns.append(childConn)
        t = Process(target=doAlu, args=(per_times, childConn, i))
        threads.append(t)
    for i in range(parallelIndex):
        threads[i].start()
    for i in range(parallelIndex):
        threads[i].join()
    
    results = []
    for i in range(parallelIndex):
        results.append(parentConns[i].recv())
    return str(results)

def GetTime():
    return int(round(time.time() * 1000))
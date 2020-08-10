
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
from multiprocessing import Process, Pipe


def parallel_handler(event, context):
    startTime = GetTime()
    if 'n' in event:
        times = event['n']
        parallelIndex = event['parallelIndex']
        temp = alu(times,parallelIndex)
        return{
            'result': temp,
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
    per_times = int(times / parallelIndex)
    threads = []
    childConns = []
    parentConns = []
    for i in range(parallelIndex):
        parentConn, childConn = Pipe()
        parentConns.append(parentConn)
        childConns.append(childConn)
        t = Process(target=singleAlu, args=(per_times, childConn, i))
        threads.append(t)
    for i in range(parallelIndex):
        threads[i].start()
    for i in range(parallelIndex):
        threads[i].join()
    
    results = []
    for i in range(parallelIndex):
        results.append(parentConns[i].recv())
    return str(results)


def singleAlu(times, childConn, clientId):
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
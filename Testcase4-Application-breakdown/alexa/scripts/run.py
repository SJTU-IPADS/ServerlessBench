
# Copyright (c) 2020 Institution of Parallel and Distributed System, Shanghai Jiao Tong University
# ServerlessBench is licensed under the Mulan PSL v1.
# You can use this software according to the terms and conditions of the Mulan PSL v1.
# You may obtain a copy of Mulan PSL v1 at:
#     http://license.coscl.org.cn/MulanPSL
# THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR
# PURPOSE.
# See the Mulan PSL v1 for more details.

import os
import threading
import time
import sys, getopt

# this script should be executed in parent dir of scripts

def client(i,results,loopTimes):
    print("client %d start" %i)
    ALEXA_HOME=os.environ['TESTCASE4_HOME'] + "/alexa"
    command = "%s/scripts/run-single.sh -R -t " %ALEXA_HOME + str(loopTimes)
    r = os.popen(command)  
    text = r.read()  
    results[i] = text
    print("client %d finished" %i)

def warmup(i,warmupTimes):
    for j in range(warmupTimes):
        ALEXA_HOME=os.environ['TESTCASE4_HOME'] + "/alexa"
        r = os.popen("%s/scripts/action_invoke.sh" %ALEXA_HOME)  
        text = r.read() 
    print("client %d warmup finished" %i) 

def main():
    argv = getargv()
    clientNum = argv[0]
    loopTimes = argv[1]
    warmupTimes = argv[2]
    threads = []
    
    containerName = "alexa"

    r = os.popen("docker stop `docker ps | grep %s | awk {'print $1'}`" %containerName)
    r.read()

    # First: warm up
    for i in range(clientNum):
        t = threading.Thread(target=warmup,args=(i,warmupTimes))
        threads.append(t)

    for i in range(clientNum):
        threads[i].start()

    for i in range(clientNum):
        threads[i].join()    
    print("Warm up complete")
    # Second: invoke the actions
    # Initialize the results and the clients
    threads = []
    results = []

    for i in range(clientNum):
        results.append('')

    # Create the clients
    for i in range(clientNum):
        t = threading.Thread(target=client,args=(i,results,loopTimes))
        threads.append(t)

    # start the clients
    for i in range(clientNum):
        threads[i].start()

    for i in range(clientNum):
        threads[i].join()


    outfile = open("result.csv","w")
    outfile.write("invokeTime,endTime\n")
   
    latencies = []
    minInvokeTime = 0x7fffffffffffffff
    maxEndTime = 0
    for i in range(clientNum):
        # get and parse the result of a client
        clientResult = parseResult(results[i])
        # print the result of every loop of the client
        for j in range(len(clientResult)):
            outfile.write(clientResult[j][0] + ',' + clientResult[j][1] + '\n') 
        
            # Collect the latency
            latency = int(clientResult[j][-1]) - int(clientResult[j][0])
            latencies.append(latency)

            # Find the first invoked action and the last return one.
            if int(clientResult[j][0]) < minInvokeTime:
                minInvokeTime = int(clientResult[j][0])
            if int(clientResult[j][-1]) > maxEndTime:
                maxEndTime = int(clientResult[j][-1])

    formatResult(latencies,maxEndTime - minInvokeTime, clientNum, loopTimes, warmupTimes)

def parseResult(result):
    lines = result.split('\n')
    parsedResults = []
    for line in lines:
        if line.find("invokeTime") == -1:
            continue
        parsedTimes = ['','']

        i = 0
        count = 0
        while count < 2:
            while i < len(line):
                if line[i].isdigit():
                    parsedTimes[count] = line[i:i+13]
                    i += 13
                    count += 1
                    continue
                i += 1
        
        parsedResults.append(parsedTimes)
    return parsedResults

def getargv():
    if len(sys.argv) != 3 and len(sys.argv) != 4:
        print("Usage: python3 run.py <client number> <loop times> [<warm up times>]")
        exit(0)
    if not str.isdigit(sys.argv[1]) or not str.isdigit(sys.argv[2]) or int(sys.argv[1]) < 1 or int(sys.argv[2]) < 1:
        print("Usage: python3 run.py <client number> <loop times> [<warm up times>]")
        print("Client number and loop times must be an positive integer")
        exit(0)
    
    if len(sys.argv) == 4:
        if not str.isdigit(sys.argv[3]) or int(sys.argv[3]) < 1:
            print("Usage: python3 run.py <client number> <loop times> [<warm up times>]")
            print("Warm up times must be an positive integer")
            exit(0)

    else:
        return (int(sys.argv[1]),int(sys.argv[2]),1)

    return (int(sys.argv[1]),int(sys.argv[2]),int(sys.argv[3]))

def formatResult(latencies,duration,client,loop,warmup):
    requestNum = len(latencies)
    latencies.sort()
    duration = float(duration)
    # calculate the average latency
    total = 0
    for latency in latencies:
        total += latency
    print("\n")
    print("------------------ result ---------------------")
    print("%s / %d requests finished in %.2f seconds" %(requestNum, (loop * client), (duration/1000)))
    print("latency (ms):\navg\t50%\t75%\t90%\t95%\t99%")
    if requestNum > 0:
        averageLatency = float(total) / requestNum
        _50pcLatency = latencies[int(requestNum * 0.5) - 1]
        _75pcLatency = latencies[int(requestNum * 0.75) - 1]
        _90pcLatency = latencies[int(requestNum * 0.9) - 1]
        _95pcLatency = latencies[int(requestNum * 0.95) - 1]
        _99pcLatency = latencies[int(requestNum * 0.99) - 1]
        print("%.2f\t%d\t%d\t%d\t%d\t%d" %(averageLatency,_50pcLatency,_75pcLatency,_90pcLatency,_95pcLatency,_99pcLatency))
    print("throughput (n/s):\n%.2f" %(requestNum / (duration/1000)))
    # output result to file
    resultfile = open("eval-result.log","a")
    resultfile.write("\n\n------------------ (concurrent)result ---------------------\n")
    resultfile.write("client: %d, loop_times: %d, warmup_times: %d\n" % (client, loop, warmup))
    resultfile.write("%s / %d requests finished in %.2f seconds\n" %(requestNum, (loop * client), (duration/1000)))
    resultfile.write("latency (ms):\navg\t50%\t75%\t90%\t95%\t99%\n")
    if requestNum > 0:
        resultfile.write("%.2f\t%d\t%d\t%d\t%d\t%d\n" %(averageLatency,_50pcLatency,_75pcLatency,_90pcLatency,_95pcLatency,_99pcLatency))
    resultfile.write("throughput (n/s):\n%.2f\n" %(requestNum / (duration/1000)))

main()

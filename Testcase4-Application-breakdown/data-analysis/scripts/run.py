
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
from datetime import datetime

# This script should be invoked in parent dir of scripts

def client(i,invokeTimes,loopTimes):
    print("client %d start" %i)
    DATA_ANALYSIS_HOME=os.environ['TESTCASE4_HOME'] + "/data-analysis"
    command = "%s/scripts/run-parallel-single.sh -R -t " %(DATA_ANALYSIS_HOME) + str(loopTimes) + " -b " + str(i+1)
    r = os.popen(command)  
    text = r.read() 
    invokeTimes[i] = parseStart(text)
#    print("invokeTimes[%d]: %s" % (i, invokeTimes[i]))
    print("client %d finished" %i)

def warmup(i,warmupTimes):
    for j in range(warmupTimes):
        DATA_ANALYSIS_HOME=os.environ['TESTCASE4_HOME'] + "/data-analysis"
        command = "%s/scripts/run-parallel-single.sh -W -b " %(DATA_ANALYSIS_HOME) + str(i)
        r = os.popen(command)  
        text = r.read() 
    print("client %d warmup finished" %i) 
    

def main():
    argv = getargv()
    clientNum = argv[0]
    loopTimes = argv[1]
    warmupTimes = argv[2]
    threads = []
    
    containerName = "wage"

    r = os.popen("docker stop `docker ps | grep %s | awk {'print $1'}`" %containerName)
    r.read()

    # First: warm up
    if warmupTimes > 0:
        for i in range(clientNum):
            t = threading.Thread(target=warmup,args=(i,warmupTimes))
            threads.append(t)

        for i in range(clientNum):
            threads[i].start()

        for i in range(clientNum):
            threads[i].join()    
        print("Warm up complete, waiting 60s before start measuring...")
        time.sleep(60)

    # Second: invoke the actions
    # Initialize the results and the clients
    threads = []
    invokeTimes = []
    endTimes = []

    for i in range(clientNum):
        invokeTimes.append('')
        endTimes.append([])

    DATA_ANALYSIS_HOME=os.environ['TESTCASE4_HOME'] + "/data-analysis"
    r = os.popen("rm -f %s/scripts/activation.log" %DATA_ANALYSIS_HOME)
    r.read()
    r = os.popen("sudo kill $(pidof wsk)")
    r.read()
    r = os.popen("wsk -i activation poll > %s/scripts/activation.log &" %DATA_ANALYSIS_HOME)
    r.read()

    # Create the clients
    for i in range(clientNum):
        t = threading.Thread(target=client,args=(i,invokeTimes,loopTimes))
        threads.append(t)

    # start the clients
    for i in range(clientNum):
        threads[i].start()

    for i in range(clientNum):
        threads[i].join()

    requestNum = clientNum * loopTimes

    cntCmd = "ag \"wage analysis result: \" %s/scripts/activation.log -c" %DATA_ANALYSIS_HOME
    r = os.popen(cntCmd)
    cnt = r.read()
    limit = 100
    tcnt = 0
    while ((tcnt < limit) and (cnt == '' or int(cnt) < requestNum) ):
        time.sleep(3)
        r = os.popen(cntCmd)
        cnt = r.read()
        tcnt = tcnt + 1

    time.sleep(5)
    print("all finished, collecting results...")

    r = os.popen("sudo kill $(pidof wsk)")
    r.read()

    activationLog = open('%s/scripts/activation.log' %DATA_ANALYSIS_HOME, 'a')
    activationLog.write("terminated\n")
    parseEnd(invokeTimes, endTimes)
    #print("endTimes: %s" % endTimes)

    outfile = open("%s/scripts/result.csv" %DATA_ANALYSIS_HOME,"w")
    outfile.write("invokeTime,endTime\n")
   
    latencies = []
    minInvokeTime = 0x7fffffffffffffff
    maxEndTime = 0
    for i in range(clientNum):
        # print the result of every loop of the client
        for j in range(len(endTimes[i])):
            outfile.write(invokeTimes[i][j] + ',' + endTimes[i][j] + '\n') 
        
            # Collect the latency
            invoke = string2timestamp(invokeTimes[i][j])
            end = string2timestamp(endTimes[i][j])
            latency = end - invoke
            latencies.append(latency)

            # Find the first invoked action and the last return one.
            if invoke < minInvokeTime:
                minInvokeTime = invoke
            if end > maxEndTime:
                maxEndTime = end

    formatResult(latencies,maxEndTime - minInvokeTime, clientNum, loopTimes, warmupTimes)

def parseStart(result):
    lines = result.split('\n')
    parsedResults = []
    for line in lines:
        if line.find("DATA-ANALYSIS starts") == -1:
            continue
        #print("start line: %s" % line)
        #parsedResults.append(string2timestamp(line.split()[0]))
        parsedResults.append(line.split()[0])
    return parsedResults

def parseEnd(invokeTimes, endTimes):
    DATA_ANALYSIS_HOME=os.environ['TESTCASE4_HOME'] + "/data-analysis"
    activationLog = open('%s/scripts/activation.log' %DATA_ANALYSIS_HOME, 'r')
    
    line = activationLog.readline().strip()
    while line.find('terminated') == -1:
        #print("activation line: %s" % (line))
        if line.find('wage analysis result') != -1:
            cid = int(line.split()[3])
            #print("result line (%s), client-id(%d), timestr(%s)" % (line, cid, line.split()[0][1:24]))
            if line.split()[0][1:24] > invokeTimes[cid-1][0]:
                endTimes[cid-1].append(line.split()[0][1:]) 
        line = activationLog.readline().strip()

def string2timestamp(raw_timestr):
    # [2020-01-09T03:00:04.171Z]
    timestr = raw_timestr[0:10] + ' ' + raw_timestr[11:23]
#    print('raw_timestr (%s), timestr (%s)' % (raw_timestr, timestr))
    tmp = datetime.strptime(timestr, "%Y-%m-%d %H:%M:%S.%f")
    timestamp = str(int(time.mktime(tmp.timetuple()))) + timestr[-3:]
#    print('raw_timestr (%s) converted to: %d' % (raw_timestr, int(timestamp)))
    return int(timestamp)

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
        if not str.isdigit(sys.argv[3]):
            print("Usage: python3 run.py <client number> <loop times> [<warm up times>]")
            print("Warm up times must be an non-negative integer")
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
    print("%s / %d requests finished in %.2f seconds" %(requestNum, (loop * client), duration/1000))
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
    resultfile.write("%s / %d requests finished in %.2f seconds\n" %(requestNum, (loop * client), duration/1000))
    resultfile.write("latency (ms):\navg\t50%\t75%\t90%\t95%\t99%\n")
    if requestNum > 0:
        resultfile.write("%.2f\t%d\t%d\t%d\t%d\t%d\n" %(averageLatency,_50pcLatency,_75pcLatency,_90pcLatency,_95pcLatency,_99pcLatency))
    resultfile.write("throughput (n/s):\n%.2f\n" %(requestNum / (duration/1000)))

main()

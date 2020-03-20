import os
import time
import sys
from datetime import datetime
def main():
    print("logFile:result.log, parsedRes.csv")
    timeNow = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + 'Z'
    time.sleep(1)

    r = os.popen("./invoke.sh 10")
 
    res = r.read()
    #activation = eval(res)
    #print(activation)
    print(res)

    #writeParsedLog(timeNow,activation)
    writeParsedLog(timeNow)

    #communicateTimes = writeCommunicateRes(end2endTime,activation)
    #print(communicateTimes)

def parseActivation():
    activationLog = open('activation.log','r')
    parsedFuncstart = open("parsedFuncstart.log",'w')
    parsedFunccomm = open("parsedFunccomm.log",'w')

    comm = ""

    line = activationLog.readline().strip()
    while line.find("terminated") == -1:
        if line.find('startTime') != -1:
            parsedFuncstart.write("%s func-entry\n" % line.split()[1])
        elif line.find('commTime') != -1:
            comm = line.split()[1]
            print("commTime: %s\n" % comm)
        elif line.find('stdout') != -1:
            print("writing commTime: %s\n" % comm)
            parsedFunccomm.write("%s\n" % comm)
        line = activationLog.readline().strip()


def parseInvoker(timeNow):
    invokerLog = open('/home/yelly/tmp/openwhisk/invoker/logs/invoker-local_logs.log','r')
    parsedInvoker = open("parsedInvoker.log",'w')
    line = invokerLog.readline().strip()
    while(line != ''):
        #print(line)
        if line.split()[0].strip('[]') < timeNow:
            line = invokerLog.readline().strip()
            continue
        if line.find('YELLY ') != -1:
            parsedInvoker.write("%s %s\n" %(line.split()[0],' '.join(line.split()[1:])))
#        elif line.find('marker:invoker_activation_start:') != -1:
#            parsedInvoker.write("%s %s\n" %(line.split()[0],line.split()[4]))
#        elif line.find('running /usr/bin/docker unpause') != -1:
#            parsedInvoker.write("%s %s\n" %(line.split()[0],' '.join(line.split()[4:])))
#        elif line.find('marker:invoker_docker.unpause_finish') != -1:
#            parsedInvoker.write("%s %s\n" %(line.split()[0],' '.join(line.split()[4:])))
#        elif line.find('running /usr/bin/docker run') != -1:
#            parsedInvoker.write("%s %s\n" %(line.split()[0],' '.join(line.split()[4:])))
#        elif line.find('sending initialization to ContainerId') != -1:
#            parsedInvoker.write("%s %s\n" %(line.split()[0],' '.join(line.split()[4:])))
#        elif line.find('sending arguments to') != -1:
#            parsedInvoker.write("%s %s\n" %(line.split()[0],' '.join(line.split()[4:])))
        elif line.find('[ContainerPool] containerStart containerState') != -1:
            parsedInvoker.write("%s %s\n" %(line.split()[0],' '.join(line.split()[4:])))
        line = invokerLog.readline().strip()

def parseController(timeNow):
    controllerLog = open('/home/yelly/tmp/openwhisk/controller/logs/controller-local_logs.log','r')
    parsedController = open("parsedController.log",'w')
    activationLog = open("activation.log",'w')
    line = controllerLog.readline().strip()

    while(line != ''):
        if line.split()[0].strip('[]') < timeNow:
            line = controllerLog.readline().strip()
            continue
        if line.find('YELLY ') != -1:
            parsedController.write('%s %s\n' %(line.split()[0],' '.join(line.split()[1:])))
        elif line.find('POST /api/v1/web/guest') != -1:
            parsedController.write('%s %s\n' %(line.split()[0],' '.join(line.split()[3:])))

#        elif line.find('[ShardingContainerPoolBalancer] posted to invoker0') != -1:
#            parsedController.write('%s %s\n' %(line.split()[0],' '.join(line.split()[4:])))
        
        elif line.find('received result ack for') != -1:
            parsedController.write('%s %s\n' %(line.split()[0],' '.join(line.split()[3:])))
            # write activation log
            r = os.popen("wsk -i activation get " + line.split()[8].strip('\'') + " --logs")
            res = r.read()
            print(res)
            activationLog.write("%s\n" % res)
        line = controllerLog.readline().strip()
    return activationLog

#def writeParsedLog(timeNow,activation):
def writeParsedLog(timeNow):
    parseInvoker(timeNow)
    activationLog = parseController(timeNow)
    activationLog.write("terminated\n")

def combineResult():
    parseActivation()
    parsedController = open("parsedController.log",'r')
    parsedInvoker = open("parsedInvoker.log",'r')
    parsedFuncstart = open("parsedFuncstart.log",'r')
    result = open("result.log",'w')

    isCold = True
    line = parsedController.readline().strip()
    while(line != ''):
        # write "YELLY ImageProcessing starts"
        result.write("%s\n" % line)
        # dump "YELLY GG starts" line in invoker
        line = parsedInvoker.readline().strip()
        if isCold:
            # dump the first warm-start attempt (failed)
            line = parsedInvoker.readline().strip()
        for j in range(7):
            # NOT write "POST /api/v1/web/guest/..."
            line = parsedController.readline().strip()
#            result.write("%s\n" % line)
            # write invoker's log: containerStart
            line = parsedInvoker.readline().strip()
            result.write("%s\n" % line)
            # write func-entry
            line = parsedFuncstart.readline().strip()
            result.write("%s\n" % line)
            # write "received result ack for..."
            line = parsedController.readline().strip()
            result.write("%s\n" % line)
        # write "YELLY GG ends"
        line = parsedController.readline().strip()
        result.write("%s\n" % line)
        # dump "YELLY ImageProcessing ends" line in invoker
        line = parsedInvoker.readline().strip()
        line = parsedController.readline().strip()
        isCold = False

def formatResult():
    resultLog = open('result.log','r')
    comm = open('parsedFunccomm.log','r')
    breakdownRes = open('breakdownRes.csv','w')
    coarselabels = ","
    finelabels = ","
    for i in range(7):
        coarselabels += "func-" + str(i+1) + ",,,"
        finelabels += "framework,start,exec/comm,"
    finelabels += "ack"

    warms = [{"framework":0.0, "start": 0.0, "comm": 0.0, "exec": 0.0},
            {"framework":0.0, "start": 0.0, "comm": 0.0, "exec": 0.0},
            {"framework":0.0, "start": 0.0, "comm": 0.0, "exec": 0.0},
            {"framework":0.0, "start": 0.0, "comm": 0.0, "exec": 0.0},
            {"framework":0.0, "start": 0.0, "comm": 0.0, "exec": 0.0},
            {"framework":0.0, "start": 0.0, "comm": 0.0, "exec": 0.0},
            {"framework":0.0, "start": 0.0, "comm": 0.0, "exec": 0.0}]

    breakdownRes.write("%s\n%s\n" % (coarselabels, finelabels))

    times = 1
    isWarm = False
    line = resultLog.readline().strip()
   
    while(line != ''):
        resline="TEST-" + str(times) + ","
        # "YELLY GG starts"
        last = string2timestamp(line.split()[0].strip('[]'))
        for j in range(7):
            # containerStart
            line = resultLog.readline().strip()
            cur = string2timestamp(line.split()[0].strip('[]'))
            resline += str(cur-last)+","
            if (isWarm):
                warms[j]['framework'] += cur-last
            last = cur
            # func-entry
            line = resultLog.readline().strip()
            cur = string2timestamp(line.split()[0].strip('[]'))
            resline += str(cur-last)+","
            if (isWarm):
                warms[j]['start'] += cur-last
            last = cur
            # write "received result ack for..."
            line = resultLog.readline().strip()
            cur = string2timestamp(line.split()[0].strip('[]'))
            resline += str(cur-last)+","
            if (isWarm):
                warms[j]['exec'] += cur-last
            last = cur
        # write "YELLY ImageProcessing ends"
        line = resultLog.readline().strip()
        cur = string2timestamp(line.split()[0].strip('[]'))
        resline += str(cur-last)
        if (isWarm):
            warms[6]['framework'] += cur-last
        print(resline)
        breakdownRes.write("%s\n" % resline)

        breakdownRes.write(",")
        for i in range(7):
            cline = comm.readline().strip()
            breakdownRes.write(",,%s," % cline)
            if (isWarm):
                warms[i]['comm'] += float(cline)
                warms[i]['exec'] -= float(cline)
        breakdownRes.write("\n")

        line = resultLog.readline().strip()
        isWarm = True
        times += 1

    # print averages
    warmnum = 9
    print("\nAVERAGES:\nframework,start,comm,exec\n")
    breakdownRes.write("\nAVERAGES:\n,framework,start,comm,exec\n")
    for i in range(7):
        print("FUNC-%d,%d,%d,%d,%d\n" % (i, warms[i]['framework']/warmnum, warms[i]['start']/warmnum, warms[i]['comm']/warmnum, warms[i]['exec']/warmnum))
        breakdownRes.write("FUNC-%d,%d,%d,%d,%d\n" % (i, warms[i]['framework']/warmnum, warms[i]['start']/warmnum, warms[i]['comm']/warmnum, warms[i]['exec']/warmnum))
    

def string2timestamp(raw_timestr):
    # [2020-01-09T03:00:04.171Z]
    timestr = raw_timestr[:10] + ' ' + raw_timestr[11:23]
    print('raw_timestr (%s), timestr (%s)' % (raw_timestr, timestr))
    tmp = datetime.strptime(timestr, "%Y-%m-%d %H:%M:%S.%f")
    # 8 * 3600 is the manual convert to UTC
    #timestamp = str(8 * 3600 + int(time.mktime(tmp.timetuple()))) + timestr[-3:]
    timestamp = str(int(time.mktime(tmp.timetuple()))) + timestr[-3:]
    print('raw_timestr (%s) converted to: %d' % (raw_timestr, int(timestamp)))
    return int(timestamp)


#main()
combineResult()
formatResult()

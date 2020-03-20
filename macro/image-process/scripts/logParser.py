import os
import time
import sys
from datetime import datetime
def main():
    print("logFile:result.log, parsedRes.csv")
    timeNow = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + 'Z'
    time.sleep(1)

    r = os.popen("./invoke.sh")
 
    res = r.read()
    #activation = eval(res)
    #print(activation)
    print(res)
    activationLog = open("activation.log",'w')
    activationLog.write("%s\n" % res)

    #writeParsedLog(timeNow,activation)
    writeParsedLog(timeNow)

    #communicateTimes = writeCommunicateRes(end2endTime,activation)
    #print(communicateTimes)

def parseActivation():
    activationLog = open('activation.log','r')
    parsedFuncstart = open("parsedFuncstart.log",'w')
    parsedFunccomm = open("parsedFunccomm.log",'w')
    line = activationLog.readline().strip()
    while(line != ''):
#        if line.find('YELLY ImageProcessing ') != -1:
#            print(line)
        if line.find('startTimes') != -1:
            for i in range(5):
                line = activationLog.readline().strip().strip('\"')[0:23]
                parsedFuncstart.write("%s func-entry\n" % line)
        elif line.find('commTimes') != -1:
            comms = ""
            for i in range(5):
                line = activationLog.readline().strip()
                comms += line
            parsedFunccomm.write("%s\n" % comms)
        line = activationLog.readline().strip()
        print(line)
    

def parseInvoker(timeNow):
    invokerLog = open('/home/yelly/tmp/openwhisk/invoker/logs/invoker-local_logs.log','r')
    parsedInvoker = open("parsedInvoker.log",'w')
    line = invokerLog.readline().strip()
    target1 = [] # marker:invoker_activation_start
    target2 = [] # running docker run ...
    target3 = [] # sending initialization to ContainerId
    target4 = [] # sending arguments to
    target5 = []
    target6 = []
    target = [target1,target2,target3,target4,target5,target6]
    while(line != ''):
        #print(line)
        if line.split()[0].strip('[]') < timeNow:
            line = invokerLog.readline().strip()
            continue
        if line.find('YELLY ImageProcessing ') != -1:
            parsedInvoker.write("%s %s\n" %(line.split()[0],' '.join(line.split()[1:])))
        elif line.find('marker:invoker_activation_start:') != -1:
            parsedInvoker.write("%s %s\n" %(line.split()[0],line.split()[4]))
            target1.append(line)
        elif line.find('running /usr/bin/docker unpause') != -1:
            parsedInvoker.write("%s %s\n" %(line.split()[0],' '.join(line.split()[4:])))
            target2.append(line)
        elif line.find('marker:invoker_docker.unpause_finish') != -1:
            parsedInvoker.write("%s %s\n" %(line.split()[0],' '.join(line.split()[4:])))
            target3.append(line)
        elif line.find('running /usr/bin/docker run') != -1:
            parsedInvoker.write("%s %s\n" %(line.split()[0],' '.join(line.split()[4:])))
            target4.append(line)
        elif line.find('sending initialization to ContainerId') != -1:
            parsedInvoker.write("%s %s\n" %(line.split()[0],' '.join(line.split()[4:])))
            target5.append(line)
        elif line.find('sending arguments to') != -1:
            parsedInvoker.write("%s %s\n" %(line.split()[0],' '.join(line.split()[4:])))
            target6.append(line)
        line = invokerLog.readline().strip()
    return target

def parseController(timeNow):
    controllerLog = open('/home/yelly/tmp/openwhisk/controller/logs/controller-local_logs.log','r')
    parsedController = open("parsedController.log",'w')
    line = controllerLog.readline().strip()
    target1 = [] # POST /api/...
    target2 = [] # posted to invoker0
    target3 = [] # received result ack for...
    target = [target1,target2,target3]

    #receivedAck = []
    while(line != ''):
        #print(line)
        if line.split()[0].strip('[]') < timeNow:
            line = controllerLog.readline().strip()
            continue
        if line.find('YELLY ImageProcessing ') != -1:
            parsedController.write('%s %s\n' %(line.split()[0],' '.join(line.split()[1:])))
            target1.append(line)
        elif line.find('POST /api/v1/namespaces/_/actions') != -1:
            parsedController.write('%s %s\n' %(line.split()[0],' '.join(line.split()[3:])))
            target1.append(line)

        elif line.find('[ShardingContainerPoolBalancer] posted to invoker0') != -1:
            parsedController.write('%s %s\n' %(line.split()[0],' '.join(line.split()[4:])))
            target2.append(line)
        
        elif line.find('received result ack for') != -1:
            parsedController.write('%s %s\n' %(line.split()[0],' '.join(line.split()[3:])))
            #receivedAck.append(line)
            target3.append(line)
        line = controllerLog.readline().strip()
    return target

#def writeParsedLog(timeNow,activation):
def writeParsedLog(timeNow):
    targetInvoker = parseInvoker(timeNow)
    #parseControllerResult = parseController(timeNow)
    #targetController = parseControllerResult[0]
    #receivedAck = parseControllerResult[1]
    targetController = parseController(timeNow)

def combineResult():
    parseActivation()
    parsedController = open("parsedController.log",'r')
    parsedInvoker = open("parsedInvoker.log",'r')
    parsedFuncstart = open("parsedFuncstart.log",'r')
    result = open("result.log",'w')

    line = parsedController.readline().strip()
    while(line != ''):
        # write "YELLY ImageProcessing starts"
        result.write("%s\n" % line)
        # dump "YELLY ImageProcessing starts" line in invoker
        parsedInvoker.readline().strip()
        # write "POST /api/vi/namespaces/..."
        line = parsedController.readline().strip()
        result.write("%s\n" % line)
        for j in range(5):
            # write "posted to invoker0..."
            line = parsedController.readline().strip()
            result.write("%s\n" % line)
            # write invoker's logs
            for k in range(4):
                line = parsedInvoker.readline().strip()
                result.write("%s\n" % line)
            # write func-entry
            line = parsedFuncstart.readline().strip()
            result.write("%s\n" % line)
            # write "received result ack for..."
            line = parsedController.readline().strip()
            result.write("%s\n" % line)
        # write "YELLY ImageProcessing ends"
        line = parsedController.readline().strip()
        result.write("%s\n" % line)
        # dump "YELLY ImageProcessing ends" line in invoker
        parsedInvoker.readline().strip()
        line = parsedController.readline().strip()

def formatResult():
    resultLog = open('result.log','r')
    comm = open('parsedFunccomm.log','r')
    breakdownRes = open('breakdownRes.csv','w')
    coarselabels = ","
    finelabels = "routing,"
    for i in range(5):
        coarselabels += "func-" + str(i) + ","
        coarselabels += ",,,,,,"
        finelabels += "load-balance,message-queue,docker-pull/minor,docker-run/unpause,docker-init/minor,func-start,exec/comm,"
    finelabels += "ack"
    coarselabels += "ack"

    warms = [{"framework":0, "start": 0, "comm": 0, "exec": 0},
            {"framework":0, "start": 0, "comm": 0, "exec": 0},
            {"framework":0, "start": 0, "comm": 0, "exec": 0},
            {"framework":0, "start": 0, "comm": 0, "exec": 0},
            {"framework":0, "start": 0, "comm": 0, "exec": 0}]

    breakdownRes.write("%s\n%s\n" % (coarselabels, finelabels))

    isWarm = False
    line = resultLog.readline().strip()
   
    while(line != ''):
        resline=""
        # "YELLY ImageProcessing starts"
        last = string2timestamp(line.split()[0].strip('[]'))
        # write "POST /api/vi/namespaces/..."
        line = resultLog.readline().strip()
        cur = string2timestamp(line.split()[0].strip('[]'))
        resline += str(cur-last)+","
        if (isWarm):
            warms[0]['framework'] += cur-last
        last = cur
        for j in range(5):
            # write "posted to invoker0..."
            line = resultLog.readline().strip()
            cur = string2timestamp(line.split()[0].strip('[]'))
            resline += str(cur-last)+","
            if (isWarm):
                warms[j]['framework'] += cur-last
            last = cur
            # write invoker's logs
            for k in range(4):
                line = resultLog.readline().strip()
                cur = string2timestamp(line.split()[0].strip('[]'))
                resline += str(cur-last)+","
                if (isWarm):
                    if (k == 0):
                        warms[j]['framework'] += cur-last
                    else:
                        warms[j]['start'] += cur-last
                last = cur
            # func-entry
            line = resultLog.readline().strip()
            tline = line[0:24]
            print('func-entry line in result.log: %s, time: %s' % (line, tline))
            cur = string2timestamp(tline)
            resline += str(cur-last)+","
            last = cur
            if (isWarm):
                warms[j]['start'] += cur-last
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
            warms[4]['framework'] += cur-last
        print(resline)
        breakdownRes.write("%s\n" % resline)
        last = cur

        cline = comm.readline().strip()
        breakdownRes.write(",")
        for i in range(5):
            breakdownRes.write(",,,,,,%s," % cline.split(',')[i])
            if (isWarm):
                warms[i]['comm'] += int(cline.split(',')[i])
                warms[i]['exec'] -= int(cline.split(',')[i])
        breakdownRes.write("\n")

        line = resultLog.readline().strip()
        isWarm = True

    # print averages
    warmnum = 9
    print("AVERAGES:\nframework,start,comm,exec\n")
    breakdownRes.write("AVERAGES:\n,framework,start,comm,exec\n")
    for i in range(5):
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


main()
combineResult()
formatResult()

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

    #writeParsedLog(timeNow,activation)
    writeParsedLog(timeNow)

    #communicateTimes = writeCommunicateRes(end2endTime,activation)
    #print(communicateTimes)

def parseActivation():
    activationLog = open('activation.log','r')
    parsedFuncstart = open("parsedFuncstart.log",'w')

    line = activationLog.readline().strip()
    while line.find("terminated") == -1:
        print(line)
#        if line.find('YELLY ImageProcessing ') != -1:
#            print(line)
        if line.find('] entry') != -1:
            parsedFuncstart.write("%s func-entry\n" % line.split()[0].strip('\"'))
        line = activationLog.readline().strip()
    

#def parseInvoker(timeNow):
def parseInvoker():
    #invokerLog = open('/home/yelly/tmp/openwhisk/invoker/logs/invoker-local_logs.log','r')
    invokerLog = open('./invoker-local_logs.log','r')
    parsedInvoker = open("parsedInvoker.log",'w')

#    start = False
    line = invokerLog.readline().strip()
    while(line != ''):
        #print(line)
#        if start == False and line.find('YELLY DATA-ANALYSIS starts [5]') == -1:
#            line = invokerLog.readline().strip()
#            continue
#        start = True
        if line.find('YELLY DATA-ANALYSIS starts ') != -1:
            parsedInvoker.write("%s %s\n" %(line.split()[0],' '.join(line.split()[1:])))
        elif line.find('[ContainerPool] containerStart container') != -1:
            parsedInvoker.write("%s %s\n" %(line.split()[0],''.join(line.split()[1:])))
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
        line = invokerLog.readline().strip()

#def parseController(timeNow):
def parseController():
    #controllerLog = open('/home/yelly/tmp/openwhisk/controller/logs/controller-local_logs.log','r')
    controllerLog = open('./controller-local_logs.log','r')
    activationLog = open("activation.log",'w')
    parsedController = open("parsedController.log",'w')
    line = controllerLog.readline().strip()

#    start = False
    line = controllerLog.readline().strip()
    while(line != ''):
#        if start == False and line.find('YELLY DATA-ANALYSIS starts [5]') == -1:
#            line = controllerLog.readline().strip()
#            continue
#        start = True
        if line.find('YELLY DATA-ANALYSIS starts ') != -1:
            parsedController.write('%s %s\n' %(line.split()[0],' '.join(line.split()[1:])))
        elif line.find('POST /api/v1/namespaces/') != -1 and line.find('-sequence') == -1:
            parsedController.write('%s %s\n' %(line.split()[0],' '.join(line.split()[2:])))
#        elif line.find('[ShardingContainerPoolBalancer] posted to invoker0') != -1:
#            parsedController.write('%s %s\n' %(line.split()[0],' '.join(line.split()[4:])))
        elif line.find('[ShardingContainerPoolBalancer] scheduled activation ') != -1:
            parsedController.write('%s %s\n' %(line.split()[0],' '.join(line.split()[4:])))
            # write activation log
            r = os.popen("wsk -i activation get " + line.split()[6].strip(','))
            res = r.read()
            #print(res)
            activationLog.write("%s\n" % res)
        elif line.find('received result ack for') != -1:
            parsedController.write('%s %s\n' %(line.split()[0],' '.join(line.split()[2:])))
        line = controllerLog.readline().strip()
    activationLog.write("terminated\n")

#def writeParsedLog(timeNow,activation):
#def writeParsedLog(timeNow):
def parse():
    parseInvoker()
    parseController()

def combineResult():
#    parseActivation()
    parsedController = open("parsedController.log",'r')
    parsedInvoker = open("parsedInvoker.log",'r')
    parsedFuncstart = open("parsedFuncstart.log",'r')
    result = open("result.log",'w')

    line = parsedController.readline().strip()
    while(line != ''):
        # write "YELLY DATA-ANALYSIS starts"
        result.write("%s\n" % line)
        # dump "YELLY DATA-ANALYSIS starts" line in invoker
        line = parsedInvoker.readline().strip()

        # wage-insert
        # dump "POST /api/vi/namespaces/..." and "scheduled activation"
        line = parsedController.readline().strip()
        line = parsedController.readline().strip()
        # write invoker's log: containerStart
        line = parsedInvoker.readline().strip()
        result.write("%s\n" % line)
        # dump cold start log
        line = parsedInvoker.readline().strip()
        # write func-entry
        line = parsedFuncstart.readline().strip()
        result.write("%s\n" % line)
        # write "received result ack for..."
        line = parsedController.readline().strip()
        result.write("%s\n" % line)

        # wage-format and wage-db-writer
        nests = [[], []]
        for j in range(2):
            # write POST...
            line = parsedController.readline().strip()
            nests[j].append(line)
            # dump "scheduled activation ..."
            line = parsedController.readline().strip()
            # write invoker's log: containerStart
            line = parsedInvoker.readline().strip()
            nests[j].append(line)
            # dump cold start log
            line = parsedInvoker.readline().strip()
            # write func-entry
            line = parsedFuncstart.readline().strip()
            nests[j].append(line)
        # wage-format and wage-db-writer (ACKs)
        for j in range(2):
            line = parsedController.readline().strip()
            for l in nests[1-j]:
                result.write("%s\n" % l)
            result.write("%s\n" % line)
        
        # write POST data-inserted trigger
        line = parsedController.readline().strip()
        result.write("%s\n" % line)

        # data-analysis-sequence
        for j in range(6):
            # write "scheduled activation ..."
            line = parsedController.readline().strip()
            result.write("%s\n" % line)
            # write invoker's log: containerStart
            line = parsedInvoker.readline().strip()
            result.write("%s\n" % line)
            # dump cold start log
            line = parsedInvoker.readline().strip()
            # write func-entry
            line = parsedFuncstart.readline().strip()
            result.write("%s\n" % line)
            # write "received result ack"
            line = parsedController.readline().strip()
            result.write("%s\n" % line)
        
        line = parsedController.readline().strip()

def formatResult():
    resultLog = open('result.log','r')
    breakdownRes = open('breakdownRes.csv','w')
    labels = ",framework,start,exec"

    breakdownRes.write("%s\n" % labels)

    for times in range(1):
        resline = "TEST-" + str(times)
        for i in range(3):
            line = resultLog.readline().strip()
            last = string2timestamp(line.split()[0].strip('[]'))
            for j in range(3):
                line = resultLog.readline().strip()
                cur = string2timestamp(line.split()[0].strip('[]'))
                resline += "," + str(cur-last)
                last = cur
            breakdownRes.write("%s\n" % resline)
            print("%s\n" % resline)
            resline = ""
        for i in range(6):
            line = resultLog.readline().strip()
            last = string2timestamp(line.split()[0].strip('[]'))
            if i == 0:
                # dump scheduled activation (read)
                line = resultLog.readline().strip()
            for j in range(3):
                line = resultLog.readline().strip()
                cur = string2timestamp(line.split()[0].strip('[]'))
                resline += "," + str(cur-last)
                last = cur
            breakdownRes.write("%s\n" % resline)
            print("%s\n" % resline)
            resline = ""

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
#parse()
combineResult()
formatResult()

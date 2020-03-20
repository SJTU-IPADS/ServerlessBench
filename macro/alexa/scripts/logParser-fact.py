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
    activationLog = open("activation.log",'w')
    activationLog.write("%s\n" % res)

    #writeParsedLog(timeNow,activation)
    writeParsedLog(timeNow)

    #communicateTimes = writeCommunicateRes(end2endTime,activation)
    #print(communicateTimes)

def parseActivation():
    activationLog = open('activation.log','r')
    parsedFuncstart = open("parsedFuncstart.log",'w')
    line = activationLog.readline().strip()
    while(line != ''):
#        if line.find('YELLY ImageProcessing ') != -1:
#            print(line)
        if line.find('startTimes') != -1:
            # frontend
            line = activationLog.readline().strip()
            parsedFuncstart.write("%s %s\n" % (line.split()[1].strip('\"'), line.split()[0]))
            # interact
            line = activationLog.readline().strip()
            line = activationLog.readline().strip()
            parsedFuncstart.write("%s %s\n" % (line.split()[1].strip('\"'), line.split()[0]))
            # fact
            line = activationLog.readline().strip()
            line = activationLog.readline().strip()
            parsedFuncstart.write("%s %s\n" % (line.split()[1].strip('\"'), line.split()[0]))
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
        if line.find('YELLY ImageProcessing ') != -1:
            parsedInvoker.write("%s %s\n" %(line.split()[0],' '.join(line.split()[1:])))
        elif line.find('marker:invoker_activation_start:') != -1:
            parsedInvoker.write("%s %s\n" %(line.split()[0],line.split()[4]))
        elif line.find('running /usr/bin/docker unpause') != -1:
            parsedInvoker.write("%s %s\n" %(line.split()[0],' '.join(line.split()[4:])))
        elif line.find('marker:invoker_docker.unpause_finish') != -1:
            parsedInvoker.write("%s %s\n" %(line.split()[0],' '.join(line.split()[4:])))
        elif line.find('running /usr/bin/docker run') != -1:
            parsedInvoker.write("%s %s\n" %(line.split()[0],' '.join(line.split()[4:])))
        elif line.find('sending initialization to ContainerId') != -1:
            parsedInvoker.write("%s %s\n" %(line.split()[0],' '.join(line.split()[4:])))
        elif line.find('sending arguments to') != -1:
            parsedInvoker.write("%s %s\n" %(line.split()[0],' '.join(line.split()[4:])))
        line = invokerLog.readline().strip()

def parseController(timeNow):
    controllerLog = open('/home/yelly/tmp/openwhisk/controller/logs/controller-local_logs.log','r')
    parsedController = open("parsedController.log",'w')
    line = controllerLog.readline().strip()

    #receivedAck = []
    while(line != ''):
        #print(line)
        if line.split()[0].strip('[]') < timeNow:
            line = controllerLog.readline().strip()
            continue
        if line.find('YELLY ImageProcessing ') != -1:
            parsedController.write('%s %s\n' %(line.split()[0],' '.join(line.split()[1:])))
        elif line.find('POST /api/v1/namespaces/_/actions') != -1:
            parsedController.write('%s %s\n' %(line.split()[0],' '.join(line.split()[3:])))
        elif line.find('[ShardingContainerPoolBalancer] posted to invoker0') != -1:
            parsedController.write('%s %s\n' %(line.split()[0],' '.join(line.split()[4:])))
        elif line.find('received result ack for') != -1:
            parsedController.write('%s %s\n' %(line.split()[0],' '.join(line.split()[3:])))
        line = controllerLog.readline().strip()

#def writeParsedLog(timeNow,activation):
def writeParsedLog(timeNow):
    parseInvoker(timeNow)
    #parseControllerResult = parseController(timeNow)
    #targetController = parseControllerResult[0]
    #receivedAck = parseControllerResult[1]
    parseController(timeNow)

def combineResult():
    parseActivation()
    parsedController = open("parsedController.log",'r')
    parsedInvoker = open("parsedInvoker.log",'r')
    parsedFuncstart = open("parsedFuncstart.log",'r')
    result = open("result.log",'w')

    # 5 in cold, then change to 2 in warm
    invokeLines = 5
    line = parsedController.readline().strip()
    while(line != ''):
        # write "YELLY ImageProcessing starts"
        result.write("%s\n" % line)
        # dump "YELLY ImageProcessing starts" line in invoker
        parsedInvoker.readline().strip()
        # write "POST /api/vi/namespaces/..."
        line = parsedController.readline().strip()
        result.write("%s\n" % line)
        for j in range(3):
            # write "posted to invoker0..."
            line = parsedController.readline().strip()
            result.write("%s\n" % line)
            # write invoker's logs
            for k in range(invokeLines):
                line = parsedInvoker.readline().strip()
                result.write("%s\n" % line)
            # write func-entry
            line = parsedFuncstart.readline().strip()
            result.write("%s\n" % line)
        # write "received result ack for..."
        for j in range(3):
            line = parsedController.readline().strip()
            result.write("%s\n" % line)
        # write "YELLY ImageProcessing ends"
        line = parsedController.readline().strip()
        result.write("%s\n" % line)
        # dump "YELLY ImageProcessing ends" line in invoker
        parsedInvoker.readline().strip()
        line = parsedController.readline().strip()
        invokeLines = 2

def formatResult():
    resultLog = open('result.log','r')
    breakdownRes = open('breakdownRes.csv','w')
    labels = ",routing,load-balance,message-queue,docker-pull,docker-run,docker-init,func-start,exec,ack"

    breakdownRes.write("%s\n" % labels)

    times = 1
    cold = True
    line = resultLog.readline().strip()

    while(line != ''):
        formated=["", "", ""]
        last = [0,0,0]
        # "YELLY ImageProcessing starts"
        last[0] = string2timestamp(line.split()[0].strip('[]'))
        # write "POST /api/vi/namespaces/..."
        line = resultLog.readline().strip()
        cur = string2timestamp(line.split()[0].strip('[]'))
        formated[0] += str(cur-last[0])+","
        formated[1] += ","
        formated[2] += ","
        last[0] = cur
        for j in range(3):
            # write "posted to invoker0..."
            line = resultLog.readline().strip()
            cur = string2timestamp(line.split()[0].strip('[]'))
            formated[j] += str(cur-last[j])+","
            last[j] = cur
            # write invoker's logs
            if (cold):
                # marker:invoker_activation_start
                line = resultLog.readline().strip()
                cur = string2timestamp(line.split()[0].strip('[]'))
                formated[j] += str(cur-last[j])+","
                last[j] = cur
                # dump unpause
                line = resultLog.readline().strip()
                for k in range(3):
                    line = resultLog.readline().strip()
                    cur = string2timestamp(line.split()[0].strip('[]'))
                    formated[j] += str(cur-last[j])+","
                    last[j] = cur
            else:
                # marker:invoker_activation_start
                line = resultLog.readline().strip()
                cur = string2timestamp(line.split()[0].strip('[]'))
                formated[j] += str(cur-last[j])+",-,-,-,"
                last[j] = cur
                # dump sending arguments
                line = resultLog.readline().strip()
            # func-entry
            line = resultLog.readline().strip()
            tline = line[0:26]
            print('func-entry line in result.log: %s, time: %s' % (line, tline))
            cur = string2timestamp(tline.strip('[]'))
            formated[j] += str(cur-last[j])+","
            last[j] = cur
            if (j < 2):
                last[j+1] = cur
        for j in range(3):
            # write "received result ack for..."
            line = resultLog.readline().strip()
            cur = string2timestamp(line.split()[0].strip('[]'))
            formated[2-j] += str(cur-last[2-j])+","
            last[2-j] = cur
        # write "YELLY ImageProcessing ends"
        line = resultLog.readline().strip()
        cur = string2timestamp(line.split()[0].strip('[]'))
        formated[0] += str(cur-last[0])
        #last = cur

        # first func
        print(formated[0])
        breakdownRes.write("TEST-%d,%s\n" % (times, formated[0]))
        for j in range(1, 3):
            print(formated[j])
            breakdownRes.write(",%s\n" % formated[j])
        breakdownRes.write("\n")

        line = resultLog.readline().strip()
        times += 1
        cold = False

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
#combineResult()
formatResult()

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

DEVICES = ["door", "light", "tv", "air-conditioning", "plug"]
DEVIND = {"door":0, "light":1, "tv":2, "air-conditioning":3, "plug":4}

def parseActivation():
    activationLog = open('activation.log','r')
    parsedFuncstart = open("parsedFuncstart.log",'w')
    line = activationLog.readline().strip()
    devicelines = ["", "", "", "", ""]
    while(line != ''):
        if line.find('startTimes\": {') != -1:
            # frontend
            line = activationLog.readline().strip()
            parsedFuncstart.write("%s %s\n" % (line.split()[1].strip('\"'), line.split()[0]))
            # interact
            line = activationLog.readline().strip()
            line = activationLog.readline().strip()
            parsedFuncstart.write("%s %s\n" % (line.split()[1].strip('\"'), line.split()[0]))
            # skill
            line = activationLog.readline().strip()
            line = activationLog.readline().strip()
            parsedFuncstart.write("%s %s\n" % (line.split()[1].strip('\"'), line.split()[0]))
            # emit controllers
            for i in range(5):
                parsedFuncstart.write("%s %s\n" % (devicelines[i], DEVICES[i]))
        elif line.find('content') != -1:
            for i in range(5):
                line = activationLog.readline().strip()
                line = activationLog.readline().strip()
                devicelines[i] = line.split()[1].strip('\"')
                line = activationLog.readline().strip()
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
            parsedInvoker.write("%s %s\n" %(line.split()[0],' '.join(line.split()[2:])))
#        elif line.find('running /usr/bin/docker unpause') != -1:
#            parsedInvoker.write("%s %s\n" %(line.split()[0],' '.join(line.split()[2:])))
#        elif line.find('marker:invoker_docker.unpause_finish') != -1:
#            parsedInvoker.write("%s %s\n" %(line.split()[0],' '.join(line.split()[2:])))
#        elif line.find('running /usr/bin/docker run') != -1:
#            parsedInvoker.write("%s %s\n" %(line.split()[0],' '.join(line.split()[2:])))
#        elif line.find('sending initialization to ContainerId') != -1:
#            parsedInvoker.write("%s %s\n" %(line.split()[0],' '.join(line.split()[2:])))
        elif line.find('sending arguments to') != -1:
            parsedInvoker.write("%s %s\n" %(line.split()[0],' '.join(line.split()[2:])))
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
        elif line.find('POST /api/v1/namespaces/') != -1:
            parsedController.write('%s %s\n' %(line.split()[0],' '.join(line.split()[2:])))
#        elif line.find('[ShardingContainerPoolBalancer] posted to invoker0') != -1:
#            parsedController.write('%s %s\n' %(line.split()[0],' '.join(line.split()[2:])))
        elif line.find('received result ack for') != -1:
            parsedController.write('%s %s\n' %(line.split()[0],' '.join(line.split()[2:])))
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

    line = parsedController.readline().strip()
    if line.find('YELLY') == -1:
        print("ERROR, expecting a YELLY ImageProcessing starts line, but be %s\n", line)
        return
    while(line != ''):
        # write "YELLY ImageProcessing starts"
        result.write("%s\n" % line)
        # dump "YELLY ImageProcessing starts" line in invoker
        line = parsedInvoker.readline().strip()
        if line.find('YELLY') == -1:
            print("ERROR, expecting a YELLY ImageProcessing starts line, but be %s\n", line)
            return
        frontlines = [[], [], []]
        for j in range(3):
            # write "POST /api/vi/namespaces/..."
            line = parsedController.readline().strip()
            if line.find('POST') == -1:
                print("ERROR, expecting a POST /api/vi/namespaces/... line, but be %s\n", line)
                return
            frontlines[j].append(line)
            # write marker:invoker_activation_start
            line = parsedInvoker.readline().strip()
            if line.find('marker') == -1:
                print("ERROR, expecting a marker:invoker_activation_start line, but be %s\n", line)
                return
            frontlines[j].append(line)
            # dump sending argument ...
            line = parsedInvoker.readline().strip()
            if line.find('sending argument') == -1:
                print("ERROR, expecting a sending argument line, but be %s\n", line)
                return
            # write func-entry
            line = parsedFuncstart.readline().strip()
            frontlines[j].append(line)
        # device controllers
        tid2dev = {} # tid-devindx mapping
        tidlines = {} # for each tid, POST... and marker:... lines
        devlines = [[], [], [], [], []]
        # POST...
        for j in range(5):
            line = parsedController.readline().strip()
            print("POST device line: %s\n", line)
            if line.find('POST') == -1:
                print("ERROR, expecting a POST /api/vi/namespaces/... line, but be %s\n", line)
                return
            tid = line.split()[1]
            dev = line.split()[3].split('-')[2]
            if (DEVIND.has_key(dev) == False):
                # air-conditioning
                tid2dev[tid] = DEVIND['air-conditioning']
                tidlines[tid] = [line]
            else:
                tid2dev[tid] = DEVIND[dev]
                tidlines[tid] = [line]

        # marker:invoker_activation_stwart OR sending arguments to ...
        for j in range(10):
            line = parsedInvoker.readline().strip()
            print("marker:invoker_activation_stwart OR sending arguments line: %s\n" % line)
            if line.find('marker:invoker_activation_start') != -1:
                print("===IS marker\n")
                tidlines[line.split()[1]].append(line)
            elif line.find('sending') != -1:
                print("===IS sending argument\n")
                tid = line.split()[1]
                dev = line.split()[6].split('-')[2]
                if (DEVIND.has_key(dev) == False):
                    # air-conditioning
                    devlines[DEVIND['air-conditioning']] = tidlines[tid]
                else:
                    devlines[DEVIND[dev]] = tidlines[tid]

            else:
                print("ERROR, expecting a marker:invoker_activation_stwart OR sending arguments to ... line, but be %s\n", line)
                return
        # func-entry
        for j in range(5):
            line = parsedFuncstart.readline().strip()
            devlines[j].append(line)
        # "received result ack for..."
        for j in range(5):
            line = parsedController.readline().strip()
            if line.find('received result ack') == -1:
                print("ERROR, expecting a received result ack line, but be %s\n", line)
                return
            tid = line.split()[1]
            devlines[tid2dev[tid]].append(line)
        # [FRONTS] write "received result ack for..."
        for j in range(3):
            line = parsedController.readline().strip()
            if line.find('received result ack') == -1:
                print("ERROR, expecting a received result ack line, but be %s\n", line)
                return
            frontlines[2-j].append(line)
        # write all front results together
        for j in range(3):
            for s in frontlines[j]:
                result.write("%s\n" % s)
            if (j == 0):
                # write "YELLY ImageProcessing ends"
                line = parsedController.readline().strip()
                result.write("%s\n" % line)
        # write all controller results together
        for j in range(5):
            for s in devlines[j]:
                result.write("%s\n" % s)
        # dump "YELLY ImageProcessing ends" line in invoker
        line = parsedInvoker.readline().strip()
        if line.find('YELLY') == -1:
            print("ERROR, expecting a YELLY ImageProcessing ends line, but be %s\n", line)
            return
        line = parsedController.readline().strip()

def formatResult():
    resultLog = open('result.log','r')
    breakdownRes = open('breakdownRes.csv','w')
    labels = ",,framework,start,exec,ack"

    breakdownRes.write("%s\n" % labels)

    times = 1
    line = resultLog.readline().strip()

    while(line != ''):
        # "YELLY ImageProcessing starts"
        last = string2timestamp(line.split()[0].strip('[]'))

        for j in range(8):
            if (j == 0):
                resline = "TEST-" + str(times) + ",frontend"
            elif (j == 1):
                resline = ",interact"
            elif (j == 2):
                resline = ",smarthome"
            elif (j == 3):
                resline = ",devices"
            else:
                resline = ","

            # POST...
            line = resultLog.readline().strip()
            if (j > 0):
                last = string2timestamp(line.split()[0].strip('[]'))
            # marker:invoker_activation_start
            line = resultLog.readline().strip()
            cur = string2timestamp(line.split()[0].strip('[]'))
            resline += "," + str(cur-last)
            last = cur
            # func-entry
            line = resultLog.readline().strip()
            tline = line[0:26]
            #print('func-entry line in result.log: %s, time: %s' % (line, tline))
            cur = string2timestamp(tline.strip('[]'))
            resline += "," + str(cur-last)
            last = cur
            # write "received result ack for..."
            line = resultLog.readline().strip()
            cur = string2timestamp(line.split()[0].strip('[]'))
            resline += "," + str(cur-last)
            last = cur
            if (j == 0):
                # write "YELLY ImageProcessing ends"
                line = resultLog.readline().strip()
                cur = string2timestamp(line.split()[0].strip('[]'))
                resline += "," + str(cur-last)
                last = cur

            # write this line
            breakdownRes.write("%s\n" % resline)

        line = resultLog.readline().strip()
        times += 1

def string2timestamp(raw_timestr):
    # [2020-01-09T03:00:04.171Z]
    timestr = raw_timestr[:10] + ' ' + raw_timestr[11:23]
    #print('raw_timestr (%s), timestr (%s)' % (raw_timestr, timestr))
    tmp = datetime.strptime(timestr, "%Y-%m-%d %H:%M:%S.%f")
    # 8 * 3600 is the manual convert to UTC
    #timestamp = str(8 * 3600 + int(time.mktime(tmp.timetuple()))) + timestr[-3:]
    timestamp = str(int(time.mktime(tmp.timetuple()))) + timestr[-3:]
    #print('raw_timestr (%s) converted to: %d' % (raw_timestr, int(timestamp)))
    return int(timestamp)


#main()
#combineResult()
formatResult()

import os
import threading
import time

def GetTime():
    return int(round(time.time() * 1000))

funcs = ["size0", "pkg20", "pkg50", "pkg60", "pkg80", "size20", "size50", "size60", "size80"]

resultFile = open("Result.csv",'w')
resultFile.write("function\tstartup\n")
print("function\tstartup\n")

for func in funcs:
    invokeTime = GetTime()
    r = os.popen('aws lambda invoke --function-name "%s" \
    ./results/awsout-%s.json --region us-east-2' % (func, func))
    text = r.read()
    retTime = GetTime()
#    execTimes.append(retTime - invokeTime)
    # record the start time
#    startupTimes.append(invokeTime)
    resFile = open("results/awsout-%s.json" % func, 'r')
    jsonText = eval(resFile.read())
#    print('jsonText: %s\n' % jsonText)
    startTime = jsonText['startTime']
    resultFile.write("%s, %d\n" %(func, startTime - invokeTime))
    print("%s, %d\n" %(func, startTime - invokeTime))

resultFile.close()


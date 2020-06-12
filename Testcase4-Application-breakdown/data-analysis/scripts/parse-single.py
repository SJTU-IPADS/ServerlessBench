import os
import time
import sys
from datetime import datetime

# This script should be invoked in parent dir of scripts

def string2timestamp(raw_timestr):
     # [2020-01-09T03:00:04.171Z]
    timestr = raw_timestr[:10] + ' ' + raw_timestr[11:23]
#    print('raw_timestr (%s), timestr (%s)' % (raw_timestr, timestr))
    tmp = datetime.strptime(timestr, "%Y-%m-%d %H:%M:%S.%f")
    # 8 * 3600 is the manual convert to UTC
    #timestamp = str(8 * 3600 + int(time.mktime(tmp.timetuple()))) + timestr[-3:]
    timestamp = str(int(time.mktime(tmp.timetuple()))) + timestr[-3:]
#    print('raw_timestr (%s) converted to: %d' % (raw_timestr, int(timestamp)))
    return int(timestamp)

if len(sys.argv) < 1:
    print('ERROR: unknown function invoke time')
    sys.exit(1)

activationLog = open('./scripts/activation.log','a')
activationLog.write("terminated\n")

result = open('./scripts/result-single.log','w')

starttime = sys.argv[1]

activationLog = open('./scripts/activation.log','r')
terminateline = activationLog.readline().strip()

while(terminateline.find("terminated") == -1):
    if terminateline.find("wage analysis result: ") != -1:
        break
    terminateline = activationLog.readline().strip()
    
if terminateline.find("wage analysis result: ") != -1:
    starttime = string2timestamp(starttime)
    endtime = string2timestamp(terminateline[1:].split()[0])
    resline = str(endtime-starttime)

    print("%s" % resline)
    result.write("%s\n" % resline)
    sys.exit(0)

# result not found: invocation vailed
sys.exit(1)

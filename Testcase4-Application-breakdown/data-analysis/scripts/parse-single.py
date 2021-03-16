
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

DATA_ANALYSIS_HOME=os.environ['TESTCASE4_HOME'] + "/data-analysis"
activationLog = open('%s/scripts/activation.log' %DATA_ANALYSIS_HOME,'a')
activationLog.write("terminated\n")

result = open('%s/scripts/result-single.log' %DATA_ANALYSIS_HOME,'w')

starttime = sys.argv[1]

activationLog = open('%s/scripts/activation.log' %DATA_ANALYSIS_HOME,'r')
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

# Copyright (c) 2020 Institution of Parallel and Distributed System, Shanghai Jiao Tong University
# ServerlessBench is licensed under the Mulan PSL v1.
# You can use this software according to the terms and conditions of the Mulan PSL v1.
# You may obtain a copy of Mulan PSL v1 at:
#     http://license.coscl.org.cn/MulanPSL
# THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR
# PURPOSE.
# See the Mulan PSL v1 for more details.

import time
import json
from subprocess import call
import os, stat
import utils

global memCDFFilename, execCDFFilename
memCDFFilename  = "CDFs/memCDF.csv"
execCDFFilename = "CDFs/execTimeCDF.csv"

def main(args):
    """Main."""
    startTime = utils.getTime()
    sequence = args.get('sequence')
    if sequence is None:
        sequence = 0
    else:
        sequence += 1
    
    mmStartTime = utils.getTime()
    memSize = mallocRandMem()
    mmEndTime = utils.getTime()

    mmExecTime = mmEndTime - mmStartTime

    execTime = execRandTime(mmExecTime)
    
    return { 'sequence': sequence,
        'startTime': startTime,
        'memSize': memSize,
        'execTime': execTime
    }

def mallocRandMem():
    filename = memCDFFilename
    bias = 30
    randMem = utils.getRandValueRefByCDF(filename) - bias
    print("Alloc random memory: %d" %(randMem))
    os.chmod("./function",stat.S_IRWXU)
    call(["./function","%s" %randMem])
    return randMem

def execRandTime(mmExecTime):
    filename = execCDFFilename
    randExecTime = utils.getRandValueRefByCDF(filename)
    
    exactAluTime = randExecTime - mmExecTime
    if exactAluTime > 0:
        utils.alu(exactAluTime)
    print("Execute random time: %d" %(randExecTime))
    return randExecTime

# # Use to debug
if __name__ == '__main__':
    memCDFFilename = "CDFs/memCDF.csv"
    execCDFFilename="CDFs/execTimeCDF.csv"
    main({"sequence": 0})

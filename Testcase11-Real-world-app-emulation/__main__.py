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
    startTime = time.time()
    sequence = args.get('sequence')
    if sequence is None:
        sequence = 0
    else:
        sequence += 1
    
    memSize = mallocRandMem()
    execTime = execRandTime()
    
    return { 'sequence': sequence,
        'startTime': int(round(startTime * 1000)),
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

def execRandTime():
    filename = execCDFFilename
    randExecTime = utils.getRandValueRefByCDF(filename)
    utils.alu(randExecTime)
    print("Execute random time: %d" %(randExecTime))
    return randExecTime

# # Use to debug
if __name__ == '__main__':
    memCDFFilename = "CDFs/memCDF.csv"
    execCDFFilename="CDFs/execTimeCDF.csv"
    mallocRandMem()

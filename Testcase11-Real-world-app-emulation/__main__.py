import time
import json
from subprocess import call
import random
import os, stat
def main(args):
    """Main."""
    startTime = time.time()
    sequence = args.get('sequence')
    if sequence is None:
        sequence = 0
    else:
        sequence += 1
    
    memSize = mallocRandMem()
    
    
    return { 'sequence': sequence,
        'startTime': int(round(startTime * 1000)),
        'memSize': memSize
    }

def mallocRandMem():
    filename = "memCDF.csv"
    fCDF = open(filename, 'r')
    mems = []
    P = []
    for line in fCDF:
        lineSplit = line.split(",")
        mems.append(int(lineSplit[0]))
        P.append(float(lineSplit[1]))
    
    randP = random.random()
    randMem = 0 #initialization
    for pindex in range(len(P)):
        if P[pindex] >= randP:
            randMem = mems[pindex]
            break
    print("Alloc random memory: %d" %(randMem))
    os.chmod("./function",stat.S_IRWXU)
    call(["./function","%s" %randMem])
    return randMem
            
# # Use to debug
if __name__ == '__main__':
    mallocRandMem()


# def binarySearch(arr, l, r, x):
#     if r >= l: 
#         mid = int(l + (r - l)/2)  
#         if arr[mid] >= x and arr[mid - 1] < x: 
#             return mid 
#         elif arr[mid - 1] >= x: 
#             return binarySearch(arr, l, mid-1, x) 
#         else: 
#             return binarySearch(arr, mid+1, r, x) 
#     else:
#         return 0
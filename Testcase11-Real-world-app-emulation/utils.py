# Copyright (c) 2020 Institution of Parallel and Distributed System, Shanghai Jiao Tong University
# ServerlessBench is licensed under the Mulan PSL v1.
# You can use this software according to the terms and conditions of the Mulan PSL v1.
# You may obtain a copy of Mulan PSL v1 at:
#     http://license.coscl.org.cn/MulanPSL
# THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR
# PURPOSE.
# See the Mulan PSL v1 for more details.
#

# This file defines some helper functions
import time
import random
import numpy as np
def binarySearch(nums, target):
    """
    :type nums: List[int]
    :type target: int
    :rtype: int
    """
    upper = len(nums) - 1
    lower = 0
    while(lower <= upper):
        mid = int((upper + lower) / 2)
        if target > nums[mid]:
            lower = mid + 1
        elif target < nums[mid - 1]:
            upper = mid - 1
        else:
            return mid
    
    return mid
def getTime():
    return int(round(time.time() * 1000))

def alu(times):
    startTime = getTime()
    base = 10000
    a = random.randint(10, 100)
    b = random.randint(10, 100)
    temp = 0
    while True:
        for i in range(base):
            if i % 4 == 0:
                temp = a + b
            elif i % 4 == 1:
                temp = a - b
            elif i % 4 == 2:
                temp = a * b
            else:
                temp = a / b
        endTime = getTime()
        if endTime - startTime > times:
            break
    return temp

def getRandFloatRefByCDF(CDFFilename):
    fCDF = open(CDFFilename, 'r')
    values = []
    P = []
    for line in fCDF:
        lineSplit = line.split(",")
        values.append(float(lineSplit[0]))
        P.append(float(lineSplit[1]))
    
    randP = random.random()
    randValue = values[binarySearch(P, randP)] 
    fCDF.close()
    return randValue

def getRandValueRefByCDF(CDFFilename):
    fCDF = open(CDFFilename, 'r')
    values = []
    P = []
    for line in fCDF:
        lineSplit = line.split(",")
        values.append(int(lineSplit[0]))
        P.append(float(lineSplit[1]))
    
    randP = random.random()
    randValue = values[binarySearch(P, randP)] 
    fCDF.close()
    return randValue

# Generate Gaussion distribution data series according to the mean value 
def genNorm(mean):
    CV = getRandCV()
    print("CV: %d" %CV)
    Norm=np.random.normal(loc=mean, scale=CV*mean, size=10)
    print(Norm)

def getRandCV():
    return random.randint(0,2) * 0.5

if __name__=='__main__':
    genNorm(10)
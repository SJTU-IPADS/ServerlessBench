import random
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

def alu(times):
    bias = 10
    times *= bias
    a = random.randint(10, 100)
    b = random.randint(10, 100)
    temp = 0
    for i in range(times):
        if i % 4 == 0:
            temp = a + b
        elif i % 4 == 1:
            temp = a - b
        elif i % 4 == 2:
            temp = a * b
        else:
            temp = a / b
    # print(times)
    return temp

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
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

# We don't include Azure's dataset in our repo, so the file is just for reference 
# The dataset is open-source at https://github.com/Azure/AzurePublicDataset

def getAvgExecValueFromFile():
    execTimes = []
    # There may be bugs of Azure/AzurePublicDataset in the first csv, so we start from the second csv
    for i in range(2,13):
        filename = "../azure-trace/function_durations_percentiles.anon.d{:0>2d}.csv".format(i)
        f = open(filename, 'r')
        f.readline()
        for line in f:
            lineSplit = line.split(",")
            avgExecTime = lineSplit[3]
            if int(avgExecTime) < 0:
                continue 
            execTimes.append(int(avgExecTime))
        f.close()
    return execTimes

def calcCDF(execTimes):
    execTimes.sort()
    step = 5
    total = len(execTimes)

    # regulate the memory in order to shrink the CDF file size
    regularExecTime = []
    for execTime in execTimes:
        regExecTime = int(execTime / step) * step
        regularExecTime.append(regExecTime)

    curExecTime = 0
    curP = 0
    perP = 1 / total
    outf = open("execTimeCDF.csv", "w")
    for execTime in regularExecTime:
        if curExecTime != execTime:
            outf.write("%d,%f\n" %(curExecTime, curP))
            curExecTime = execTime
        curP += perP
    outf.write("%d, %f\n" %(curExecTime, curP))
    outf.close()

if __name__ == '__main__':
    calcCDF(getAvgExecValueFromFile())
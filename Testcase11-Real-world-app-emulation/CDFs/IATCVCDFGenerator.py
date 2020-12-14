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

import numpy as np

'''
Calculate IAT:
The invocations happen in a minute is equally distributed. 
For example, if the invocation number is 1, then it happens at the beginning of the minute.
And if the invocation number is 3, then it happens at the 0, 20, 40 seconds of the minute
'''
def getAppIATCV(filename):
    # key: hashfunction; value: invocation number
    # filename = "../azure-trace/invocations_per_function_md.anon.d01.csv"
    appInvokesDict = {} 
    f = open(filename, 'r')
    f.readline()
    for line in f:
        lineSplit = line.split(',')
        HashApp = lineSplit[1]

        invokes = listStrToInt(lineSplit[4:])
        if HashApp in appInvokesDict:
            appInvokesDict[HashApp] = listSum(invokes, appInvokesDict[HashApp])
        else:
            appInvokesDict[HashApp] = invokes
    # print(appInvokesDict.values())
    # Calculate IATs after finishing reading a file 
    CVs = []
    for invokeSeries in appInvokesDict.values():
        IATSeries = getIATSeriesFromInvokeSeries(invokeSeries)
        if IATSeries == []:
            continue
        CVs.append(np.std(IATSeries) / np.mean(IATSeries))

    return CVs

def listSum(lista, listb):
    return list(map(lambda x, y: x+ y, lista, listb))

def listStrToInt(l):
    return list(map(lambda x:int(x), l))

def getIATSeriesFromInvokeSeries(invokeSeries):
    prevInvokeTime = 0
    SECONDS_PER_MINUTE = 60
    IATSeries = []
    # Remaining seconds from when the last invocation in a minute
    # happens to the end of the minute
    secondsToMinuteEnd = SECONDS_PER_MINUTE
    for invokeMinute in range(len(invokeSeries)):
        IAT = 0
        if invokeSeries[invokeMinute] == 0:
            continue
        elif invokeSeries[invokeMinute] == 1:
            IAT = (invokeMinute - prevInvokeTime - 1) * SECONDS_PER_MINUTE + secondsToMinuteEnd
            secondsToMinuteEnd = SECONDS_PER_MINUTE
            IATSeries.append(IAT)
        else:
            invokesInTheMinute = invokeSeries[invokeMinute]
            # first invocation in the minute
            IAT = (invokeMinute - prevInvokeTime - 1) * SECONDS_PER_MINUTE + secondsToMinuteEnd
            IATSeries.append(IAT)
            
            # later invocations in the minute
            IAT = SECONDS_PER_MINUTE / invokesInTheMinute
            for i in range(invokesInTheMinute - 1):
                IATSeries.append(IAT)
            secondsToMinuteEnd = IAT
        prevInvokeTime = invokeMinute

    # The first IAT is not real because their has to exist the first invoke
    return IATSeries[1:]

def calculateCVFromIATSeriesSet(IATSeriesSet):
    return list(map(lambda series: np.std(series) / np.mean(series), IATSeriesSet))

def calCDFFromCVs():
    CVs = []
    for i in range(1, 15):
        filename = "../azure-trace/invocations_per_function_md.anon.d{:0>2d}.csv".format(i)
        CVsFromAFile = getAppIATCV(filename)
        CVs += CVsFromAFile
        print("file %s finished" %filename)
        print("len of CVs: %d" %len(CVs))
    CVs.sort()

    total = len(CVs)
    curP = 0
    perP = 1 / total
    outf = open("allCVs.csv", 'w')
    curcv = 0
    for cv in CVs:
        if int(1000 * cv) != int (1000 * curcv):
            outf.write("%f,%f\n" %(curcv, curP))
            curcv = cv
        curP += perP
    outf.write("%f, %f\n" %(curcv, curP))
    # print(CVs.sort())

if __name__ == '__main__':
    calCDFFromCVs()
    
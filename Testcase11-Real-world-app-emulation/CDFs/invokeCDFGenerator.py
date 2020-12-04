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

# Get the invocation number of every application in a day
def getAppInvokes():
    # Days that is calculated
    days = 14
    # key: hashfunction; value: invocation number
    appInvokesDict = {} 
    for i in range(1,1 + days):
        filename = "../azure-trace/invocations_per_function_md.anon.d{:0>2d}.csv".format(i)
        f = open(filename, 'r')
        f.readline()
        for line in f:
            lineSplit = line.split(',')
            HashApp = lineSplit[1]
            
            # Calculate the total invoke number of the function (in a line)
            invokes = lineSplit[4:]
            # print(line)
            # print(invokes)
            invokeCount = 0
            for invoke in invokes:
                invokeCount += int(invoke)
            if HashApp in appInvokesDict:
                appInvokesDict[HashApp] += invokeCount
            else:
                appInvokesDict[HashApp] = invokeCount

    # We only need the invocation numbers
    appInvokes = []
    for value in appInvokesDict.values():
        appInvokes.append(int(value / days))
    print(len(appInvokes))
    return appInvokes

def calcIATCDF(appInvokes):
    appInvokes.sort()
    perP = 1 / len(appInvokes)
    curP = 0
    prevInvoke = 0
    outfile = open("invokesCDF.csv", 'w')
    for invoke in appInvokes:
        curP += perP
        if invoke != prevInvoke:
            prevInvoke = invoke
            outfile.write("%d, %f\n" %(invoke, curP))

if __name__ == '__main__':
    calcIATCDF(getAppInvokes())
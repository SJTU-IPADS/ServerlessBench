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

def getAvgMemValueFromFile():
    memory = []
    for i in range(1,13):
        filename = "../azure-trace/app_memory_percentiles.anon.d{:0>2d}.csv".format(i)
        f = open(filename, 'r')
        f.readline()
        for line in f:
            lineSplit = line.split(",")
            avgAllocMem = lineSplit[3]
            memory.append(int(avgAllocMem))
        f.close()
    return memory

def calcCDF(memory):
    memory.sort()
    step = 5
    total = len(memory)

    # regulate the memory in order to shrink the CDF file size
    regularMem = []
    for mem in memory:
        regMem = int(mem / step) * step
        regularMem.append(regMem)

    curMem = 0
    curP = 0
    perP = 1 / total
    outf = open("memCDF.csv", "w")
    for mem in regularMem:
        if curMem != mem:
            outf.write("%d,%f\n" %(curMem, curP))
            curMem = mem
        curP += 1 / total
    outf.write("%d, %f\n" %(curMem, curP))
    outf.close()


if __name__ == '__main__':
    calcCDF(getAvgMemValueFromFile())

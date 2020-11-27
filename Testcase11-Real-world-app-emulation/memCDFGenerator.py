def getAvgMemValueFromFile():
    memory = []
    for i in range(1,2):
        filename = "./azure-trace/app_memory_percentiles.anon.d{:0>2d}.csv".format(i)
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
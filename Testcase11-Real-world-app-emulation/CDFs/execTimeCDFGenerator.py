def getAvgExecValueFromFile():
    execTimes = []
    for i in range(1,13):
        filename = "../azure-trace/function_durations_percentiles.anon.d{:0>2d}.csv".format(i)
        f = open(filename, 'r')
        f.readline()
        for line in f:
            lineSplit = line.split(",")
            avgExecTime = lineSplit[3]
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
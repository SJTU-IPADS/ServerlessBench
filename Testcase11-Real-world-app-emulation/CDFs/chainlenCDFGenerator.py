def getApplicationFunctionFromFile(filename):
    f = open(filename,'r')
    applications = {}
    f.readline()
    for line in f:
        lineSplit = line.split(',')
        HashApp = lineSplit[1]
        HashFunction = lineSplit[2]
        if HashApp in applications:
            functions = applications[HashApp]
            if HashFunction in functions:
                continue
            else:
                functions[HashFunction] = ""
        else:
            applications[HashApp] = { HashFunction: "" }
    return applications    

def appLenStatistic(applications):
    appsLen = {}
    for app in applications:
        length = len(applications[app])
        if length in appsLen:
            appsLen[length] += 1
        else:
            appsLen[length] = 1
    return appsLen


def mergeAppLen(appsLen1, appsLen2):
    for length in appsLen2:
        if length in appsLen1:
            appsLen1[length] += appsLen2[length]
        else:
            appsLen1[length] = appsLen2[length]
    return appsLen1
    
# Calculate and print the CDF value to the outfilename
def calAppLenCDF(appsLen, outfilename):

    totalNum = 0

    # Sort for the length of applications
    sortedAppLen = []
    for length in appsLen:
        totalNum += appsLen[length]
        sortedAppLen.append(length)
    sortedAppLen.sort()
    
    # Calculate and print the CDF value
    outf = open(outfilename, 'w')
    outf.write("length,F(x),count\n")
    totalP = 0
    for length in sortedAppLen:
        totalP += appsLen[length] / totalNum
        outf.write("%d,%f,%d\n" %(length, totalP, appsLen[length]))



if __name__ == '__main__':
    appsLen = {}
    for i in range(1,15):
        filename = "../azure-trace/function_durations_percentiles.anon.d{:0>2d}.csv".format(i)
        newAppLen = appLenStatistic(getApplicationFunctionFromFile(filename))
        appsLen = mergeAppLen(appsLen, newAppLen)
    
    outfilename = "chainlenCDF.csv"
    calAppLenCDF(appsLen, outfilename)
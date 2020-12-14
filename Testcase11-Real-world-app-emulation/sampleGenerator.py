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

import random
import os
import yaml

config = yaml.load(open(os.path.join(os.path.dirname(__file__),'config.yaml')), yaml.FullLoader)
SAMPLE_NUM = config['sample_number']

# Generate a list of length according to the CDF of the chain length in an app, 
# each of which represents the chain length of an application 
def chainLenSampleListGen(sampleNum):
    CDF = parseChainLenCDFFile()
    lengthList = CDF[0]
    CDFdict = CDF[1]
    
    sampleList = []
    for i in range(sampleNum):
        randF = random.random()
        for length in lengthList:
            if CDFdict[length] > randF:
                sampleList.append(length)
                break
    return sampleList

# parse the CDF file, return the list of each x (x is length in the CDF), 
# and the dictionary of x:F(x) 
def parseChainLenCDFFile():
    filename = os.path.join(os.path.dirname(__file__),'CDFs','chainlenCDF.csv')
    f = open(filename, 'r')
    f.readline()
    lengthList = []
    CDFdict = {}
    for line in f:
        lineSplit = line.split(',')
        length = int(lineSplit[0])
        Fx = float(lineSplit[1])
        lengthList.append(length)
        CDFdict[length] = Fx

    return (lengthList, CDFdict)

# Generate the script to create the samples on OpenWhisk
def sampleActionGen(chainLenSampleList):
    sampleNum = len(chainLenSampleList)
    
    for sequenceID in range(sampleNum):
        appName = "app%d" %sequenceID
        length = chainLenSampleList[sequenceID]
        
        # TODO: OpenWhisk's sequenceMaxActions is 50
        # The configuration can be found in $OPENWHISK_SRC/ansible/group_vars/all
        if length > 50:
            continue
        
        funcChainStr = ""
        # Create functions in the app
        for functionID in range(length):
            cmd = "./action_update.sh %d %d" %(sequenceID, functionID)
            r = os.popen(cmd)
            r.read()

            funcName = "func%d-%d" %(sequenceID, functionID)
            funcChainStr = funcChainStr + funcName + ","

        # Eliminate the ',' in the end
        funcChainStr = funcChainStr[:-1]
        print("%s: %s" %(appName, funcChainStr))
        cmd = "wsk -i action update %s --sequence %s" %(appName, funcChainStr)
        
        # update the action sequence
        r = os.popen(cmd)
        r.read()

        print("Sample creation complete")
    return 


if __name__ == '__main__':
    chainLenSampleList = chainLenSampleListGen(SAMPLE_NUM)
    sampleActionGen(chainLenSampleList)

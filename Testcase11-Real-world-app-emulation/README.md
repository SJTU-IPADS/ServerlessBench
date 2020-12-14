# Real-world Application Emulation
This test case consists of applications that emulate the real world applications. The distribution of some features of the selected applications, e.g., the number of functions per application, are like real world applications on Microsoft Azure. The dataset is from http://github.com/Azure/AzurePublicDataset 

Emulate four aspects of real-world application:
* The number of functions per application

    The `application` in OpenWhisk is actually "function sequence"

* The memory usage

    Each function in an application will additionally allocate random size of memory

* The execution dutation

    Each function in an application will do alu operations for a random period of time

* The invoke pattern about the frequency and distribution on function.

    The test will invoke each application at a random frequency and a random cv (coefficient variable)

## Quickstart:
### Prerequisite
* Setup OpenWhisk environment
* Download python dependencies
    ```bash
    pip3 install numpy
    pip3 install pyyaml
    ```

### Run the test
```bash
# cd into testcase11's root dir
cd Testcase11-Real-world-app-emulation/

# generate samples
python3 sampleGenerator.py

# Run the test using the default configuration
python3 RealWorldAppEmulation.py
```

### Other Scripts
> The scripts described below are mainly helper functions
* xxxGenerators.py in CDFs
    
    The scripts are used to generate CDFs of some features according to Azure's dataset. Since we don't include the dataset in our repo, the scripts are used just for reference. 
    
    If you want to use these scripts you can download the datasets by yourself, modify the `filename` parameters in those scripts, and directly run them by "`python3 xxxGernerator.py`".

* action_update.sh

    The script is used to create a function, and it takes a sequence id and a function id to form the function name.

    For example, if a function is the third function in the fourth application, the function name will be `func4-3`, and we may create it by:
    
    ```bash
    ./action_update.sh 4 3
    ```

* action_invoke.sh

    The script is used to invoke a function by "`action_update`"

* function.c, \_\_main\_\_.py, utils.py: 

    These scripts will actually run in a serverless function instance. They just use the CDFs to generate random allocated memory and execution time.
    
### Configuration
`config.yaml` is the configuration file of the test:

* sample_number
    
    The number of sequences that we generate for the test. Each sequence consists of one or a few functions according to CDFs/chainLenCDF.csv 


* result_file

    The filename that stores the result of the samples.

    The results consist of 4 columns: 
    * appName: the name of the application
    * avgIAT: IAT is the time interval between two invocations. avgIAT is the average value of IATs.
    * cv: IAT's coefficient of variation. CV = 0 means that we use identical IAT to invoke the application
    * latencies: series of latency of every invocation of an application. (If an application invocation times out, "latency" of this invocation will be the timeout value)

* total_run_time: 3600

    The approximate time (seconds) that the whole test will run. The test will actually last a bit longer than it.

* manual_sample_generation: True

    If `true`, we have to manually generate the samples by `sampleGenerator.py`, which is suggested. You can change the item to `false`, and then `RealWorldAppEmulation.py` will help you to generate the samples

### Acknowledge
We thankfully use the dataset published by Azure:

 https://github.com/Azure/AzurePublicDataset


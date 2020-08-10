![ServerlessBench logo](logo.png)
## <!-- render a nicely looking grey line to separate the logo from the content  -->
# ServerlessBench
**This is an anonymous repo for Serverless Bench (submitted paper).**

A benchmark suite with serverless workloads.


## Test Cases

### Testcase1: varied resource needs
This test case features a CPU-intensive Alu application with two execution phases:
in the first phase, it connects to S3 and requests for a number N (Load configuration phase);
in the second phase, 100 threads are spawned to conduct arithmetic calculations and loop for N times (Compute phase).

The workload is basically built by aws sam-cli. 

We provide two versions of the application to compare their needs on resources:

* a together version (together.py), in which the application runs as a single serverless function;
* a splitted version, in which the application is splitted into two serverless functions (keyDownloader.py and alu.py) in a function chain. Each of the function handling one of the execution phase, respectively.

keyDownloader downloads the file named "loopTime.txt", which stores a number as the loop time that alu function does the calculation. You need to modify the `bucketName` to the name of the bucket where you stores "loopTime.txt". `defaultKey` is the default name of the file "loopTime.txt"

### Testcase2: Parallel composition
This test case features a CPU-intensive Alu application with parallelizable core handling logic.
Three versions are presented to analyze parallelization in serverless computing:

* no-parallel version (sequential.py), with no parallelization;
* instance-parallel version (parallel.py, doAlu.py), with multiple function instances executing concurrently; You need to modify the AluFunctionArn to the arn of the alu function (doAlu.py)
* in-function-parallel version (infunction.py), parallelization with multithreading in a single function.

The workload is basically built by AWS sam-cli

### Testcase3: Long function chain
This test case includes the Array Sum application which is a serverless application with a configurable number of chained functions. 

Two versions of the application are provided, implemented with the sequence function chain method (in `Sequence-chained` folder) and the nested function chain method (in `Sequence-nested` folder), respectively.

### Testcase4: Application breakdown
This test case includes four real-world serverless applications: Image processing, Alexa skill, Online-compiling, and Data analysis.

Details of these applications are presented int the [README of the test case](Testcase4-Application-breakdown/README.md).

### Testcase5: Data transfer costs
This test case presents a Node.js serverless application which transfers images with different sizes (the payload size) between two functions. 

We provide the application to be evaluated on three serverless platforms: OpenWhisk, Fn, AWS Lambda.

The chain on the three platforms are implemented with [OpenWhisk’s Action Sequence](https://github.com/apache/openwhisk/blob/master/docs/actions.md), [Fn flow](https://github.com/fnproject/flow), and [AWS Step Functions](https://aws.amazon.com/step-functions/), respectively.

As per the [payload size restriction](https://docs.aws.amazon.com/step-functions/latest/dg/avoid-exec-failures.html) (32KB when we refer in May 2020) on AWS Lambda, for payload data larger than 32KB in AWS Lambda, the payload is uploaded to S3 in the first function before it finishes, and the second function download the data before it starts the handling logic.

### Testcase6: Startup breakdown
This test case includes serverless functions with different language runtimes.


### Testcase7: Sandbox comparision
A simple Hello function and a more complex serverless function are provided in C, Java, Python, Ruby, and Node.js.

These applications can be used to evaluate the startup performance with different language runtimes in different sandboxes.

### Testcase8: Function size
The application consists of Python functions with varying package sizes, constructed by packing the handler codes with different numbers of dependency packages. 

Specifically, four popular PyPI packages (`mypy`, `numpy`, `django`, and `sphinx`) of sizes between 10–23MB are added into the function package accumulatively, producing function packages of sizes: 22.7MB (with `mypy`), 44.1MB (with `mypy` and `numpy`), 54.4MB (with `mypy`, `numpy`, and `django`), and 72.6MB (with all four packages).

### Testcase9: Concurrent startup
Simple Hello functions in C and Java are provided to evaluate the startup latencies when invoked concurrently.

### Testcase10: Stateless costs
An ImageResize function is provided to analyze the impact of losing implicit states (e.g. JIT profiles) in serverless computing's "stateless" nature.

When requests are issued subsequently, the sandbox and JVM environment is shared across requests;
when requests are issued concurrently, the requests are handled in auto-scaling manner and the implicit states are lost across requests.

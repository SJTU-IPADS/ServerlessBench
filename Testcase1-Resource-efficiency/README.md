# Resource Efficiency
This test case features a CPU-intensive Alu application with two execution phases:
in the first phase, it connects to S3 and requests for a number N (Load configuration phase);
in the second phase, 100 threads are spawned to conduct arithmetic calculations and loop for N times (Compute phase).

The workload is basically built by aws sam-cli. 


We provide two versions of the application to compare their needs on resources:

* a together version (together.py), in which the application runs as a single serverless function;
* a splitted version, in which the application is splitted into two serverless functions (keyDownloader.py and alu.py) in a function chain. Each of the function handling one of the execution phase, respectively.

keyDownloader downloads the file named "loopTime.txt", which stores a number as the loop time that alu function does the calculation. You need to modify the `bucketName` to the name of the bucket where you stores "loopTime.txt". `defaultKey` is the default name of the file "loopTime.txt"

## Deploy
Make sure that you have installed and configured AWS [sam-cli](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)

1. Create a bucket and upload loopTime.txt
2. Modify the `bucketName` and `defaultKey` arguments in `keyDownloader.py` and `together.py`
3. Deploy the functions use sam-cli
    ```bash
    sam build
    # First deploy 
    sam deploy --guided
    ```

## Run
After deployed, you can see the functions at lambda console, and a step function at step-function console.

Use aws-cli to invoke TogetherFunction use the command below (don't forget to replace $YourFunctionArn):
```bash
aws lambda invoke --function-name $YourFunctionArn --payload file://events/aluEvent.json --cli-binary-format raw-in-base64-out response.json
```

Use the step function (ResourceEfficientStateMachine) to run two functions (KeyDownloader, AluFunction) sequentially. 

## NOTICE
This workload refers to the helloworld project created by `sam init` command, which is licensed by Apache License 2.0
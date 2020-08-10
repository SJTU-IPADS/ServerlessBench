# Parallel Composition
This test case features a CPU-intensive Alu application with parallelizable core handling logic.
Three versions are presented to analyze parallelization in serverless computing:

* no-parallel version (sequential.py), with no parallelization;
* instance-parallel version (parallel.py, doAlu.py), with multiple function instances executing concurrently; You need to modify the AluFunctionArn to the arn of the alu function (doAlu.py)
* in-function-parallel version (infunction.py), parallelization with multithreading in a single function.

The workload is basically built by AWS sam-cli

## Deploy
Make sure that you have installed and configured AWS [sam-cli](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)

1. Deploy the functions with sam-cli
    Deployment:
    ```bash
    sam build
    # First deploy 
    sam deploy --guided
    ```

2. Replace the `AluFunctionArn` in parallel.py to the arn of Alu function

3. Deploy the functions with sam-cli again

## Run
After deployed, you can see the functions at lambda console.

Use aws-cli to invoke the functions use the command below (don't forget to replace $YourFunctionArn):
```bash
aws lambda invoke --function-name $YourFunctionArn --payload file://events/aluEvent.json --cli-binary-format raw-in-base64-out response.json
```

## NOTICE
This workload refers to the helloworld project created by `sam init` command, which is licensed by Apache License 2.0
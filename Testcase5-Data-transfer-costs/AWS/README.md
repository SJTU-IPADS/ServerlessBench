# SmallParamTest

## Notes
* The workload is to pass the parameters directly
* If you want to change the workload to transfer parameters > 32KB, just modify `template.yaml`, comment the original handler of HeadFunction and TailFunction, and then uncomment the commented handler (with "bigparam").

## Deploy
Make sure that you have installed and configured AWS [sam-cli](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html).

Deploy the functions by sam cli:
    
```
sam build
sam deploy --guided
```

## Run
After deployed, you can see the functions at lambda console, and a step function at step-function console.

1. Create the payload by `payloadCreater.py`
    ``` bash
    python3 payloadCreater.py
    ```
2. Invoke the functions by the step function (CommStateMachine), with the created payload as the parameter.

## NOTICE
This workload refers to the helloworld project created by `sam init` command, which is licensed by Apache License 2.0
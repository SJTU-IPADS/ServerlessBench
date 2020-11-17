# Testcase5 Data Transfer Costs - OpenWhisk
* Scripts:
    
    * payloadCreater.py: create a payload
    * action_update.sh: upload `ParamPass` function to OpenWhisk
    * action_invoke.sh: invoke a single `ParamPass` function
    * sequence_invoke.sh: invoke a `ParamPass` function sequence
    * single-cold_warm.sh: do the communication test
* Quick start:
    ```bash
    # now pwd is .../Testcase5-Data-transfer-costs/OpenWhisk
    ./action_update.sh
    ./single-cold_warm.sh
    ```
# Testcase5 Data Transfer Costs - OpenWhisk
* Scripts:
    
    * payloadCreater.py: create a payload
    * action_update.sh: upload `ParamPass` function to OpenWhisk
    * action_invoke.sh: invoke a single `ParamPass` function
    * sequence_invoke.sh: invoke a `ParamPass` function sequence
    * single-cold_warm.sh: do the test
    > Don't forget that `action_invoke.sh` and `sequence_invoke.sh` need pre-created payloads
* Quick start:
    ```bash
    # Now pwd is .../Testcase5-Data-transfer-costs/OpenWhisk
    # Two subdirectories, `payload/` and `test-results/`, need to be pre-created to store the generated payload and log files 
    ./action_update.sh
    ./single-cold_warm.sh
    ```

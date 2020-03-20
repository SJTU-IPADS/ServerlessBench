# Sequence
The function (sequence) is to find the n-th positive number.

It is implemented in 2 ways:
* Nested Sequence 

    The action invokes another action, and returns until the invoked action returns.

    n can be assigned to any positive integer theoretically. 
    
    However, if n is too large, it's very likely to get a `timeout` as the first action needs to receive the result in 60s. It usually depends on the cold boot time of a runtime container

    Besides, n should not be greater than the maximum allowed number of the concurrent runtime containers, which is limited by openwhisk.    


* Chained Sequence

    The action is implemented by the "action sequence" provided by Openwhisk. Each action delivers its result to another action and finish itself.
    The number of action is statically assigned to 100, and each action makes the result += 1. 

The 2 functions are designed to compare these 2 ways to implement an action sequence.
## Notes
The Chained Sequence create an openwhisk action-sequence at the length n. As a result, the openwhisk should be configured to support the action sequence of length n.

## Parameter
* Nested Sequence
    * n

        Should be int and positive.
* Chained Sequence
    * n

        Should be 0 to get the final result 100. 

        If the sequence's length is changed to `len`, then `n:0` will get the result `result: len`

## Return Value
* Nested Sequence 
    * The start time of each action (timestamp; millisecond)
    * The return time of each action (timestamp; millisecond)
    * The time of each action to invoke another action, except the last one(timestamp; millisecond)
    * the result (n)

* Chained Sequence
    * The start time of each action
    * The return time of each action
    * The result (n)
## How to Deploy
Run `./action_update.sh` in the `./action/`. The default length of the sequence is 100

To modify the length of the sequence, run `./action_update.sh [n]`, as `n` is the length of the sequence
## How to Invoke
Run `./action_invoke.sh` or `./action_invoke_seq.sh` in the `./action/`

## Scripts 
### Sequence Chained
* single-cold_warm.sh
    
    **Usage:** 
    ```bash
    ./single-code_warm [-m <mode>] [-t <loop times>] [-r <result file>] [-w <warm up times>] [-l] 
    ```
    Invoke the action one by one, and echo the invoking timestamp and the returning timestamp.

    * mode: can be "warm" or "cold". 
    
      The default mode is "warm"
    
      * warm

        The action invokes the first action to ensure that there's a paused container, and then invoke \<loop times> actions.

      * cold
    
        Invoke \<loop times> actions. Before every action is invoked, stop all the paused runtime containers of the action first.

    * loop times

      The times to invoke the action.

      If the mode is "warm", the default value is 10; 
      
      else, the default value is 3.

    * warm up times

      If the mode is "warm", the action needs to be warmed up. So, the action will firstly be invoked \<warm up times> times.

      The default value is 1.

    * result file

      With the specified file directory, the final result of the test will be appended to the end of the file.
    
    * -l
      
      Output the timestamps to the log.

    * -W

      Warm up only:
      The script only warms up the container and then stops.
      
      *'-R' and '-W' can not be assigned at the same time. -W could only be used in 'warm' mode*

    * -R
      
      Run only:
      The script does not warm up the container.

      This mode requires existing paused containers of this action.

      *'-R' and '-W' can not be assigned at the same time.*

* run.py

    **Usage:**
    ``` bash
    python3 run.py <client number> <looptimes> [<warm up times>]
    ```

    The python script let \<client number> clients invoke the action concurrently, and each client invokes the action \<looptimes> times.
    
    **Output**
    * result.csv

        The invoking timestamp and the returning timestamp of each activation.
    
    * stdout
        
        The latency and the throughput.

    * eval-result.log

        Append the results to the log.

* eval.sh

    **Usage:**
    ``` bash
    ./eval.sh
    ```
    Run several tests and output a comprehensive result.

    Result log: eval-result.log

### Sequence Nested
Because of the high probability of timeout, this way to implement an arraySum function is not recommended. As a result, no general test script is provided.

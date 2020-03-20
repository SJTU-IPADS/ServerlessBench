# Lmbench
The `bw_mem` of lmbench deployed to Openwhisk. The basic usage of lmbench `bw_mem` can be found at http://lmbench.sourceforge.net/man/bw_mem.8.html

**The basic usage of bw_mem is:**
```bash
    bw_mem [-P <parallelism>] [-W <warmup>] [-N <repetitions>] <size> what [conflict]
    # what: rd wr rdwr cp fwr frd fcp bzero bcopy
    # <size> must be larger than 512
```

The `bw_mem` binary file is statically linked and resides in the runtime docker container (and renamed to "`bw_mem_static`"). So we just need to write a script to parse the parameters as well as the return values. 

## Parameter
* work

    Should be rd, wr, rdwr, cp, fwr, frd, fcp, bzero or bcopy.
* size
    
    Should be int greater than 512

* parralelism (optional)

    One of the optional bw_mem arguments
* warmups (optional)

    One of the optional bw_mem arguments
* repetitions (optional)

    One of the optional bw_mem arguments


## Return Value
* Memory bandwidth (Megabytes per second)
* Size (Megabytes)
* The start time of the action (timestamp; millisecond)
* The return time of the action (timestamp; millisecond)
## How to Deploy
Run `./action_update.sh` in the `./action/`

The script mainly deployed the `script.sh`, whose duty is to parse the parameters. 

#### Alter the lmbench source code
If it is needed to modify the lmbench `bw_mem` source file, there is much more work to do: 

Firstly, we can git clone the lmbench source code, and modify the source code in its /src sub directory. We have an example in the ./action (added the start timestamp and return timestamp)

Secondly, we need to statically compile the source code and get a binary file `bw_mem`. The dynamic link libraries may be different in the host OS and the runtime docker container, so static link is needed if we want to compile it by the host OS.

Thirdly, build a new docker image. The base image could be `openwhisk/dockerskeleton`, and we just need to copy the new binary file `bw_mem` to `/action` of the image.
Then, update the action and use the new image (specifically, we can modify the `--docker` option in `./action/action_update.sh`).

After that, the deployed parser script (`script.sh` in `./action`) could find the `bw_mem` binary file in its `./` relative path.

## How to Invoke
Run `./action_update.sh` in the `./action/`

The parameter is `{"work":"rdwr","size":102140, "parralelism":2}. It corresponds to the basic usage of bw_mem like this:
``` bash
bw_mem -P 2 102140 rdwr
```

## Test Scripts
* single-cold_warm.sh

    **Usage:**

    ``` bash
    ./single-code_warm [-m <mode>] [-t <loop times>] [-w <warm up times>] [-r <result file>] [-l] [-W] [-R]
    ```
    Invoke the action one by one, and echo the invoking timestamp, starting timestamp and the returning timestamp.

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
    python3 run.py <client number> <looptimes>
    ```

    The python script let \<client number> clients invoke the action concurrently, and each client invokes the action \<looptimes> times.
    
    **Output**
    * result.csv

        The invoking timestamp, starting timestamp and the returning timestamp of each activation.
    
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

## ACKNOWLEDGEMENT
We modified the source code of [lmbench](http://lmbench.sourceforge.net/) to fit the openwhisk output. Specifically, the patch files reside in the ./patch directory

List of modified source code (the path is the relative path of lmbench):
* src/bw_mem.c
* src/Makefile

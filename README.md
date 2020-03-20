# serverlessBench

**This is an anonymous repo for Serverless Bench (submitted paper)**.
**We will put more documents, test cases, as well as results soon.**.

A serverless benchmark suit, with micro and macro test suite, and some evaluation results.

## Getting Started
### Download code

`git clone https://github.com/ServerlessBench/ServerlessBench.git`


### Prerequisite

- OpenWhisk and `wsk` cli tool.
  Check OpenWhisk configuration to make sure it allows at least **20** containers (action invokers) to execute concurrently, or some test cases (e.g., [Alexa skills application](Represented Workloads)) might stuck and fail due to resource limitation. Similarly, if you modify eval-config to evaluate higher concurrency scenarios, the concurrency limitation from OpenWhisk should also be checked.
  - change the configurations in local.env according to your own settings (e.g. IP, port...)

### Denpendencies
  - `gcc` >= 7.0
  - `maven` >= 3.6.0
  - `nodejs` >= 12.0
  - `jq`

Dependencies for online-compiling application:
  - `gcc` >= 7.0
  - `protobuf-compiler`, `libprotobuf-dev` >= 3.0
  - `libcrypto++-dev` >= 5.6.3
  - `python3`
  - `libcap-dev`
  - `libncurses5-dev`
  - `libboost-dev`
  - `libssl-dev`
  - `autopoint`
  - `help2man`
  - `texinfo`
  - `automake`
  - `libtool`
  - `pkg-config`
  - `libhiredis-dev`
  - `python3-boto3`

You can install this dependencies in Ubuntu (17.04 or newer) by running:

  ```
  sudo apt-get install maven nodejs jq\
                       gcc-7 g++-7 protobuf-compiler libprotobuf-dev \
                       libcrypto++-dev libcap-dev \
                       libncurses5-dev libboost-dev libssl-dev autopoint help2man \
                      libhiredis-dev texinfo automake libtool pkg-config python3-boto3
								      ```

**It's strongly recommended to use Ubuntu 17.04 or newer**

### Test Macro
	
	$ ./deploy.sh
	$ ./eval.sh




# Micro Benchmarks
The functions can be deployed to Openwhisk. Scripts are also provided to calculate some important metrics, for example, startup latency, execution time, etc.

Explore the corresponding subdirectory of each benchmark for more details. 

## Functions for different languages
The functions this part are implemented in 5 different languages. For each language, we have a helloworld function as well as a relatively more complex application. 

The helloworld functions return "helloworld", as well as the timestamp at the beginning of the function.

The details of these complex applications are in the subdirectory.

#### Function lists.  
* C-hello
    
* Python-hello

* Nodejs-hello

* Java-hello

* Ruby-hello

* Python-app

* Nodejs-app

* Java-app

* Ruby-app

## Lmbench
The function runs the bw_mem benchmark of the open source performance analysis benchmark [lmbench](http://www.bitmover.com/lmbench/).

## Alu

The function is a single thread nodejs application which simply does a lot of calculation.

## Sequence
The Sequence returns the result of the n-th positive integer. It is implemented in 2 ways:

* Nested
    
    The action invokes another action, and returns until the invoked action returns.

* Chained

    The action is implemented by the "action sequence" provided by Openwhisk. Each action delivers its result to another action and finish itself.


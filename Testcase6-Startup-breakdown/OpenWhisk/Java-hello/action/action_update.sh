#!/bin/bash
javac -cp ./gson-2.8.2.jar Hello.java
jar cvf hello.jar Hello.class

wsk -i action update hello-java hello.jar --main Hello --docker openwhisk/java8action

#!/bin/bash


echo "build the new java jar package"
javac -cp ./gson-2.8.2.jar JavaResize.java
jar cvf JavaResize.jar JavaResize.class

echo "update the action"
# wsk -i action update complex-java JavaResize.jar --main JavaResize --memory 128 --docker openwhisk/java8action


#!/bin/bash

export SERVERLESSBENCH_HOME=$(pwd)

echo SERVERLESSBENCH_HOME=$SERVERLESSBENCH_HOME

function runMacro() {
    cd macro
    ./eval.sh $1
    cd ..

    echo "serverless applications result: "
    cat macro/eval-result.log
}

function runMicro() {
    cd micro
    ./eval.sh
    cd ..

    echo "serverless micro apps result: "
    cat micro/eval-result.log
}

function usage() {
    echo -e "Usage: $0 [--micro,--macro,--image-process,--alexa,--online-compiling,--data-analysis,--online-compiling-make,--online-compiling-llvm]"
}

if [[ $# -lt 1 ]]; then
    runMicro
    runMacro
else
    case "$1" in
    "--micro" )
    runMicro
    ;;
    "--macro" )
    runMacro "--all"
    ;;
    "--image-process" )
    runMacro $1
    ;;
    "--alexa" )
    runMacro $1
    ;;
    "--online-compiling" )
    runMacro $1
    ;;
    "--online-compiling-make" )
    runMacro $1
    ;;
    "--online-compiling-llvm" )
    runMacro $1
    ;;
    "--data-analysis" )
    runMacro $1
    ;;
    * )
    usage
    ;;
    esac
fi


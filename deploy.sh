#!/bin/bash

export SERVERLESSBENCH_HOME=$(pwd)

echo SERVERLESSBENCH_HOME=$SERVERLESSBENCH_HOME

function deployMicro() {
    cd micro
    ./deploy.sh
    cd ..
}

function deployMacro() {
    cd macro
    ./deploy.sh $1
    cd ..
}

function usage() {
    echo -e "Usage: $0 [--micro,--macro,--image-process,--alexa,--online-compiling,--data-analysis]"
}

if [[ $# -lt 1 ]]; then
    deployMicro
    deployMacro
else
    case "$1" in
    "--micro" )
    deployMicro
    ;;
    "--macro" )
    deployMacro "--all"
    ;;
    "--image-process" )
    deployMacro $1
    ;;
    "--alexa" )
    deployMacro $1
    ;;
    "--online-compiling" )
    deployMacro $1
    ;;
    "--data-analysis" )
    deployMacro $1
    ;;
    * )
    usage
    ;;
    esac
fi

#!/bin/bash

function deployImage() {
    echo "deploying image-process functions..."
    cd image-process
    ./scripts/deploy.sh
    cd ..
}

function deployAlexa() {
    echo "deploying alexa functions..."
    cd alexa
    ./scripts/deploy.sh
    cd ..
}

function deployDA() {
    echo "deploying data-analysis functions..."
    cd data-analysis
    ./scripts/deploy.sh
    cd ..
}

function deployGG() {
    echo "deploying online-compiling functions..."
    cd online-compiling
    ./deploy.sh
    cd ..
}

function usage() {
    echo -e "Usage: $0 [--micro,--macro,--image-process,--alexa,--online-compiling,--data-analysis]"
}

if [[ $# -lt 1 ]]; then
    usage
else 
    case "$1" in
    "--all" )
    deployImage
    deployAlexa
    deployGG
    deployDA
    ;;
    "--image-process" )
    deployImage
    ;;
    "--alexa" )
    deployAlexa
    ;;
    "--online-compiling" )
    deployGG
    ;;
    "--data-analysis" )
    deployDA
    ;;
    * )
    usage
    ;;
    esac
fi

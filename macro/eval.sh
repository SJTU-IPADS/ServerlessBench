#!/bin/bash

result=eval-result.log
rm -f $result

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $DIR

function runImage() {
    echo "measuring image-process application..."
    cd image-process
    ./scripts/eval.sh
    cd $DIR
    echo -e "\n\n>>>>>>>> image-process <<<<<<<<\n" >> $result
    cat image-process/$result >> $result
}

function runAlexa() {
    echo "measuring alexa application..."
    cd alexa
    ./scripts/eval.sh
    cd $DIR
    echo -e "\n\n>>>>>>>> alexa <<<<<<<<\n" >> $result
    cat alexa/$result >> $result
}

function runGGMake() {
    echo "measuring online-compiling application (make) ..."
    cd online-compiling/examples/make
    ./scripts/eval.sh
    cd $DIR
    echo -e "\n\n>>>>>>>> online-compiling (make) <<<<<<<<\n" >> $result
    cat online-compiling/examples/make/$result >> $result
}

function runGGLLVM() {
    echo "measuring online-compiling application (llvm) ..."
    cd online-compiling/examples/llvm
    ./scripts/eval.sh
    cd $DIR
    echo -e "\n\n>>>>>>>> online-compiling (llvm) <<<<<<<<\n" >> $result
    cat online-compiling/examples/llvm/$result >> $result
}

function runDA() {
    echo "measuring data-analysis application..."
    cd data-analysis
    ./scripts/eval.sh
    cd $DIR
    echo -e "\n\n>>>>>>>> data-analysis <<<<<<<<\n" >> $result
    cat data-analysis/$result >> $result
}

function usage() {
    echo -e "Usage: $0 [--all,--image-process,--alexa,--online-compiling,--data-analysis,--online-compiling-make,--online-compiling-llvm]"
}

if [[ $# -lt 1 ]]; then
    usage
else
    case "$1" in
    "--all" )
    runImage
    runAlexa
    runGGMake
    runDA
    ;;
    "--image-process" )
    runImage
    ;;
    "--alexa" )
    runAlexa
    ;;
    "--online-compiling" )
    runGGMake
    ;;
    "--online-compiling-make" )
    runGGMake
    ;;
    "--online-compiling-llvm" )
    runGGLLVM
    ;;
    "--data-analysis" )
    runDA
    ;;
    * )
    usage
    ;;
    esac
fi

echo "serverless applications result: "
cat $result


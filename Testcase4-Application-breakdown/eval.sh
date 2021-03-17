#!/bin/bash
#
# Copyright (c) 2020 Institution of Parallel and Distributed System, Shanghai Jiao Tong University
# ServerlessBench is licensed under the Mulan PSL v1.
# You can use this software according to the terms and conditions of the Mulan PSL v1.
# You may obtain a copy of Mulan PSL v1 at:
#     http://license.coscl.org.cn/MulanPSL
# THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR
# PURPOSE.
# See the Mulan PSL v1 for more details.
#

result=eval-result.log
rm -f $result

export TESTCASE4_HOME="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $TESTCASE4_HOME

function runImage() {
    echo "measuring image-process application..."
    cd image-process
    ./scripts/eval.sh
    cd $TESTCASE4_HOME
    echo -e "\n\n>>>>>>>> image-process <<<<<<<<\n" >> $result
    cat image-process/$result >> $result
}

function runAlexa() {
    echo "measuring alexa application..."
    cd alexa
    ./scripts/eval.sh
    cd $TESTCASE4_HOME
    echo -e "\n\n>>>>>>>> alexa <<<<<<<<\n" >> $result
    cat alexa/$result >> $result
}

function runGGMake() {
    echo "measuring online-compiling application (make) ..."
    cd online-compiling/examples/make
    ./scripts/eval.sh
    cd $TESTCASE4_HOME
    echo -e "\n\n>>>>>>>> online-compiling (make) <<<<<<<<\n" >> $result
    cat online-compiling/examples/make/$result >> $result
}

function runGGLLVM() {
    echo "measuring online-compiling application (llvm) ..."
    cd online-compiling/examples/llvm
    ./scripts/eval.sh
    cd $TESTCASE4_HOME
    echo -e "\n\n>>>>>>>> online-compiling (llvm) <<<<<<<<\n" >> $result
    cat online-compiling/examples/llvm/$result >> $result
}

function runDA() {
    echo "measuring data-analysis application..."
    cd data-analysis
    ./scripts/eval.sh
    cd $TESTCASE4_HOME
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


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

# set TESTCASE4_HOME to current directory (with local.env and eval-config present)
export TESTCASE4_HOME="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

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
    echo -e "Usage: $0 [--all,--image-process,--alexa,--online-compiling,--data-analysis]"
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

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

if [ -z "$TESTCASE4_HOME" ]; then
    echo "$0: ERROR: TESTCASE4_HOME environment variable not set"
    exit
fi

source $TESTCASE4_HOME/local.env

SCRIPTS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $SCRIPTS_DIR/../src/smarthome

# install dependencies for devices
rm -rf node_modules
cp package-device.json package.json
npm install

# door controller
cp door-index.js index.js
# package handler with dependencies
zip -rq door.zip index.js door-handler.js net.js node_modules ../infra/language.js
# create/update action
wsk -i action update alexa-home-door door.zip --kind nodejs:10 \
  --param IP "$ALEXA_SMARTHOME_IP" \
  --param PORT "$ALEXA_SMARTHOME_PORT_DOOR"

 
# light controller
cp light-index.js index.js
# package handler with dependencies
zip -rq light.zip index.js light-handler.js net.js node_modules ../infra/language.js
# create/update action
wsk -i action update alexa-home-light light.zip --kind nodejs:10 \
  --param IP "$ALEXA_SMARTHOME_IP" \
  --param PORT "$ALEXA_SMARTHOME_PORT_LIGHT"

# TV controller
cp tv-index.js index.js
# package handler with dependencies
zip -rq tv.zip index.js tv-handler.js net.js node_modules ../infra/language.js
# create/update action
wsk -i action update alexa-home-tv tv.zip --kind nodejs:10 \
  --param IP "$ALEXA_SMARTHOME_IP" \
  --param PORT "$ALEXA_SMARTHOME_PORT_TV"

# air-conditioning controller
cp air-conditioning-index.js index.js
# package handler with dependencies
zip -rq air-conditioning.zip index.js air-conditioning-handler.js net.js node_modules ../infra/language.js
# create/update action
wsk -i action update alexa-home-air-conditioning air-conditioning.zip --kind nodejs:10 \
  --param IP "$ALEXA_SMARTHOME_IP" \
  --param PORT "$ALEXA_SMARTHOME_PORT_AIR_CONDITIONING"

# plug controller
cp plug-index.js index.js
# package handler with dependencies
zip -rq plug.zip index.js plug-handler.js net.js node_modules  ../infra/language.js
# create/update action
wsk -i action update alexa-home-plug plug.zip --kind nodejs:10 \
  --param IP "$ALEXA_SMARTHOME_IP" \
  --param PORT "$ALEXA_SMARTHOME_PORT_PLUG"


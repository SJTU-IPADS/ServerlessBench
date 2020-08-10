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

# door controller
wsk -i action invoke alexa-home-door --param-file parameters-open.json --result --blocking

# light controller
wsk -i action invoke alexa-home-light --param-file parameters-open.json --result --blocking

# TV controller
wsk -i action invoke alexa-home-tv --param-file parameters-open.json --result --blocking

# air-conditioning controller
wsk -i action invoke alexa-home-air-conditioning --param-file parameters-open.json --result --blocking

# plug controller
wsk -i action invoke alexa-home-plug --param-file parameters-open.json --result --blocking

# smart home
wsk -i action invoke alexa-smarthome --param-file parameters-smarthome.json --result --blocking

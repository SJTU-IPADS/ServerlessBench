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

SCRIPTS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
pushd $SRC_DIR > /dev/null 2>&1
wsk action update extractImageMetadata extract-image-metadata/target/extract-image-metadata.jar --main org.serverlessbench.ExtractImageMetadata --docker dplsming/java8action-imagemagic -i
wsk action update transformMetadata transform-metadata/target/transform-metadata.jar --main org.serverlessbench.TransformMetadata --docker openwhisk/java8action -i
wsk action update handler handler/target/handler.jar --main org.serverlessbench.Handler --docker openwhisk/java8action -i
wsk action update thumbnail thumbnail/target/thumbnail.jar --main org.serverlessbench.Thumbnail --docker dplsming/java8action-imagemagic -i
wsk action update storeImageMetadata  store-image-metadata/target/store-image-metadata.jar --main org.serverlessbench.StoreImageMetadata --docker openwhisk/java8action -i
popd >/dev/null 2>&1

wsk action update imageProcessSequence --sequence extractImageMetadata,transformMetadata,handler,thumbnail,storeImageMetadata -i


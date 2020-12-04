# Copyright (c) 2020 Institution of Parallel and Distributed System, Shanghai Jiao Tong University
# ServerlessBench is licensed under the Mulan PSL v1.
# You can use this software according to the terms and conditions of the Mulan PSL v1.
# You may obtain a copy of Mulan PSL v1 at:
#     http://license.coscl.org.cn/MulanPSL
# THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR
# PURPOSE.
# See the Mulan PSL v1 for more details.


# Usage: action_update.sh $SEQUENCE_ID $FUNCTION_ID

FUNCTION_DIR=./
CDF_DIR=./CDFs
gcc $FUNCTION_DIR/function.c --static -o $FUNCTION_DIR/function
zip -r function.zip \
$FUNCTION_DIR/__main__.py \
$FUNCTION_DIR/function \
$FUNCTION_DIR/utils.py \
$CDF_DIR/memCDF.csv \
$CDF_DIR/execTimeCDF.csv

SEQUENCE_ID=$1
FUNCTION_ID=$2
# Create function
wsk -i action update func$SEQUENCE_ID-$FUNCTION_ID function.zip --docker lqyuan980413/realworldemulate:0.1

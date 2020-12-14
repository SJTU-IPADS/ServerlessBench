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
wsk -i action update arraySum_chained arraySum_chained.js --memory 256 --docker lqyuan980413/wsk-fibonacci
wsk -i action update arraySum_sequence --sequence arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained,arraySum_chained


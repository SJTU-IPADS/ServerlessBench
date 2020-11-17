
# Copyright (c) 2020 Institution of Parallel and Distributed System, Shanghai Jiao Tong University
# ServerlessBench is licensed under the Mulan PSL v1.
# You can use this software according to the terms and conditions of the Mulan PSL v1.
# You may obtain a copy of Mulan PSL v1 at:
#     http://license.coscl.org.cn/MulanPSL
# THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR
# PURPOSE.
# See the Mulan PSL v1 for more details.

# Usage: python3 payloadCreater.py $payload_size
# Otherwise, user has to manually input the payload
import sys

payload_size = 0
if len(sys.argv) == 2 and str.isdigit(sys.argv[1]) and int(sys.argv[1]) >= 0:
    payload_size = int(sys.argv[1])
else:
    payload_size = int(input("please input the payload size (Byte): "))
param = "{\n\t\"payload\":"
f = open("payload/payload_%d.json" %payload_size, 'w')
f.write(param + "\"%s\"\n}" %(payload_size * '0'))
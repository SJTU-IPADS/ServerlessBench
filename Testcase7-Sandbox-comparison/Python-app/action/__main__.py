
# Copyright (c) 2020 Institution of Parallel and Distributed System, Shanghai Jiao Tong University
# ServerlessBench is licensed under the Mulan PSL v1.
# You can use this software according to the terms and conditions of the Mulan PSL v1.
# You may obtain a copy of Mulan PSL v1 at:
#     http://license.coscl.org.cn/MulanPSL
# THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR
# PURPOSE.
# See the Mulan PSL v1 for more details.

from subprocess import call
import time
import django
def main(args):
    # call a binary helloworld file in the python runtime container
    call(["/home/hello"],stdout=open('./startTime.txt','w'))
    file = open('./startTime.txt','r')
    content = file.readline().split(' ')[4]
    print(content)
    print('Hello world\n')
    print(django.get_version())
    return{'startTime':int(content),
           'retTime':int(round(time.time() * 1000))}

#!/usr/bin/env python3

# Copyright (c) 2020 Institution of Parallel and Distributed System, Shanghai Jiao Tong University
# ServerlessBench is licensed under the Mulan PSL v1.
# You can use this software according to the terms and conditions of the Mulan PSL v1.
# You may obtain a copy of Mulan PSL v1 at:
#     http://license.coscl.org.cn/MulanPSL
# THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR
# PURPOSE.
# See the Mulan PSL v1 for more details.


import os
import sys
from zipfile import ZipFile
import tempfile
import shutil
import argparse
import hashlib
import base64
#import boto3

PACKAGE_GG_DIR = "_gg"

functions = [
    ("openwhisk", []), # the generic function

    #["gcc", "cc1"],
    #["gcc", "as"],
    #["gcc", "collect2", "ld"],

    #["g++", "cc1plus"],
    #["g++", "as"],
    #["g++", "collect2", "ld"],

    #["ranlib"],
    #["ar"],
    #["strip"],
    #["ld"],
]

hash_cache = {}

def executable_hash(hashes):
    hashes.sort()
    str_to_hash = "".join(hashes).encode('ascii')
    return "{}".format(base64.urlsafe_b64encode(hashlib.sha256(str_to_hash).digest()).decode('ascii').replace('=',''))


def gghash(filename, block_size=65536):
    sha256 = hashlib.sha256()
    size = 0

    with open(filename, 'rb') as f:
        for block in iter(lambda: f.read(block_size), b''):
            size += len(block)
            sha256.update(block)

    return "V{}{:08x}".format(base64.urlsafe_b64encode(sha256.digest()).decode('ascii').replace('=','').replace('-', '.'), size)

def create_function_package(label, output, function_execs, gg_execute_static):
    PACKAGE_FILES = {
        "gg-execute-static": gg_execute_static,
        "__main__.py": "%s_function/__main__.py" % label,
        "ggpaths.py": "common/ggpaths.py",
        "common.py": "common/common.py"
    }

    for exe in function_execs:
        PACKAGE_FILES["executables/{}".format(exe[0])] = exe[1]

    with ZipFile(output, 'a') as funczip:
        for fn, fp in PACKAGE_FILES.items():
            funczip.write(fp, fn)

def install_openwhisk_package(package_file, function_name, delete=False):
    print('[WARNING: install package function not implemented. please install manually.]')
#    with open(package_file, 'rb') as pfin:
#        package_data = pfin.read()
#
#    client = boto3.client('lambda', region_name=region)
#
#    if delete:
#        try:
#            client.delete_function(FunctionName=function_name)
#        except:
#            pass
#
#    response = client.create_function(
#        FunctionName=function_name,
#        Runtime='python3.6',
#        Role=role,
#        Handler='main.handler',
#        Code={
#            'ZipFile': package_data
#        },
#        Timeout=300,
#        MemorySize=3008,
#        Tags={
#            'gg': 'generic',
#        }
#    )
#
#    print(response['FunctionArn'])

def main():
    parser = argparse.ArgumentParser(description="Generate and install Lambda functions.")
    parser.add_argument('--delete', dest='delete', action='store_true', default=False)
    parser.add_argument('--role', dest='role', action='store',
                        default=os.environ.get('GG_LAMBDA_ROLE'))
    parser.add_argument('--region', dest='region', default=os.environ.get('AWS_REGION'), action='store')
    parser.add_argument('--gg-execute-static', dest='gg_execute_static',
                        default=shutil.which("gg-execute-static"))
    parser.add_argument('--toolchain-path', dest='toolchain_path', required=True)

    args = parser.parse_args()

    if not args.gg_execute_static:
        raise Exception("Cannot find gg-execute-static")

    for label, func in functions:
        function_execs = [(f, os.path.join(args.toolchain_path, f)) for f in func]
        function_execs = [(gghash(f[1]), f[1]) for f in function_execs]
        hashes = [f[0] for f in function_execs]

        if len(function_execs) == 0:
            function_name = "gg-%s-function" % label
        else:
            function_name = "{prefix}{exechash}".format(
                prefix="gg-", exechash=executable_hash(hashes)
            )

        function_file = "{}.zip".format(function_name)
        create_function_package(label, function_file, function_execs, args.gg_execute_static)
#        print("Installing openwhisk function {}... ".format(function_name), end='')
#        install_openwhisk_package(function_file, function_name, delete=args.delete)
        print("done.")
#        os.remove(function_file)

if __name__ == '__main__':
    main()

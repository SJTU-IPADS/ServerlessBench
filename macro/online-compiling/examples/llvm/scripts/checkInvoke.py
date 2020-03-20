import sys
import os

# checkInvoke.py should be executing in parent dir of src

# check: 
r = os.popen("./llvm-build/bin/llvm-tblgen --help")
output = r.read()
#print(output)
if output.find('USAGE: llvm-tblgen [options] <input file>') != -1:
    sys.exit(0)

print('ERROR invoking online-compiling (simple make) application.')
sys.exit(1)

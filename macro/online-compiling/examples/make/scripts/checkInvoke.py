import sys
import os

# checkInvoke.py should be executing in parent dir of src

# check: hellomake output
r = os.popen("./src/hellomake")
output = r.read()
#print(output)
if output.find('Hello makefiles!') != -1:
    sys.exit(0)

print('ERROR invoking online-compiling (simple make) application.')
sys.exit(1)

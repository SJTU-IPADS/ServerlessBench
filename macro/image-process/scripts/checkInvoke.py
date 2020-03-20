import sys

# check: albumID field
inputArgs = sys.argv[1:]
for line in inputArgs:
    if line.find('albumID') != -1:
        sys.exit(0)

print('ERROR invoking image-process application. action result: ')
print(*inputArgs, sep = "\n")
sys.exit(1)

import sys

# check: outputSpeech field
inputArgs = sys.argv[1:]
for line in inputArgs:
    if line.find('door: switch ON, light: switch ON, tv: switch ON, air-conditioning: switch ON, plug: switch ON') != -1:
        sys.exit(0)

print('ERROR invoking alexa application. action result: ')
print(*inputArgs, sep = "\n")
sys.exit(1)

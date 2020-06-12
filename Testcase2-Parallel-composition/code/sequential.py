import random
import time

def sequential_handler(event, context):
    startTime = GetTime()
    if 'n' in event:
        times = event['n']
        temp = alu(times)
        return{
            'result': temp,
            'times': times,
            'execTime': GetTime() - startTime
        }
    else:
        return{
            'error': "No n in event"
        }
    


def GetTime():
    return int(round(time.time() * 1000))

def alu(times):
    a = random.randint(10, 100)
    b = random.randint(10, 100)
    temp = 0
    for i in range(times):
        if i % 4 == 0:
            temp = a + b
        elif i % 4 == 1:
            temp = a - b
        elif i % 4 == 2:
            temp = a * b
        else:
            temp = a / b
    print(times)
    return temp
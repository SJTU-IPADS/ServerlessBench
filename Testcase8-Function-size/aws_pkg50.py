import time
import mypy
import numpy

def handler(event, context):
    startTime = time.time()

    print('Hello world\n')

    return{'startTime':int(round(startTime * 1000)),
           'retTime':int(round(time.time() * 1000))}

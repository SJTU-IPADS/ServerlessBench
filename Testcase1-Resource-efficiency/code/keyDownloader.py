import boto3
import time
import os

bucketName = "resource-efficient"
defaultKey = "loopTime.txt"

def lambda_handler(event, context):
    startTime = GetTime()
    if 'key' in event:
        key = event['key']
    else:
        key = defaultKey

    download_file(key)
    loopTime = extractLoopTime(key)
    # meta = extractMetadata(key)
    # upload_file(key)
    retTime = GetTime()
    return {
        "startTime": startTime,
        "retTime": retTime,
        "execTime": retTime - startTime,
        "loopTime": loopTime,
        "key": key
    }


def download_file(key):
    filepath = "/tmp/%s" %key

    s3 = boto3.client('s3')
    with open(filepath, 'wb+') as f:
        s3.download_fileobj(bucketName, key, f)


def extractLoopTime(key):
    filepath = "/tmp/%s" %key
    txtfile = open(filepath, 'r')
    loopTime = int(txtfile.readline())
    print("loopTime: " + str(loopTime))
    txtfile.close()
    return loopTime


def GetTime():
    return int(round(time.time() * 1000))
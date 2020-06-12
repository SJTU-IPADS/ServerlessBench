import json
import boto3
import time
# import requests

def lambda_handler(event, context):
    startTime = GetTime()
    payload = event['payload']
    print(payload)
    commTime = startTime - event['retTime']
    return {
        'commTime': commTime
    }


def lambda_handler_bigparam(event, context):
    startTime = GetTime()
    payload_size = event['payload_size']
    text = download_file(payload_size)
    downloadTime = GetTime()
    print(text)

    retTime = event['retTime']
    uploadTime = event['uploadTime']
    print("startTime:" + str(startTime))
    print("downloadTime:" + str(downloadTime))
    wholeCommTime = downloadTime - uploadTime
    commTime = startTime - retTime

    # upload_file(payload_size)
    return {
        'wholeCommTime': wholeCommTime,
        'commTime': commTime
    }

def upload_file(payload_size):
    path = "payload_%d.json" %payload_size
    filepath = "/tmp/%s" %path
    param = "{\n\t\"payload\":"
    f = open(filepath, 'w')
    f.write(param + "\"%s\"\n}" %(payload_size * '0'))
    f.close()
    s3 = boto3.resource('s3')
    s3.meta.client.upload_file(filepath, 'paramtest2020516', path)

def download_file(payload_size):
    path = "payload_%d.json" %payload_size
    filepath = "/tmp/%s" %path
    s3 = boto3.client('s3')
    with open(filepath, 'wb+') as f:
        s3.download_fileobj('paramtest2020516', path, f)
        f.seek(0)
        text = f.read()
        return text

def GetTime():
    return int(round(time.time() * 1000))
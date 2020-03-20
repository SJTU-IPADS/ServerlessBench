import subprocess
import requests
import json

APIHOST = 'http://192.168.12.239:9090'
AUTH_KEY = subprocess.check_output("wsk -i property get --auth", shell=True).split()[2] 
NAMESPACE = 'guest'
ACTION = 'gg-openwhisk-function'
REQFILE = open("./request.json")
PARAMS = json.load(REQFILE)
BLOCKING = 'true'
RESULT = 'true'

user_pass = AUTH_KEY.split(':')
url = APIHOST + '/api/'+ user_pass[0] + '/'+ NAMESPACE + '/' + ACTION
print('url=' + url)
#response = requests.post(url, json=PARAMS, params={'blocking': BLOCKING, 'result': RESULT})
req = requests.Request('POST', url, json=PARAMS, params={'blocking': BLOCKING})
prepared = req.prepare()

'''
print('{}\n{}\r\n{}\r\n\r\n{}'.format(
     '-----------START-----------',
     prepared.method + ' ' + prepared.url,
     '\r\n'.join('{}: {}'.format(k, v) for k, v in prepared.headers.items()),
     prepared.body,
))
'''
s = requests.Session()
response = s.send(prepared)
print(response.text)

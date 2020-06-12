from subprocess import call
import time
import django
def main(args):
    # call a binary helloworld file in the python runtime container
    call(["/home/hello"],stdout=open('./startTime.txt','w'))
    file = open('./startTime.txt','r')
    content = file.readline().split(' ')[4]
    print(content)
    print('Hello world\n')
    print(django.get_version())
    return{'startTime':int(content),
           'retTime':int(round(time.time() * 1000))}

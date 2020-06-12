payload_size = int(input("please input the payload size (Byte): "))
param = "{\n\t\"payload\":"
f = open("payload_%d.json" %payload_size, 'w')
f.write(param + "\"%s\"\n}" %(payload_size * '0'))

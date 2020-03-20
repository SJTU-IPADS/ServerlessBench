
import os
import re
import unittest
class TestMicroActionInvoke(unittest.TestCase):        
    # Test the type of each attribute of the returned json
    def test_Chello(self):
        command = "cd ./C-hello/action && ./action_invoke.sh"
        r = os.popen(command)
        resText = r.read()

        print(resText)
        self.assertEqual(type(eval(resText)),dict)
        res = eval(resText)
        self.assertEqual(type(res['startTime']),int)
        self.assertEqual(type(res['args']),dict)
        self.assertEqual(type(res['msg']),str)
        args = res['args']
        self.assertEqual(type(args['name']),str)    

        self.assertEqual(args['name'],'Messi')
        self.assertEqual(res['msg'],'Hello from arbitrary C program!')

        r.close()
    
    def test_Javahello(self):
        command = "cd ./Java-hello/action && ./action_invoke.sh"
        r = os.popen(command)
        resText = r.read()

        print(resText)
        self.assertEqual(type(eval(resText)),dict)
        res = eval(resText)
        self.assertEqual(type(res['startTime']),int)
        self.assertEqual(type(res['greeting']),str)
        
        self.assertEqual(res['greeting'],'Hello Messi!')

        r.close()

    def test_Nodehello(self):
        command = "cd ./Nodejs-hello/action && ./action_invoke.sh"
        r = os.popen(command)
        resText = r.read()

        print(resText)
        self.assertEqual(type(eval(resText)),dict)
        res = eval(resText)
        self.assertEqual(type(res['startTime']),int)

        self.assertEqual(res['greeting'],'Hello, Messi')
        r.close()

    def test_Pythonhello(self):
        command = "cd ./Python-hello/action && ./action_invoke.sh"
        r = os.popen(command)
        resText = r.read()

        print(resText)
        self.assertEqual(type(eval(resText)),dict)
        res = eval(resText)
        self.assertEqual(type(res['startTime']),int)

        self.assertEqual(res['greeting'],'Hello Messi!')
        r.close()

    def test_Rubyhello(self):
        command = "cd ./Ruby-hello/action && ./action_invoke.sh"
        r = os.popen(command)
        resText = r.read()

        print(resText)
        self.assertEqual(type(eval(resText)),dict)
        res = eval(resText)

        self.assertEqual(res['hello'],'world')
        r.close()

    def test_Capp(self):
        command = "cd ./C-app/action && ./action_invoke.sh"
        r = os.popen(command)
        resText = r.read()

        print(resText)
        self.assertEqual(type(eval(resText)),dict)
        res = eval(resText)
        
        pri_key = (int(res['pri_key'].split(',')[0][1:]),int(res['pri_key'].split(',')[1][:-1]))
        pub_key = (int(res['pub_key'].split(',')[0][1:]),int(res['pub_key'].split(',')[1][:-1]))
        
        m = 2
        # Encrypt
        c = m**pub_key[0] % pub_key[1]
        # Test decrypt 
        self.assertEqual(c**pri_key[0] % pri_key[1],2)

        r.close()

    
    def test_Javaapp(self):
        command = "cd ./Java-app/action && ./action_invoke.sh"
        r = os.popen(command)
        resText = r.read()

        print(resText)
        self.assertEqual(type(eval(resText)),dict)
        res = eval(resText)

        self.assertEqual(type(res['executeTime']),int)
        self.assertEqual(type(res['startTime']),int)
        
        base64Pattern = "^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$"
        self.assertTrue(re.match(base64Pattern,res['image']),1)

        r.close()
    def test_Nodeapp(self):
        command = "cd ./Nodejs-app/action && ./action_invoke.sh"
        r = os.popen(command)
        resText = r.read()

        print(resText)
        self.assertEqual(type(eval(resText)),dict)
        res = eval(resText)

        self.assertEqual(res['result'],'end function')
        self.assertEqual(type(res['retTime']),int)
        self.assertEqual(type(res['startTime']),int)
        self.assertTrue(res['startTime'] <= res['retTime'])

        self.assertEqual(type(res['body']),list)
        self.assertEqual(len(res['body']),1)
        body = res['body'][0]

        self.assertEqual(type(body['requestTime']),int)
        self.assertEqual(type(body['responseTime']),int)

        self.assertTrue(body['requestTime'] <= body['responseTime'])

        r.close()

    def test_Pythonapp(self):
        command = "cd ./Python-app/action && ./action_invoke.sh"
        r = os.popen(command)
        resText = r.read()

        print(resText)
        self.assertEqual(type(eval(resText)),dict)
        res = eval(resText)

        self.assertEqual(type(res['retTime']),int)
        self.assertEqual(type(res['startTime']),int)
        self.assertTrue(res['retTime'] >= res['startTime'])

        r.close()
    def test_Rubyapp(self):
        command = "cd ./Ruby-app/action && ./action_invoke.sh"
        r = os.popen(command)
        resText = r.read()

        print(resText)
        self.assertEqual(type(eval(resText)),dict)
        res = eval(resText)
        
        self.assertEqual(type(res['startTime']),str)
        self.assertEqual(len(res['startTime']),13)
        
        r.close()

    def test_Lmbench(self):
        command = "cd ./Lmbench/action && ./action_invoke.sh"
        r = os.popen(command)
        resText = r.read()

        print(resText)
        self.assertEqual(type(eval(resText)),dict)
        res = eval(resText)

        self.assertEqual(type(res['retTime']),int)
        self.assertEqual(type(res['startTime']),int)
        self.assertTrue(res['retTime'] >= res['startTime'])

        r.close()
    def test_Alu(self):
        command = "cd ./Alu/action && ./action_invoke.sh"
        r = os.popen(command)
        resText = r.read()

        print(resText)
        self.assertEqual(type(eval(resText)),dict)
        res = eval(resText)
        self.assertEqual(res['result'],384)

        r.close()

    def test_Sequence(self):
        command = "cd ./Sequence/Sequence-chained/action && ./action_invoke_seq.sh"
        r = os.popen(command)
        resText = r.read()

        print(resText)
        self.assertEqual(type(eval(resText)),dict)
        res = eval(resText)

        self.assertEqual(type(res['retTimes']),list)
        self.assertEqual(type(res['startTimes']),list)
        self.assertEqual(res['n'],100)
        self.assertEqual(len(res['startTimes']),100)
        self.assertEqual(len(res['retTimes']),100)

        r.close()

if __name__ == '__main__':
    unittest.main()

#!/bin/bash
wsk -i action update ParamPass ParamPass.js --docker openwhisk/nodejs6action
wsk -i action update ParamPassSeq --sequence ParamPass,ParamPass
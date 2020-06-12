#!/bin/bash
wsk -i action invoke ParamPassSeq --param-file payload_$1.json --blocking --result
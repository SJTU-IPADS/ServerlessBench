#!/bin/bash
wsk -i action invoke ParamPass --param-file payload_$1.json --blocking --result
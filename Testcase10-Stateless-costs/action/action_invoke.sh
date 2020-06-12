#!/bin/bash
wsk -i action invoke complex-java --result --blocking --param-file base64_param.json

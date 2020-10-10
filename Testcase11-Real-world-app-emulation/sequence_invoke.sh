#!/bin/bash
# $1 represents the sequence number of the generated sample application.
wsk -i action invoke app$1 -p sequence 0 --blocking --result

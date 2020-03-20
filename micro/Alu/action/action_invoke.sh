#!/bin/bash
wsk -i action invoke alu --param a 12 --param b 32 --param times 0xfffffff --result --blocking


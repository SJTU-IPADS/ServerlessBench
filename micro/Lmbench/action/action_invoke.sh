#!/bin/bash
wsk -i action invoke lmbench --blocking --result --param size 102140 --param work rdwr --param parralelism 2

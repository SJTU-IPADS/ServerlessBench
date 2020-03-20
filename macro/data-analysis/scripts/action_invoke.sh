#!/bin/bash

wsk -i action invoke wage-insert --param-file parameters.json --result --blocking

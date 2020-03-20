#!/bin/bash

# sample add item action
wsk -i action invoke alexa-reminder --param-file parameters-reminder-add.json --result --blocking

# sample retrieve item action
wsk -i action invoke alexa-reminder --param-file parameters-reminder-retrieve.json --result --blocking

#!/bin/bash

wsk -i action invoke alexa-fact --param-file parameters-fact.json --result --blocking

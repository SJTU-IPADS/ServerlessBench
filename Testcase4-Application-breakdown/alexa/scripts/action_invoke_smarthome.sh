#!/bin/bash

# door controller
wsk -i action invoke alexa-home-door --param-file parameters-open.json --result --blocking

# light controller
wsk -i action invoke alexa-home-light --param-file parameters-open.json --result --blocking

# TV controller
wsk -i action invoke alexa-home-tv --param-file parameters-open.json --result --blocking

# air-conditioning controller
wsk -i action invoke alexa-home-air-conditioning --param-file parameters-open.json --result --blocking

# plug controller
wsk -i action invoke alexa-home-plug --param-file parameters-open.json --result --blocking

# smart home
wsk -i action invoke alexa-smarthome --param-file parameters-smarthome.json --result --blocking

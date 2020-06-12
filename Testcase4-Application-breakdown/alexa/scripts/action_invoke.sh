#!/bin/bash

#wsk -i action invoke alexa-frontend --param utter 'open fact' --result --blocking
#wsk -i action invoke alexa-frontend --param utter 'open reminder to associate sunglasses with seashore' --result --blocking
#wsk -i action invoke alexa-frontend --param utter 'open reminder to get items for seashore' --result --blocking
wsk -i action invoke alexa-frontend --param utter 'open smarthome to I love Taylor Swift' --result --blocking

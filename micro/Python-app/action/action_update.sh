#!/bin/bash
zip -r helloPython __main__.py 
wsk -i action update complex-python helloPython.zip  --docker lqyuan980413/complexpy


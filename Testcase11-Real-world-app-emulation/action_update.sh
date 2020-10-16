gcc function.c --static -o function
zip -r function.zip __main__.py function memCDF.csv
wsk -i action update func function.zip --docker openwhisk/python3action

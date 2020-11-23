FUNCTION_DIR=./
CDF_DIR=./CDFs
gcc $FUNCTION_DIR/function.c --static -o $FUNCTION_DIR/function
zip -r function.zip \
$FUNCTION_DIR/__main__.py \
$FUNCTION_DIR/function \
$FUNCTION_DIR/utils.py \
$CDF_DIR/memCDF.csv \
$CDF_DIR/execTimeCDF.csv

# Create function
wsk -i action update func function.zip --docker openwhisk/python3action

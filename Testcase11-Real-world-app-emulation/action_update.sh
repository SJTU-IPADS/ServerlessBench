# Usage: action_update.sh $SEQUENCE_ID $FUNCTION_ID

FUNCTION_DIR=./
CDF_DIR=./CDFs
gcc $FUNCTION_DIR/function.c --static -o $FUNCTION_DIR/function
zip -r function.zip \
$FUNCTION_DIR/__main__.py \
$FUNCTION_DIR/function \
$FUNCTION_DIR/utils.py \
$CDF_DIR/memCDF.csv \
$CDF_DIR/execTimeCDF.csv

SEQUENCE_ID=$1
FUNCTION_ID=$2
# Create function
wsk -i action update func$SEQUENCE_ID-$FUNCTION_ID function.zip --docker lqyuan980413/realworldemulate:0.1

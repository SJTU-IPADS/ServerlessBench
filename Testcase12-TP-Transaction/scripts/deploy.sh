if [ -z "$TESTCASE12_HOME" ]; then
    echo "$0: ERROR: TESTCASE12_HOME environment variable not set"
    exit
fi
source $TESTCASE12_HOME/local.env

couchdb_url=http://$COUCHDB_USERNAME:$COUCHDB_PASSWORD@$COUCHDB_IP:$COUCHDB_PORT


cd $TESTCASE12_HOME/src

echo "1. building functions..."
mvn clean && mvn package

echo "2. creating smallbank database..."
java -cp $TESTCASE12_HOME/src/create-schema/target/create-schema.jar \
    org.serverlessbench.CreateSchema \
    $SMALLBANK_NUMBER_ACCOUNT \
    $couchdb_url \
    $COUCHDB_USERNAME \
    $COUCHDB_PASSWORD \
    $SMALLBANK_DATABASE

echo "3. uplading functions to OpenWhisk..."
wsk action update Amalgamate amalgamate/target/amalgamate.jar --main org.serverlessbench.Amalgamate --docker openwhisk/java8action -i \
    --param COUCHDB_URL "$couchdb_url" \
    --param COUCHDB_USERNAME "$COUCHDB_USERNAME" \
    --param COUCHDB_PASSWORD "$COUCHDB_PASSWORD" \
    --param COUCHDB_DBNAME "$SMALLBANK_DATABASE"

wsk action update Balance balance/target/balance.jar --main org.serverlessbench.Balance --docker openwhisk/java8action -i \
    --param COUCHDB_URL "$couchdb_url" \
    --param COUCHDB_USERNAME "$COUCHDB_USERNAME" \
    --param COUCHDB_PASSWORD "$COUCHDB_PASSWORD" \
    --param COUCHDB_DBNAME "$SMALLBANK_DATABASE"

wsk action update DepositChecking deposit-checking/target/deposit-checking.jar --main org.serverlessbench.DepositChecking --docker openwhisk/java8action -i \
    --param COUCHDB_URL "$couchdb_url" \
    --param COUCHDB_USERNAME "$COUCHDB_USERNAME" \
    --param COUCHDB_PASSWORD "$COUCHDB_PASSWORD" \
    --param COUCHDB_DBNAME "$SMALLBANK_DATABASE"

wsk action update SendPayment send-payment/target/send-payment.jar --main org.serverlessbench.SendPayment --docker openwhisk/java8action -i \
    --param COUCHDB_URL "$couchdb_url" \
    --param COUCHDB_USERNAME "$COUCHDB_USERNAME" \
    --param COUCHDB_PASSWORD "$COUCHDB_PASSWORD" \
    --param COUCHDB_DBNAME "$SMALLBANK_DATABASE"

wsk action update TransactSavings transact-savings/target/transact-savings.jar --main org.serverlessbench.TransactSavings --docker openwhisk/java8action -i \
    --param COUCHDB_URL "$couchdb_url" \
    --param COUCHDB_USERNAME "$COUCHDB_USERNAME" \
    --param COUCHDB_PASSWORD "$COUCHDB_PASSWORD" \
    --param COUCHDB_DBNAME "$SMALLBANK_DATABASE"

wsk action update WriteCheck write-check/target/write-check.jar --main org.serverlessbench.WriteCheck --docker openwhisk/java8action -i \
    --param COUCHDB_URL "$couchdb_url" \
    --param COUCHDB_USERNAME "$COUCHDB_USERNAME" \
    --param COUCHDB_PASSWORD "$COUCHDB_PASSWORD" \
    --param COUCHDB_DBNAME "$SMALLBANK_DATABASE"
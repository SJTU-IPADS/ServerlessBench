if [ -z "$TESTCASE12_HOME" ]; then
    echo "$0: ERROR: TESTCASE12_HOME environment variable not set"
    exit
fi
source $TESTCASE4_HOME/local.env

gen_accoud_id() {
    acc_id0=$(($RANDOM % $SMALLBANK_NUMBER_ACCOUNT))
    acc_id1=$(($RANDOM % $SMALLBANK_NUMBER_ACCOUNT))
    while [ $acc_id0 -eq $acc_id1 ]; do
        acc_id1=$(($RANDOM % $SMALLBANK_NUMBER_ACCOUNT))
    done
}

invoke_amalgamate() {
    gen_accoud_id
    wsk action invoke Amalgamate --result --param AccountID0 $acc_id0 --param  AccountID1 $acc_id1
}

invoke_balance() {
    gen_accoud_id
    wsk action invoke Balance --result --param AccountID $acc_id0
}

invoke_deposit_checking() {
    gen_accoud_id
    wsk action invoke DepositChecking --result --param AccountID $acc_id0 --param Amount 1.3
}

invoke_send_payment() {
    gen_accoud_id
    wsk action invoke SendPayment --result --param AccountID0 $acc_id0 --param AccountID1 $acc_id1 --param Amount 5.0
}

invoke_transact_savings() {
    gen_accoud_id
    wsk action invoke TransactSavings --result --param AccountID $acc_id0 --param Amount 20.20
}

invoke_write_check() {
    gen_accoud_id
    wsk action invoke WriteCheck --result --param AccountID $acc_id0 --param Amount 5.0
}


while [[ $# -gt 0 ]]; do
    case $1 in
        --amalgamate)
            invoke_amalgamate
            ;;
        --balance)
            invoke_balance
            ;;
        --deposit-checking)
            invoke_deposit_checking
            ;;
        --send-payment)
            invoke_send_payment
            ;;
        --transact-savings)
            invoke_transact_savings
            ;;
        --write-check)
            invoke_write_check
            ;;
        --all)
            invoke_amalgamate
            invoke_balance
            invoke_deposit_checking
            invoke_send_payment
            invoke_transact_savings
            invoke_write_check
            ;;
        *)
            echo "Usage: $0 [--amalgamate] [--balance] [--deposit-checking] \
[--send-payment] [--transact-savings] [--write-check] [--all]"
            exit 1
            ;;
    esac
    shift
done
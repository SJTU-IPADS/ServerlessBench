# Transaction Application

The Transaction Application simulates bank transaction processing for checking and savings accounts. A transaction is a sequence of operations performed as a single logical unit of work, such as sending a payment. Before the serverless platform receives a transaction request, initial account data is stored in CouchDB.

The application supports six different transaction actions: `Amalgamate`, `Balance`, `DepositChecking`, `SendPayment`, `TrasactSavings` and `WriteCheck`.


# Quick Start

## Prerequisite

- Set up OpenWhisk with CouchDB support and ensure the `wsk` CLI tool is available in your PATH.
- Create the configuration file `local.env` from the template `template.local.env`. Update the configurations (e.g., IP, port, etc.) to match your OpenWhisk deployment settings.
- Install `openjdk-8` and `maven` (version 3.6.0 or higher) for compiling the application.

## Deployment

Set the environment variable:

```bash
export TESTCASE12_HOME=$YOUR_SERVERLESSBENCH_PATH/Testcase12-TP-Transaction
```

Next, compile the transaction actions and deploy them to OpenWhisk by running `deploy.sh`:

```bash
cd $TESTCASE12_HOME
bash ./scripts/deploy.sh
```

## Run the Test

To invoke a transaction, use the `action_invoke.sh` script with the transaction name. For example, to invoke `SendPayment`:

```bash
bash ./scripts/action_invoke.sh --send-payment
```

You can run `bash ./scripts/action_invoke.sh -h` to see how to invoke other transactions. 

You can also simply run `bash ./scripts/action_invoke.sh --all` to invoke all transactions.

**ACKNOWLEDGEMENT**:

The bank transaction processsing refers SmallBank benchmark, as detailed in [The Cost of Serializability on Platforms That Use Snapshot Isolation](https://ieeexplore.ieee.org/document/4497466). Additionally, the transaction application draws from the implementation found in [H-Store](https://github.com/apavlo/h-store/tree/master/src/benchmarks/edu/brown/benchmark/smallbank).
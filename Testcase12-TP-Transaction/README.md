# Transaction Application

The Transaction Application simulates bank transaction processing for checking and savings accounts. A transaction is a sequence of operations performed as a single logical unit of work, such as sending a payment. Before the serverless platform receives a transaction request, initial account data is stored in CouchDB.

The application supports six different transaction actions: `Amalgamate`, `Balance`, `DepositChecking`, `SendPayment`, `TrasactSavings` and `WriteCheck`.

ACKNOWLEDGEMENT:

The bank transaction processsing refers SmallBank benchmark, as detailed in [The Cost of Serializability on Platforms That Use Snapshot Isolation](https://ieeexplore.ieee.org/document/4497466). Additionally, the application draws from the implementation found in [H-Store](https://github.com/apavlo/h-store/tree/master/src/benchmarks/edu/brown/benchmark/smallbank).
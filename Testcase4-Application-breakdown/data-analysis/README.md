# Data Analysis Application

Data analysis application mimic a wage data analysis process.

The application is triggered by a wage data insertion action. When serverless platform receives the data insertion request, checks and modifications are applied to the wage data before insert the data entry into wage database in CouchDB. The data analysis sequence is triggered by the "changes" event from CouchDB. 

The "changes" event works with a Docker container listening to CouchDB changes event, and initiate a serverless function trigger to initiate the data analysis sequence. The application running in container and related utility functions are included in openwhisk-package-couchdb directory. They are setup by deploy.sh so no special actions needed to put them in place.

ACKNOWLEDGEMENT:

The architecture of data analysis application refers [ibm-cloud-functions-data-processing-cloudant project](https://github.com/IBM/ibm-cloud-functions-data-processing-cloudant), while the actions are re-written to perform wage data analysis.

The CouchDB chanages event providing borrows codes from [openwhisk-package-cloudant project](https://github.com/apache/openwhisk-package-cloudant), while changes are made to adapt to CouchDB (the original project applies to Cloudant).

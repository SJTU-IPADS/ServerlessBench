<!--
#
# Licensed to the Apache Software Foundation (ASF) under one or more
# contributor license agreements.  See the NOTICE file distributed with
# this work for additional information regarding copyright ownership.
# The ASF licenses this file to You under the Apache License, Version 2.0
# (the "License"); you may not use this file except in compliance with
# the License.  You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
-->

Ported from https://github.com/apache/openwhisk-package-cloudant

# Apache OpenWhisk package for Cloudant

[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](http://www.apache.org/licenses/LICENSE-2.0)
[![Build Status](https://travis-ci.org/apache/openwhisk-package-cloudant.svg?branch=master)](https://travis-ci.org/apache/openwhisk-package-cloudant)

The `/whisk.system/cloudant` package enables you to work with a Cloudant database. It includes the following actions and feeds.

| Entity | Type | Parameters | Description |
| --- | --- | --- | --- |
| `/whisk.system/cloudant` | package | dbname, host, username, password | Work with a Cloudant database |
| `/whisk.system/cloudant/read` | action | dbname, id | Read a document from a database |
| `/whisk.system/cloudant/write` | action | dbname, overwrite, doc | Write a document to a database |
| `/whisk.system/cloudant/changes` | feed | dbname, iamApiKey, iamUrl, filter, query_params, maxTriggers | Fire trigger events on changes to a database |

## Firing a trigger on database changes

Use the `changes` feed to configure a service to fire a trigger on every change to your Cloudant database. The parameters are as follows:

- `dbname` (*required*): The name of the Cloudant database.

- `iamApiKey` (*optional*): The IAM API key for the Cloudant database.  If specified will be used as the credentials instead of username and password.

- `iamUrl` (*optional*): The IAM token service url that is used when `iamApiKey` is specified.  Defaults to `https://iam.bluemix.net/identity/token`.

- `maxTriggers` (*optional*): Stop firing triggers when this limit is reached.  Defaults to infinite.

- `filter` (*optional*): Filter function that is defined on a design document.

- `query_params` (*optional*): Extra query parameters for the filter function.

The following topics walk through setting up a Cloudant database, configuring an associated package, and using the actions and feeds in the `/whisk.system/cloudant` package.

## Setting up a Cloudant database in Bluemix

If you're using OpenWhisk from Bluemix, OpenWhisk automatically creates package bindings for your Bluemix Cloudant service instances. If you're not using OpenWhisk and Cloudant from Bluemix, skip to the next step.

1. Create a Cloudant service instance in your Bluemix [dashboard](http://console.ng.Bluemix.net).

  Be sure to create a Credential key, after creating a new service instance.

2. Refresh the packages in your namespace. The refresh automatically creates a package binding for each Cloudant service instance that has a credential key defined.

  ```
  wsk package refresh
  ```
  ```
  created bindings:
  Bluemix_testCloudant_Credentials-1
  ```

  ```
  wsk package list
  ```
  ```
  packages
  /myBluemixOrg_myBluemixSpace/Bluemix_testCloudant_Credentials-1 private binding
  ```

  Your package binding now contains the credentials associated with your Cloudant service instance.

3. Check to see that the package binding that was created previously is configured with your Cloudant Bluemix service instance host and credentials.

  ```
  wsk package get /myBluemixOrg_myBluemixSpace/Bluemix_testCloudant_Credentials-1 parameters
  ```
  ```
  ok: got package /myBluemixOrg_myBluemixSpace/Bluemix_testCloudant_Credentials-1, displaying field parameters
  ```
  ```json
  [
      {
          "key": "username",
          "value": "cdb18832-2bbb-4df2-b7b1-Bluemix"
      },
      {
          "key": "host",
          "value": "cdb18832-2bbb-4df2-b7b1-Bluemix.cloudant.com"
      },
      {
          "key": "password",
          "value": "c9088667484a9ac827daf8884972737"
      }
  ]
  ```

## Setting up a Cloudant database outside Bluemix

If you're not using OpenWhisk in Bluemix or if you want to set up your Cloudant database outside of Bluemix, you must manually create a package binding for your Cloudant account. You need the Cloudant account host name, user name, and password.

1. Create a package binding that is configured for your Cloudant account.

  ```
  wsk package bind /whisk.system/cloudant myCloudant -p username MYUSERNAME -p password MYPASSWORD -p host MYCLOUDANTACCOUNT.cloudant.com
  ```

2. Verify that the package binding exists.

  ```
  wsk package list
  ```
  ```
  packages
  /myNamespace/myCloudant private binding
  ```


## Listening for changes to a Cloudant database

### Filter database change events

You can define a filter function, to avoid having unnecessary change events firing your trigger.

To create a new filter function you can use an action.

Create a json document file `design_doc.json` with the following filter function
```json
{
  "doc": {
    "_id": "_design/mailbox",
    "filters": {
      "by_status": "function(doc, req){if (doc.status != req.query.status){return false;} return true;}"
    }
  }
}
```

Create a new design document on the database with the filter function

```
wsk action invoke /_/myCloudant/write -p dbname testdb -p overwrite true -P design_doc.json -r
```
The information for the new design document is printed on the screen.
```json
{
    "id": "_design/mailbox",
    "ok": true,
    "rev": "1-5c361ed5141bc7856d4d7c24e4daddfd"
}
```

### Create the trigger using the filter function

You can use the `changes` feed to configure a service to fire a trigger on every change to your Cloudant database. The parameters are as follows:

- `dbname`: Name of Cloudant database.
- `maxTriggers`: Stop firing triggers when this limit is reached. Defaults to infinite.
- `filter`: Filter function defined on a design document.
- `query_params`: Optional query parameters for the filter function.


1. Create a trigger with the `changes` feed in the package binding that you created previously including `filter` and `query_params` to only fire the trigger when a document is added or modified when the status is `new`.
Be sure to replace `/_/myCloudant` with your package name.

  ```
  wsk trigger create myCloudantTrigger --feed /_/myCloudant/changes \
  --param dbname testdb \
  --param filter "mailbox/by_status" \
  --param query_params '{"status":"new"}'
  ```
  ```
  ok: created trigger feed myCloudantTrigger
  ```

2. Poll for activations.

  ```
  wsk activation poll
  ```

3. In your Cloudant dashboard, either modify an existing document or create a new one.

4. Observe new activations for the `myCloudantTrigger` trigger for each document change only if the document status is `new` based on the filter function and query parameter.

  **Note**: If you are unable to observe new activations, see the subsequent sections on reading from and writing to a Cloudant database. Testing the following reading and writing steps will help verify that your Cloudant credentials are correct.

  You can now create rules and associate them to actions to react to the document updates.

  The content of the generated events has the following parameters:

  - `id`: The document ID.
  - `seq`: The sequence identifier that is generated by Cloudant.
  - `changes`: An array of objects, each of which has a `rev` field that contains the revision ID of the document.

  The JSON representation of the trigger event is as follows:

  ```json
  {
      "id": "6ca436c44074c4c2aa6a40c9a188b348",
      "seq": "2-g1AAAAL9aJyV-GJCaEuqx4-BktQkYp_dmIfC",
      "changes": [
          {
              "rev": "2-da3f80848a480379486fb4a2ad98fa16"
          }
      ]
  }
  ```

## Writing to a Cloudant database

You can use an action to store a document in a Cloudant database called `testdb`. Make sure that this database exists in your Cloudant account.

1. Store a document by using the `write` action in the package binding you created previously. Be sure to replace `/_/myCloudant` with your package name.

  ```
  wsk action invoke /_/myCloudant/write --blocking --result --param dbname testdb --param doc "{\"_id\":\"heisenberg\",\"name\":\"Walter White\"}"
  ```
  ```
  ok: invoked /_/myCloudant/write with id 62bf696b38464fd1bcaff216a68b8287
  ```
  ```json
  {
    "id": "heisenberg",
    "ok": true,
    "rev": "1-9a94fb93abc88d8863781a248f63c8c3"
  }
  ```

2. Verify that the document exists by browsing for it in your Cloudant dashboard.

  The dashboard URL for the `testdb` database looks something like the following: `https://MYCLOUDANTACCOUNT.cloudant.com/dashboard.html#database/testdb/_all_docs?limit=100`.


## Reading from a Cloudant database

You can use an action to fetch a document from a Cloudant database called `testdb`. Make sure that this database exists in your Cloudant account.

- Fetch a document by using the `read` action in the package binding that you created previously. Be sure to replace `/_/myCloudant` with your package name.

  ```
  wsk action invoke /_/myCloudant/read --blocking --result --param dbname testdb --param id heisenberg
  ```
  ```json
  {
    "_id": "heisenberg",
    "_rev": "1-9a94fb93abc88d8863781a248f63c8c3",
    "name": "Walter White"
  }
  ```

## Using an action sequence and a change trigger to process a document from a Cloudant database

You can use an action sequence in a rule to fetch and process the document associated with a Cloudant change event.

Here is a sample code of an action that handles a document:
```javascript
function main(doc){
  return { "isWalter:" : doc.name === "Walter White"};
}
```

Create the action to process the document from Cloudant:
```
wsk action create myAction myAction.js
```

To read a document from the database, you can use the `read` action from the Cloudant package.
The `read` action may be composed with `myAction` to create an action sequence.
```
wsk action create sequenceAction --sequence /_/myCloudant/read,myAction
```

The action `sequenceAction` may be used in a rule that activates the action on new Cloudant trigger events.
```
wsk rule create myRule myCloudantTrigger sequenceAction
```

**Note** The Cloudant `changes` trigger used to support the parameter `includeDoc` which is not longer supported.
  You will need to recreate triggers previously created with `includeDoc`. Follow these steps to recreate the trigger:
  ```
  wsk trigger delete myCloudantTrigger
  ```
  ```
  wsk trigger create myCloudantTrigger --feed /_/myCloudant/changes --param dbname testdb
  ```

  The example illustrated above may be used to create an action sequence to read the changed document and call your existing actions.
  Remember to disable any rules that may no longer be valid and create new ones using the action sequence pattern.

# Building from Source

To build this package from source, execute the command `./gradlew distDocker`

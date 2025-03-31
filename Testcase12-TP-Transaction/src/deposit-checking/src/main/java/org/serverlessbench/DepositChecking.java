package org.serverlessbench;

import com.cloudant.client.api.ClientBuilder;
import com.cloudant.client.api.CloudantClient;
import com.cloudant.client.api.Database;
import com.google.gson.JsonObject;
import java.net.URL;

public class DepositChecking {
    public static JsonObject main(JsonObject args) {
        JsonObject response = args;
        
        int account_id = args.get("AccountID").getAsInt();
        float amount = args.get("Amount").getAsFloat();

        String couchdb_url = args.get("COUCHDB_URL").getAsString();
        String couchdb_username = args.get("COUCHDB_USERNAME").getAsString();
        String couchdb_password = args.get("COUCHDB_PASSWORD").getAsString();
        String couchdb_dbname = args.get("COUCHDB_DBNAME").getAsString();

        if (couchdb_url == null) {
            System.out.println("DepositChecking: missing COUCHDB_URL");
            return response;
        }
        if (couchdb_username == null) {
            System.out.println("DepositChecking: missing COUCHDB_USERNAME");
            return response;
        }
        if (couchdb_password == null) {
            System.out.println("DepositChecking: missing COUCHDB_PASSWORD");
            return response;
        }
        if (couchdb_dbname == null) {
            System.out.println("DepositChecking: missing COUCHDB_DBNAME");
            return response;
        }

        try {
            CloudantClient client = ClientBuilder.url(new URL(couchdb_url))
                .username(couchdb_username)
                .password(couchdb_password)
                .build();
            Database db = client.database(couchdb_dbname, true);

            if (!db.contains(TxnCommon.getAccountDOCID(account_id))) {
                System.err.println("Account " + account_id + " does not exist");
                return response;
            }

            JsonObject checking_doc = TxnCommon.findJsonObjectFromDb(db, TxnCommon.getCheckingDOCID(account_id));
            float checking_bal = checking_doc.get("bal").getAsFloat();
            checking_bal += amount;
            checking_doc.addProperty("bal", checking_bal);
            db.update(checking_doc);

            response.addProperty("CheckingBalance", checking_bal);
            return response;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return response;
    }
}

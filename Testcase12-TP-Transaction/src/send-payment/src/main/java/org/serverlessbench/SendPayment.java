package org.serverlessbench;

import com.cloudant.client.api.ClientBuilder;
import com.cloudant.client.api.CloudantClient;
import com.cloudant.client.api.Database;
import com.google.gson.JsonObject;
import java.net.URL;

public class SendPayment {
    public static JsonObject main(JsonObject args) {
        JsonObject response = args;
        
        int account_id_0 = args.get("AccountID0").getAsInt();
        int account_id_1 = args.get("AccountID1").getAsInt();
        
        float amount = args.get("Amount").getAsFloat();

        String couchdb_url = args.get("COUCHDB_URL").getAsString();
        String couchdb_username = args.get("COUCHDB_USERNAME").getAsString();
        String couchdb_password = args.get("COUCHDB_PASSWORD").getAsString();
        String couchdb_dbname = args.get("COUCHDB_DBNAME").getAsString();

        if (couchdb_url == null) {
            System.out.println("Amalgamate: missing COUCHDB_URL");
            return response;
        }
        if (couchdb_username == null) {
            System.out.println("Amalgamate: missing COUCHDB_USERNAME");
            return response;
        }
        if (couchdb_password == null) {
            System.out.println("Amalgamate: missing COUCHDB_PASSWORD");
            return response;
        }
        if (couchdb_dbname == null) {
            System.out.println("Amalgamate: missing COUCHDB_DBNAME");
            return response;
        }

        try {
            CloudantClient client = ClientBuilder.url(new URL(couchdb_url))
                    .username(couchdb_username)
                    .password(couchdb_password)
                    .build();
            Database db = client.database(couchdb_dbname, true);

            if (!db.contains(TxnCommon.getAccountDOCID(account_id_0))) {
                System.err.println("Account " + account_id_0 + " does not exist");
                return response;
            }
            if (!db.contains(TxnCommon.getAccountDOCID(account_id_1))) {
                System.err.println("Account " + account_id_1 + " does not exist");
                return response;
            }

            JsonObject checking_doc_0 = TxnCommon.findJsonObjectFromDb(db, TxnCommon.getCheckingDOCID(account_id_0));
            JsonObject checking_doc_1 = TxnCommon.findJsonObjectFromDb(db, TxnCommon.getCheckingDOCID(account_id_1));

            float checking_bal_0 = checking_doc_0.get("bal").getAsFloat();
            float checking_bal_1 = checking_doc_1.get("bal").getAsFloat();

            checking_bal_0 -= amount;
            checking_bal_1 += amount;

            checking_doc_0.addProperty("bal", checking_bal_0);
            checking_doc_1.addProperty("bal", checking_bal_1);

            db.update(checking_doc_0);
            db.update(checking_doc_1);

            response.addProperty("CheckingBalance_0", checking_bal_0);
            response.addProperty("CheckingBalance_1", checking_bal_1);

            return response;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return response;
    }
}

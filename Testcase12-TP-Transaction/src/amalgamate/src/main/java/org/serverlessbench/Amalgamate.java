package org.serverlessbench;

import com.cloudant.client.api.ClientBuilder;
import com.cloudant.client.api.CloudantClient;
import com.cloudant.client.api.Database;
import com.cloudant.client.api.model.DbInfo;
import com.cloudant.client.api.query.TextIndex;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import java.net.URL;

import org.serverlessbench.TxnCommon;

public class Amalgamate {
    public static JsonObject main(JsonObject args) {
        JsonObject response = args;

        int account_id_0 = args.get("AccountID0").getAsInt();
        int account_id_1 = args.get("AccountID1").getAsInt();

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

            JsonObject saving_doc_0 = TxnCommon.findJsonObjectFromDb(db, TxnCommon.getSavingDOCID(account_id_0));
            JsonObject checking_doc_0 = TxnCommon.findJsonObjectFromDb(db, TxnCommon.getCheckingDOCID(account_id_0));
            JsonObject saving_doc_1 = TxnCommon.findJsonObjectFromDb(db, TxnCommon.getSavingDOCID(account_id_1));
            JsonObject checking_doc_1 = TxnCommon.findJsonObjectFromDb(db, TxnCommon.getCheckingDOCID(account_id_1));

            float bal_0 = saving_doc_0.get("bal").getAsFloat();
            float bal_1 = checking_doc_1.get("bal").getAsFloat();
            float total = bal_0 + bal_1;

            checking_doc_0.addProperty("bal", 0);
            saving_doc_1.addProperty("bal", saving_doc_1.get("bal").getAsFloat() - total);

            db.update(checking_doc_0);
            db.update(saving_doc_1);

            response.addProperty("total_bal", total);

            return response;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return response;
    }
}

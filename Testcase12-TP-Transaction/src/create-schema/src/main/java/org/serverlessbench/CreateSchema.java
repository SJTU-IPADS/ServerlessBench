package org.serverlessbench;

import com.cloudant.client.api.ClientBuilder;
import com.cloudant.client.api.CloudantClient;
import com.cloudant.client.api.Database;
import com.cloudant.client.api.model.DbInfo;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;
import java.util.List;
import java.util.Random;

import org.serverlessbench.TxnCommon;

public class CreateSchema {
    // args[0] -- Number of accounts

    // args[1] -- COUCHDB_URL
    // args[2] -- COUCHDB_USERNMAE
    // args[3] -- COUCHDB_PASSWORD
    // args[4] -- COUCHDB_DBNAME

    public static void main(String[] args) {
        if (args.length < 5) {
            System.err.println("Usage: java -cp create-schema.jar org.serverlessbench.CreateSchema <num-accounts> <couchdb_url> <couchdb_usernmae> <couchdb_password> <couchdb_dbname>");
            return;
        }

        int num_account = Integer.parseInt(args[0]);
        
        String couchdb_url = args[1];
        String couchdb_username = args[2];
        String couchdb_password = args[3];
        String couchdb_dbname = args[4];

        String account = "account";
        String saving = "saving";
        String checking = "checking";

        Random rand = new Random();
        int max_bal = 50000;
        int min_bal = 10000;

        try {
            CloudantClient client = ClientBuilder.url(new URL(couchdb_url))
                    .username(couchdb_username)
                    .password(couchdb_password)
                    .build();

            Database db = client.database(couchdb_dbname, true);

            for (int i = 0; i < num_account; i++) {
                String account_docid = account + "_" + i;
                String saving_docid = saving + "_" + i;
                String checking_docid = checking + "_" + i;

                JsonObject account_doc = new JsonObject();
                account_doc.addProperty("_id", account_docid);
                account_doc.addProperty("custid", i);
                account_doc.addProperty("name", "name_" + i);
                if (db.contains(account_docid)) {
                    JsonObject doc = TxnCommon.findJsonObjectFromDb(db, account_docid);
                    account_doc.addProperty("_rev", doc.get("_rev").getAsString());
                    db.update(account_doc);
                } else {
                    db.save(account_doc);
                }

                JsonObject saving_doc = new JsonObject();
                saving_doc.addProperty("_id", saving_docid);
                saving_doc.addProperty("cust", account_docid);
                saving_doc.addProperty("bal", getRandIntBetween(rand, min_bal, max_bal));
                if (db.contains(saving_docid)) {
                    JsonObject doc = TxnCommon.findJsonObjectFromDb(db, saving_docid);
                    saving_doc.addProperty("_rev", doc.get("_rev").getAsString());
                    db.update(saving_doc);
                } else {
                    db.save(saving_doc);
                }

                JsonObject checking_doc = new JsonObject();
                checking_doc.addProperty("_id", checking_docid);
                checking_doc.addProperty("cust", account_docid);
                checking_doc.addProperty("bal", getRandIntBetween(rand, min_bal, max_bal));
                if (db.contains(checking_docid)) {
                    JsonObject doc = TxnCommon.findJsonObjectFromDb(db, checking_docid);
                    checking_doc.addProperty("_rev", doc.get("_rev").getAsString());
                    db.update(checking_doc);
                } else {
                    db.save(checking_doc);
                }
            }

            DbInfo db_info = db.info();
            System.out.println(db_info.toString());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static int getRandIntBetween(Random rand, int min, int max) {
        return rand.nextInt(max - min) + min;
    }

    // public static JsonObject findJsonObjectFromDb(Database db, String id) throws IOException {
    //     return new JsonParser().parse(new InputStreamReader(db.find(id))).getAsJsonObject();
    // }
}
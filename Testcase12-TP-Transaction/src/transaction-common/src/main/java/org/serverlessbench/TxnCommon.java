package org.serverlessbench;

import com.cloudant.client.api.ClientBuilder;
import com.cloudant.client.api.CloudantClient;
import com.cloudant.client.api.Database;
import com.cloudant.client.api.model.DbInfo;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import java.io.IOException;
import java.io.InputStreamReader;

public class TxnCommon {
    static public String getAccountDOCID(int account_id) {
        return "account_" + account_id;
    }

    static public String getSavingDOCID(int account_id) {
        return "saving_" + account_id;
    }

    static public String getCheckingDOCID(int account_id) {
        return "checking_" + account_id;
    }

    public static JsonObject findJsonObjectFromDb(Database db, String id) throws IOException {
        return new JsonParser().parse(new InputStreamReader(db.find(id))).getAsJsonObject();
    }
}

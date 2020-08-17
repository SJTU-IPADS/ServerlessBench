/*
 * Copyright (c) 2020 Institution of Parallel and Distributed System, Shanghai Jiao Tong University
 * ServerlessBench is licensed under the Mulan PSL v1.
 * You can use this software according to the terms and conditions of the Mulan PSL v1.
 * You may obtain a copy of Mulan PSL v1 at:
 *     http://license.coscl.org.cn/MulanPSL
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR
 * PURPOSE.
 * See the Mulan PSL v1 for more details.
 */

package org.serverlessbench;

import com.cloudant.client.api.ClientBuilder;
import com.cloudant.client.api.Database;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import java.net.URL;
import java.util.Date;
import java.text.SimpleDateFormat;

public class Handler {

    final static float MAX_WIDTH = 250;
    final static float MAX_HEIGHT= 250;

    public static JsonObject main(JsonObject args) {
        long currentTime = System.currentTimeMillis();
        Date date = new Date(currentTime);
        String entry_time = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSS").format(date.getTime());
        JsonArray startTimes = args.getAsJsonArray("startTimes");
        startTimes.add(entry_time);

        JsonObject response = args;

        String couchdb_url = args.get("COUCHDB_URL").getAsString();
        if(couchdb_url == null) {
            System.out.println("ExtractImageMetadata: missing COUCHDB_URL");
            return response;
        }
        String couchdb_username = args.get("COUCHDB_USERNAME").getAsString();
        if(couchdb_username == null) {
            System.out.println("ExtractImageMetadata: missing COUCHDB_USERNAME");
            return response;
        }
        String couchdb_password = args.get("COUCHDB_PASSWORD").getAsString();
        if(couchdb_password == null) {
            System.out.println("ExtractImageMetadata: missing COUCHDB_PASSWORD");
            return response;
        }
        String couchdb_log_dbname = args.get("COUCHDB_LOGDB").getAsString();
        if(couchdb_log_dbname == null) {
            System.out.println("ExtractImageMetadata: missing COUCHDB_LOGDB");
            return response;
        }


        response.add("startTimes", startTimes);

        JsonArray commTimes = args.getAsJsonArray("commTimes");
        commTimes.add(0);
        response.add("commTimes", commTimes);

        // Multiple logs are expected in retry cases
        try {
            String imageName = args.get(ImageProcessCommons.IMAGE_NAME).getAsString();
            Database db = ClientBuilder.url(new URL(couchdb_url))
                    .username(couchdb_username)
                    .password(couchdb_password)
                    .build().database(couchdb_log_dbname, true);

            JsonObject log = new JsonObject();
            String logid = Long.toString(System.nanoTime());
            log.addProperty("_id", logid);
            log.addProperty("img", imageName);
            db.save(log);

            response.addProperty("log", logid);

        } catch (Exception e) {
            e.printStackTrace();
        }

        return response;
    }

    public static void main (String args[]) {
        String jsonStr = "{\n" +
                "    \"extractedMetadata\": {\n" +
                "        \"creationTime\": \"2019:10:15 14:03:39\",\n" +
                "        \"dimensions\": {\n" +
                "            \"height\": 3968,\n" +
                "            \"width\": 2976\n" +
                "        },\n" +
                "        \"exifMake\": \"HUAWEI\",\n" +
                "        \"exifModel\": \"ALP-AL00\",\n" +
                "        \"fileSize\": \"2.372MB\",\n" +
                "        \"format\": \"image/jpeg\",\n" +
                "        \"geo\": {\n" +
                "            \"latitude\": {\n" +
                "                \"D\": 31,\n" +
                "                \"Direction\": \"N\",\n" +
                "                \"M\": 1,\n" +
                "                \"S\": 27\n" +
                "            },\n" +
                "            \"longitude\": {\n" +
                "                \"D\": 121,\n" +
                "                \"Direction\": \"E\",\n" +
                "                \"M\": 26,\n" +
                "                \"S\": 15\n" +
                "            }\n" +
                "        }\n" +
                "    },\n" +
                "    \"imageName\": \"test.jpg\"\n" +
                "}\n";
        JsonObject jsonArgs = new JsonParser().parse(jsonStr).getAsJsonObject();
        main(jsonArgs);
    }

}

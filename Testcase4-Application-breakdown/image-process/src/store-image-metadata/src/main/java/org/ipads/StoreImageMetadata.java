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

public class StoreImageMetadata {

    public static JsonObject main(JsonObject args) {
        long currentTime = System.currentTimeMillis();

        Date date = new Date(currentTime);
        String entry_time = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSS").format(date.getTime()); 
        JsonArray startTimes = args.getAsJsonArray("startTimes");
        startTimes.add(entry_time);

        JsonObject originalObj = new JsonObject();

        String couchdb_url = args.get("COUCHDB_URL").getAsString();
        if(couchdb_url == null) {
            System.out.println("ExtractImageMetadata: missing COUCHDB_URL");
            return originalObj;
        }
        String couchdb_username = args.get("COUCHDB_USERNAME").getAsString();
        if(couchdb_username == null) {
            System.out.println("ExtractImageMetadata: missing COUCHDB_USERNAME");
            return originalObj;
        }
        String couchdb_password = args.get("COUCHDB_PASSWORD").getAsString();
        if(couchdb_password == null) {
            System.out.println("ExtractImageMetadata: missing COUCHDB_PASSWORD");
            return originalObj;
        }
        String couchdb_dbname = args.get("COUCHDB_DBNAME").getAsString();
        if(couchdb_dbname == null) {
            System.out.println("ExtractImageMetadata: missing COUCHDB_DBNAME");
            return originalObj;
        }

        JsonObject extractedMetadata = args.getAsJsonObject(ImageProcessCommons.EXTRACTED_METADATA);
        try {
            long db_begin = System.currentTimeMillis();
            Database db = ClientBuilder.url(new URL(couchdb_url))
                    .username(couchdb_username)
                    .password(couchdb_password)
                    .build().database(couchdb_dbname, true);

            //originalObj = ImageProcessCommons.findJsonObjectFromDb(db, args.get(ImageProcessCommons.IMAGE_NAME).getAsString());
            originalObj = ImageProcessCommons.findJsonObjectFromDb(db, "doc-test");
            long db_finish = System.currentTimeMillis();
            long db_elapse_ms = db_finish - db_begin;

            originalObj.add("startTimes", startTimes);
            JsonArray commTimes = args.getAsJsonArray("commTimes");
            commTimes.add(db_elapse_ms);
            originalObj.add("commTimes", commTimes);
            
            originalObj.addProperty("uploadTime", System.currentTimeMillis());
            originalObj.add("imageFormat", extractedMetadata.get("format"));
            originalObj.add("dimensions", extractedMetadata.get("dimensions"));
            originalObj.add("fileSize", extractedMetadata.get("fileSize"));
            originalObj.addProperty("userID", couchdb_username);
            originalObj.addProperty("albumID", couchdb_dbname);

            System.out.println(extractedMetadata);

            if (extractedMetadata.has("geo")) {
                originalObj.add("latitude", extractedMetadata.getAsJsonObject("geo").get("latitude"));
                originalObj.add("longtitude", extractedMetadata.getAsJsonObject("geo").get("longitude"));
            }

            if (extractedMetadata.has("exifMake")) {
                originalObj.add("exifMake", extractedMetadata.get("exifMake"));
            }

            if (extractedMetadata.has("exifModel")) {
                originalObj.add("exifModel", extractedMetadata.get("exifModel"));
            }

            if (args.has(ImageProcessCommons.THUMBNAIL)) {
                originalObj.add("thumbnail", args.get(ImageProcessCommons.THUMBNAIL));
            }
            //db.update(originalObj);

        } catch (Exception e) {
            e.printStackTrace();
        }
        System.out.println(originalObj);
        return originalObj;

    }

    public static void main(String args[]) {
        JsonObject jsonArgs = new JsonParser().parse("{\n" +
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
                "    \"imageName\": \"test.jpg\",\n" +
                "    \"thumbnail\": \"thumbnail-test.jpg\"\n" +
                "}\n").getAsJsonObject();
        main(jsonArgs);
    }

}

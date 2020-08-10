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
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonArray;
import org.apache.commons.io.IOUtils;
import org.im4java.core.Info;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.URL;
import java.nio.channels.Channels;
import java.nio.channels.ReadableByteChannel;
import java.util.List;
import java.util.Date;
import java.text.SimpleDateFormat;

public class ExtractImageMetadata {
    public static JsonObject main(JsonObject args) {
        long currentTime = System.currentTimeMillis();

        System.out.println(" ExtractImageMetadata invoked");

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
        String couchdb_dbname = args.get("COUCHDB_DBNAME").getAsString();
        if(couchdb_dbname == null) {
            System.out.println("ExtractImageMetadata: missing COUCHDB_DBNAME");
            return response;
        }

        Date date = new Date(currentTime);
        String entry_time = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSS").format(date.getTime());
        JsonArray startTimes = new JsonArray();
        startTimes.add(entry_time);

        response.add("startTimes", startTimes);

        String imageName = args.get(ImageProcessCommons.IMAGE_NAME).getAsString();
        try {
            long db_begin = System.currentTimeMillis();
            Database db = ClientBuilder.url(new URL(couchdb_url))
                    .username(couchdb_username)
                    .password(couchdb_password)
                    .build().database(couchdb_dbname, true);
            InputStream imageStream = db.getAttachment(ImageProcessCommons.IMAGE_DOCID, imageName);
            long db_finish = System.currentTimeMillis();
            long db_elapse_ms = db_finish - db_begin;

            JsonArray commTimes = new JsonArray();
            commTimes.add(db_elapse_ms);
            response.add("commTimes", commTimes);

            FileOutputStream outputStream = new FileOutputStream(imageName);
            IOUtils.copy(imageStream, outputStream);
            Info imageInfo = new Info(imageName, false);
            response.addProperty(ImageProcessCommons.IMAGE_NAME, imageName);
            response.add(ImageProcessCommons.EXTRACTED_METADATA, new  Gson().toJsonTree(imageInfo).getAsJsonObject().getAsJsonObject("iAttributes"));
        } catch (Exception e) {
            e.printStackTrace();
        }
        return response;
    }

}

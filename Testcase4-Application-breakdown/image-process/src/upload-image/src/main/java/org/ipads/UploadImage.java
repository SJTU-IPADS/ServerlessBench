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
import com.cloudant.client.api.CloudantClient;
import com.cloudant.client.api.Database;
import com.google.gson.JsonObject;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.URL;
import java.util.List;

public class UploadImage {
    // args[0] -- path to image-to-upload
    // args[1] -- image name (as put in couchdb)

    // args[2] -- COUCHDB_URL
    // args[3] -- COUCHDB_USERNMAE
    // args[4] -- COUCHDB_PASSWORD
    // args[5] -- COUCHDB_DBNAME
    public static void main(String args[]) {
        if (args.length < 6) {
            System.err.println("Usage: java -cp upload-image.jar org.serverlessbench.UploadImage <image-file> <image-name> <couchdb_url> <couchdb_usernmae> <couchdb_password> <couchdb_dbname>");
            return;
        }
        try {
            CloudantClient client = ClientBuilder.url(new URL(args[2]))
                    .username(args[3])
                    .password(args[4])
                    .build();
            Database db = client.database(args[5], true);

            FileInputStream ift = new FileInputStream(args[0]);

            if (db.contains(ImageProcessCommons.IMAGE_DOCID)) {
                JsonObject doc = ImageProcessCommons.findJsonObjectFromDb(db, ImageProcessCommons.IMAGE_DOCID);
                db.saveAttachment(ift, args[1], "image/jpg", ImageProcessCommons.IMAGE_DOCID, doc.get("_rev").getAsString());
            } else {
                db.saveAttachment(ift, args[1], "image/jpg", ImageProcessCommons.IMAGE_DOCID, null);
            }

            System.out.println(client.serverVersion());

            List<String> databases = client.getAllDbs();
            System.out.println("All my databases : ");
            for ( String dbName : databases ) {
                System.out.println(dbName);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

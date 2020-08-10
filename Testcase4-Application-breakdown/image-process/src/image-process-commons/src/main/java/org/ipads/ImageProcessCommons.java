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

import com.cloudant.client.api.Database;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

public class ImageProcessCommons {
    public static final String IMAGE_NAME = "imageName";
    public static final String IMAGE_DOCID = "doc-test";
    public static final String EXTRACTED_METADATA = "extractedMetadata";
    public static final String THUMBNAIL = "thumbnail";

    public static final String EXECUTION_TIME = "executionTime";

    public static JsonObject findJsonObjectFromDb(Database db, String id) throws IOException {
        return new JsonParser().parse(new InputStreamReader(db.find(id))).getAsJsonObject();
    }
}

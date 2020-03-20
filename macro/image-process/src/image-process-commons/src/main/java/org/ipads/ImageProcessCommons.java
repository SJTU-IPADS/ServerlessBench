package org.ipads;

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

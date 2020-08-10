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

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import java.util.Date;
import java.text.SimpleDateFormat;
import java.text.Format;

public class TransformMetadata {
    public static JsonObject main(JsonObject args) {
        long currentTime = System.currentTimeMillis();

        System.out.println("TransformMetadata invoked");
        System.out.println(args.toString());

        Date date = new Date(currentTime);
        String entry_time = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSS").format(date.getTime());
        JsonArray startTimes = args.getAsJsonArray("startTimes");
        startTimes.add(entry_time);

        JsonObject response = new JsonObject();
        JsonObject ret = new JsonObject();
        
        ret.add(ImageProcessCommons.IMAGE_NAME, args.get(ImageProcessCommons.IMAGE_NAME));
        ret.add("startTimes", startTimes);

        JsonArray commTimes = args.getAsJsonArray("commTimes");
        commTimes.add(0);
        ret.add("commTimes", commTimes);

        args = args.getAsJsonObject(ImageProcessCommons.EXTRACTED_METADATA);

        if (args.has("Properties:exif:DateTimeOriginal")) {
            response.add("creationTime", args.get("Properties:exif:DateTimeOriginal"));
        }
        if (args.has("Properties:exif:GPSLatitude") && args.has("Properties:exif:GPSLatitudeRef")
                && args.has("Properties:exif:GPSLongitude") && args.has("Properties:exif:GPSLongitudeRef")) {
            JsonElement latitude = parseCoordinate(args.get("Properties:exif:GPSLatitude"), args.get("Properties:exif:GPSLatitudeRef"));
            JsonElement longitude = parseCoordinate(args.get("Properties:exif:GPSLongitude"), args.get("Properties:exif:GPSLongitudeRef"));
            JsonObject geo = new JsonObject();
            geo.add("latitude", latitude);
            geo.add("longitude", longitude);
            response.add("geo", geo);
        }

        if (args.has("Properties:exif:Make")) {
            response.add("exifMake", args.get("Properties:exif:Make"));
        }
        if (args.has("Properties:exif:Model")) {
            response.add("exifModel", args.get("Properties:exif:Model"));
        }

        JsonObject dimensions = new JsonObject();
        dimensions.addProperty("width", Integer.valueOf(args.get("Width").getAsString()));
        dimensions.addProperty("height", Integer.valueOf(args.get("Height").getAsString()));
        response.add("dimensions", dimensions);

        response.add("fileSize", args.get("Filesize"));
        response.add("format", args.get("Mime type"));

        ret.add(ImageProcessCommons.EXTRACTED_METADATA, response);
        return ret;
    }

    static JsonElement parseCoordinate(JsonElement coordinate, JsonElement coordinateDircetion)  {
        String[] degreeArray = coordinate.getAsString().split(",")[0].trim().split("/");
        String[] minuteArray = coordinate.getAsString().split(",")[1].trim().split("/");
        String[] secondArray = coordinate.getAsString().split(",")[2].trim().split("/");

        JsonObject ret = new JsonObject();
        ret.addProperty("D", (Integer.valueOf(degreeArray[0])) / (Integer.valueOf(degreeArray[1])));
        ret.addProperty("M", (Integer.valueOf(minuteArray[0])) / (Integer.valueOf(minuteArray[1])));
        ret.addProperty("S", (Integer.valueOf(secondArray[0])) / (Integer.valueOf(secondArray[1])));
        ret.add("Direction", coordinateDircetion);
        return ret;
    }

    public static void main(String args[])  {
        JsonObject request = new JsonParser().parse("{\n" +
                "    \"extractedMetadata\": {\n" +
                "        \"Artifacts:filename\": \"test.jpg\",\n" +
                "        \"Artifacts:verbose\": \"true\",\n" +
                "        \"Background color\": \"white\",\n" +
                "        \"Border color\": \"srgb(223,223,223)\",\n" +
                "        \"Channel depth:blue\": \"8-bit\",\n" +
                "        \"Channel depth:green\": \"8-bit\",\n" +
                "        \"Channel depth:red\": \"8-bit\",\n" +
                "        \"Channel statistics:Blue:kurtosis\": \"-0.750447\",\n" +
                "        \"Channel statistics:Blue:max\": \"255 (1)\",\n" +
                "        \"Channel statistics:Blue:mean\": \"140.878 (0.552461)\",\n" +
                "        \"Channel statistics:Blue:min\": \"9 (0.0352941)\",\n" +
                "        \"Channel statistics:Blue:skewness\": \"-0.608178\",\n" +
                "        \"Channel statistics:Blue:standard deviation\": \"57.4551 (0.225314)\",\n" +
                "        \"Channel statistics:Green:kurtosis\": \"-0.728303\",\n" +
                "        \"Channel statistics:Green:max\": \"255 (1)\",\n" +
                "        \"Channel statistics:Green:mean\": \"147.179 (0.577171)\",\n" +
                "        \"Channel statistics:Green:min\": \"5 (0.0196078)\",\n" +
                "        \"Channel statistics:Green:skewness\": \"-0.881981\",\n" +
                "        \"Channel statistics:Green:standard deviation\": \"59.6802 (0.23404)\",\n" +
                "        \"Channel statistics:Pixels\": \"11808768\",\n" +
                "        \"Channel statistics:Red:kurtosis\": \"-0.516417\",\n" +
                "        \"Channel statistics:Red:max\": \"255 (1)\",\n" +
                "        \"Channel statistics:Red:mean\": \"153.816 (0.6032)\",\n" +
                "        \"Channel statistics:Red:min\": \"0 (0)\",\n" +
                "        \"Channel statistics:Red:skewness\": \"-0.997933\",\n" +
                "        \"Channel statistics:Red:standard deviation\": \"61.6476 (0.241755)\",\n" +
                "        \"Chromaticity:blue primary\": \"(0.15,0.06)\",\n" +
                "        \"Chromaticity:green primary\": \"(0.3,0.6)\",\n" +
                "        \"Chromaticity:red primary\": \"(0.64,0.33)\",\n" +
                "        \"Chromaticity:white point\": \"(0.3127,0.329)\",\n" +
                "        \"Class\": \"DirectClass\",\n" +
                "        \"Colorspace\": \"sRGB\",\n" +
                "        \"Compose\": \"Over\",\n" +
                "        \"Compression\": \"JPEG\",\n" +
                "        \"Depth\": \"8-bit\",\n" +
                "        \"Dispose\": \"Undefined\",\n" +
                "        \"Elapsed time\": \"0:01.119\",\n" +
                "        \"Endianess\": \"Undefined\",\n" +
                "        \"Filesize\": \"2.372MB\",\n" +
                "        \"Format\": \"JPEG (Joint Photographic Experts Group JFIF format)\",\n" +
                "        \"Gamma\": \"0.454545\",\n" +
                "        \"Geometry\": \"2976x3968+0+0\",\n" +
                "        \"Height\": \"3968\",\n" +
                "        \"Image\": \"test.jpg\",\n" +
                "        \"Image statistics:Overall:kurtosis\": \"-0.679959\",\n" +
                "        \"Image statistics:Overall:max\": \"255 (1)\",\n" +
                "        \"Image statistics:Overall:mean\": \"147.291 (0.577611)\",\n" +
                "        \"Image statistics:Overall:min\": \"0 (0)\",\n" +
                "        \"Image statistics:Overall:skewness\": \"-0.828856\",\n" +
                "        \"Image statistics:Overall:standard deviation\": \"59.6189 (0.2338)\",\n" +
                "        \"Intensity\": \"Undefined\",\n" +
                "        \"Interlace\": \"None\",\n" +
                "        \"Iterations\": \"0\",\n" +
                "        \"Matte color\": \"grey74\",\n" +
                "        \"Mime type\": \"image/jpeg\",\n" +
                "        \"Number pixels\": \"11.81M\",\n" +
                "        \"Orientation\": \"Undefined\",\n" +
                "        \"Page geometry\": \"2976x3968+0+0\",\n" +
                "        \"PageGeometry\": \"2976x3968+0+0\",\n" +
                "        \"PageHeight\": \"3968\",\n" +
                "        \"PageWidth\": \"2976\",\n" +
                "        \"Pixels per second\": \"98.41MB\",\n" +
                "        \"Print size\": \"41.3333x55.1111\",\n" +
                "        \"Profiles:Profile-exif\": \"24452 bytes\",\n" +
                "        \"Properties:date:create\": \"2019-10-24T01:29:42+00:00\",\n" +
                "        \"Properties:date:modify\": \"2019-10-24T01:29:42+00:00\",\n" +
                "        \"Properties:exif:ApertureValue\": \"135/100\",\n" +
                "        \"Properties:exif:BitsPerSample\": \"8, 8, 8\",\n" +
                "        \"Properties:exif:BrightnessValue\": \"0/1\",\n" +
                "        \"Properties:exif:ColorSpace\": \"1\",\n" +
                "        \"Properties:exif:ComponentsConfiguration\": \"1, 2, 3, 0\",\n" +
                "        \"Properties:exif:CompressedBitsPerPixel\": \"95/100\",\n" +
                "        \"Properties:exif:Contrast\": \"0\",\n" +
                "        \"Properties:exif:CustomRendered\": \"1\",\n" +
                "        \"Properties:exif:DateTime\": \"2019:10:15 14:03:39\",\n" +
                "        \"Properties:exif:DateTimeDigitized\": \"2019:10:15 14:03:39\",\n" +
                "        \"Properties:exif:DateTimeOriginal\": \"2019:10:15 14:03:39\",\n" +
                "        \"Properties:exif:DeviceSettingDescription\": \"105, 112, 112, 0\",\n" +
                "        \"Properties:exif:DigitalZoomRatio\": \"100/100\",\n" +
                "        \"Properties:exif:ExifImageLength\": \"3968\",\n" +
                "        \"Properties:exif:ExifImageWidth\": \"2976\",\n" +
                "        \"Properties:exif:ExifOffset\": \"286\",\n" +
                "        \"Properties:exif:ExifVersion\": \"48, 50, 49, 48\",\n" +
                "        \"Properties:exif:ExposureBiasValue\": \"0/10\",\n" +
                "        \"Properties:exif:ExposureMode\": \"0\",\n" +
                "        \"Properties:exif:ExposureProgram\": \"2\",\n" +
                "        \"Properties:exif:ExposureTime\": \"20000000/1000000000\",\n" +
                "        \"Properties:exif:FNumber\": \"160/100\",\n" +
                "        \"Properties:exif:FileSource\": \"3\",\n" +
                "        \"Properties:exif:Flash\": \"24\",\n" +
                "        \"Properties:exif:FlashPixVersion\": \"48, 49, 48, 48\",\n" +
                "        \"Properties:exif:FocalLength\": \"3950/1000\",\n" +
                "        \"Properties:exif:FocalLengthIn35mmFilm\": \"27\",\n" +
                "        \"Properties:exif:GPSAltitude\": \"0/100\",\n" +
                "        \"Properties:exif:GPSAltitudeRef\": \"1\",\n" +
                "        \"Properties:exif:GPSDateStamp\": \"2019:10:15\",\n" +
                "        \"Properties:exif:GPSInfo\": \"8492\",\n" +
                "        \"Properties:exif:GPSLatitude\": \"31/1, 1/1, 27828826/1000000\",\n" +
                "        \"Properties:exif:GPSLatitudeRef\": \"N\",\n" +
                "        \"Properties:exif:GPSLongitude\": \"121/1, 26/1, 15823974/1000000\",\n" +
                "        \"Properties:exif:GPSLongitudeRef\": \"E\",\n" +
                "        \"Properties:exif:GPSProcessingMethod\": \"CELLID\",\n" +
                "        \"Properties:exif:GPSTimeStamp\": \"6/1, 3/1, 38/1\",\n" +
                "        \"Properties:exif:GPSVersionID\": \"2, 2, 0, 0\",\n" +
                "        \"Properties:exif:GainControl\": \"0\",\n" +
                "        \"Properties:exif:ISOSpeedRatings\": \"160\",\n" +
                "        \"Properties:exif:ImageLength\": \"3968\",\n" +
                "        \"Properties:exif:ImageWidth\": \"2976\",\n" +
                "        \"Properties:exif:InteroperabilityOffset\": \"8462\",\n" +
                "        \"Properties:exif:LightSource\": \"1\",\n" +
                "        \"Properties:exif:Make\": \"HUAWEI\",\n" +
                "        \"Properties:exif:MakerNote\": \"35, 35, 35, 35, 10, 0, 0, 0, 174, 200, 51, 1, 0, 34, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 151, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255\",\n" +
                "        \"Properties:exif:MaxApertureValue\": \"135/100\",\n" +
                "        \"Properties:exif:MeteringMode\": \"5\",\n" +
                "        \"Properties:exif:Model\": \"ALP-AL00\",\n" +
                "        \"Properties:exif:Orientation\": \"0\",\n" +
                "        \"Properties:exif:ResolutionUnit\": \"2\",\n" +
                "        \"Properties:exif:Saturation\": \"0\",\n" +
                "        \"Properties:exif:SceneCaptureType\": \"0\",\n" +
                "        \"Properties:exif:SceneType\": \"1\",\n" +
                "        \"Properties:exif:SensingMethod\": \"2\",\n" +
                "        \"Properties:exif:Sharpness\": \"0\",\n" +
                "        \"Properties:exif:ShutterSpeedValue\": \"298973/10000\",\n" +
                "        \"Properties:exif:Software\": \"ALP-AL00 9.1.0.321(C00E320R1P1)\",\n" +
                "        \"Properties:exif:SubSecTime\": \"580091\",\n" +
                "        \"Properties:exif:SubSecTimeDigitized\": \"580091\",\n" +
                "        \"Properties:exif:SubSecTimeOriginal\": \"580091\",\n" +
                "        \"Properties:exif:SubjectDistanceRange\": \"0\",\n" +
                "        \"Properties:exif:WhiteBalance\": \"0\",\n" +
                "        \"Properties:exif:XResolution\": \"72/1\",\n" +
                "        \"Properties:exif:YCbCrPositioning\": \"1\",\n" +
                "        \"Properties:exif:YResolution\": \"72/1\",\n" +
                "        \"Properties:exif:thumbnail:Compression\": \"6\",\n" +
                "        \"Properties:exif:thumbnail:ImageLength\": \"512\",\n" +
                "        \"Properties:exif:thumbnail:ImageWidth\": \"384\",\n" +
                "        \"Properties:exif:thumbnail:InteroperabilityIndex\": \"R98\",\n" +
                "        \"Properties:exif:thumbnail:InteroperabilityVersion\": \"48, 49, 48, 48\",\n" +
                "        \"Properties:exif:thumbnail:JPEGInterchangeFormat\": \"8848\",\n" +
                "        \"Properties:exif:thumbnail:JPEGInterchangeFormatLength\": \"15598\",\n" +
                "        \"Properties:exif:thumbnail:Orientation\": \"0\",\n" +
                "        \"Properties:exif:thumbnail:ResolutionUnit\": \"2\",\n" +
                "        \"Properties:exif:thumbnail:XResolution\": \"72/1\",\n" +
                "        \"Properties:exif:thumbnail:YResolution\": \"72/1\",\n" +
                "        \"Properties:jpeg:colorspace\": \"2\",\n" +
                "        \"Properties:jpeg:sampling-factor\": \"2x2,1x1,1x1\",\n" +
                "        \"Properties:signature\": \"be3e80079e1e95990355ed6c60b46b8fb56c9048d0a24e66f121cd5ef46b7b28\",\n" +
                "        \"Quality\": \"97\",\n" +
                "        \"Rendering intent\": \"Perceptual\",\n" +
                "        \"Resolution\": \"72x72\",\n" +
                "        \"Tainted\": \"False\",\n" +
                "        \"Transparent color\": \"black\",\n" +
                "        \"Type\": \"TrueColor\",\n" +
                "        \"Units\": \"PixelsPerInch\",\n" +
                "        \"User time\": \"0.120u\",\n" +
                "        \"Version\": \"ImageMagick 6.8.9-9 Q16 x86_64 2019-06-15 http://www.imagemagick.org\",\n" +
                "        \"Width\": \"2976\"\n" +
                "    },\n" +
                "    \"imageName\": \"test.jpg\"\n" +
                "}").getAsJsonObject();
        JsonObject result = main(request);
        System.out.println(result.toString());
    }

}

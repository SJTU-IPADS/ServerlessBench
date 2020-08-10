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

import com.google.gson.JsonObject;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.Calendar;
import javax.imageio.ImageIO;
import javax.xml.bind.DatatypeConverter;

public class JavaResize {
    public static JsonObject main(JsonObject args) {
		long milistartTime = Calendar.getInstance().getTimeInMillis();
		long startTime = System.nanoTime();
    	JavaResize jR= new JavaResize();
    	String img = "";
    	int newW=0;
    	int newH=0;
    	if (args.has("img"))
            img = args.getAsJsonPrimitive("img").getAsString();    //img parameter, which receives the image in BASE64 format
    	if (args.has("w"))
    		newW = args.getAsJsonPrimitive("w").getAsInt();    // w parameter, new Width Image size 
    	if (args.has("h"))
    		newH = args.getAsJsonPrimitive("h").getAsInt();    // h parameter, new High Image size 
    	JsonObject response = new JsonObject();
    	try {
		String base64String = img;

		byte[] base64Val = jR.convertToImg(base64String);
		BufferedImage image = ImageIO.read(new ByteArrayInputStream(base64Val));
		
		String imageResize = jR.resize(image, newW,  newH);
        
        response.addProperty("image", imageResize);
    	}catch(Exception e){
			e.printStackTrace();
    		response.addProperty("image", "error");
		}
		response.addProperty("executeTime", System.nanoTime() - startTime);
		response.addProperty("startTime", milistartTime);
        return response;         // return new BASE64 Image 
    }
    
	public byte[] convertToImg(String base64) throws IOException {
		byte[] decodedString = Base64.getDecoder().decode(base64);
		return decodedString;
	}


	
	public String resize(BufferedImage img, int newW, int newH) throws IOException {
		int w = img.getWidth();  
	    int h = img.getHeight();  
	    BufferedImage dimg = new BufferedImage(newW, newH, img.getType());  
	    Graphics2D g = dimg.createGraphics();  
	    g.setRenderingHint(RenderingHints.KEY_INTERPOLATION,
	    RenderingHints.VALUE_INTERPOLATION_BILINEAR);  
	    g.drawImage(img, 0, 0, newW, newH, 0, 0, w, h, null);  
	    g.dispose(); 
		byte[] byteArray = toByteArrayAutoClosable(dimg, "PNG");
		String imageString = Base64.getEncoder().encodeToString(byteArray);
	    return imageString;  
	    
	}

	private byte[] toByteArrayAutoClosable(BufferedImage image, String type) throws IOException {
		try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
			ImageIO.write(image, type, out);
			return out.toByteArray();
		}
	}
}
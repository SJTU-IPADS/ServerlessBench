
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
    	    byte[] base64Val = Base64.getDecoder().decode(base64String);
	    BufferedImage image = ImageIO.read(new ByteArrayInputStream(base64Val));
		
	    // String imageResize = jR.resize(image, newW,  newH);
            int w = image.getWidth();
	    int h = image.getHeight();
	    BufferedImage newimg = new BufferedImage(newW, newH, image.getType());
	    Graphics2D g = newimg.createGraphics();
    	    g.setRenderingHint(RenderingHints.KEY_INTERPOLATION,
	    		RenderingHints.VALUE_INTERPOLATION_BILINEAR);
	    g.drawImage(image, 0, 0, newW, newH, 0, 0, w, h, null);
	    g.dispose();
	    String imageResize;
	    try(ByteArrayOutputStream out = new ByteArrayOutputStream()){
	        ImageIO.write(newimg,"PNG",out);
		imageResize = Base64.getEncoder().encodeToString(out.toByteArray());
	    }
            response.addProperty("image", imageResize);
    	}catch(Exception e){
	    e.printStackTrace();
    	    response.addProperty("image", "error");
	}
	response.addProperty("executeTime", System.nanoTime() - startTime);
	response.addProperty("startTime", milistartTime);
        return response;         // return new BASE64 Image 
    }
    
}

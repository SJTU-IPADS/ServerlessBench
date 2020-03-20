
import com.google.gson.JsonObject;
import java.util.Calendar;

public class Hello {
    public static JsonObject main(JsonObject args) {
        long startTime = Calendar.getInstance().getTimeInMillis();
        String name = "stranger";
        if (args.has("name"))
            name = args.getAsJsonPrimitive("name").getAsString();
        JsonObject response = new JsonObject();
        response.addProperty("greeting", "Hello " + name + "!");
        response.addProperty("startTime",startTime);
        return response;
    }
}

package com.example.fn;
import java.util.Calendar;

public class HelloFunction {

    public String handleRequest(String input) {
        long startTime = Calendar.getInstance().getTimeInMillis();

        String name = (input == null || input.isEmpty()) ? "world"  : input;
        String res = "{\"startTime\": " + startTime + "}";
        return res;
    }

}
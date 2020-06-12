package com.example.fn;
import java.io.Serializable;
public class Payload implements Serializable{
	private long retTime;
	private String payload;
	public long getretTime(){
		return this.retTime;
	}
	public String getpayload(){
		return this.payload;
	}
	public void setretTime(long retTime){
		this.retTime = retTime;
	}
	public void setpayload(String payload){
		this.payload = payload;
	}
	public Payload(String payload, long retTime){
		this.payload = payload;
		this.retTime = retTime;
	}
}

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

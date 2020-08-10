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
import com.fnproject.fn.api.flow.Flow;
import com.fnproject.fn.api.flow.Flows;
import com.fnproject.fn.runtime.flow.FlowFeature;
import com.fnproject.fn.api.FnFeature;
import com.fnproject.fn.api.flow.FlowFuture;

import static com.fnproject.fn.api.Headers.emptyHeaders;
import static com.fnproject.fn.api.flow.HttpMethod.POST;
import com.fnproject.fn.api.flow.HttpResponse;


import java.io.Serializable;
import java.lang.management.ManagementFactory;

@FnFeature(FlowFeature.class)
public class HelloFunction implements Serializable {

  public String handleRequest(int x) {
    Flow fl = Flows.currentFlow();
	System.err.println("the main pid is: " + ManagementFactory.getRuntimeMXBean().getName().split("@")[0]);
	
    String flow1 = fl.completedValue(x)
      .thenApply( i -> {
	String str = "a";
	System.err.println("the pid is: " + ManagementFactory.getRuntimeMXBean().getName().split("@")[0]);
	//long constructBegin = System.nanoTime();
	for (int j = 0; j < i / 100 ; j++){
		str += "0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789";
	}
	//long constructEnd = System.nanoTime();

	return new Payload(str,System.nanoTime());
      })
      .thenApply( payload -> {
    	long StartTime = System.nanoTime();
	long communicateTime = StartTime - payload.getretTime();
	long pid = ProcessHandle.current().pid();
	System.err.println("The second pid is: " + String.valueOf(pid));
	//long constructTime = payload.getretTime();
	
	//String result = "{\n  \"communicateTime\":" + String.valueOf(communicateTime) 
	//	+ ",\n  \"payload\":" + payload.getpayload() + "\n}";
	
	//return String.valueOf(constructTime);
	//return String.valueOf(communicateTime)+","+payload.getpayload();
	return String.valueOf(communicateTime);
      })
      .get();
	/*
	FlowFuture f1 = fl.supply(() -> ManagementFactory.getRuntimeMXBean().getName().split("@")[0]); 
	FlowFuture f2 = fl.supply(() -> ManagementFactory.getRuntimeMXBean().getName().split("@")[0]); 
	FlowFuture<String> f3 = f1.thenCombine(f2, 
		(result1, result2) -> { 
		String msg = result1 + " " + result2; 
		return msg; 
	});
	return f3.get();
	*/
	return flow1;
  }
}

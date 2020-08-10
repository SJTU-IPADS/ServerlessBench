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

function main(params) {
    startTime = Date.now();
    startTimes = new Array();
    retTimes = new Array();
    startTimes.push(startTime);
    if(params.startTimes != null){
        startTimes = startTimes.concat(params.startTimes)
    }
    if(params.retTimes != null){
        retTimes.push(Date.now())
        return {n: params.n + 1,startTimes: startTimes,retTimes:retTimes.concat(params.retTimes)}
    
    }
    else{
        retTimes.push(Date.now())
        return {n: params.n + 1,startTimes: startTimes,retTimes:retTimes}
    }
}


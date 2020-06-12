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


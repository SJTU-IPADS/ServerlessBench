
function main(params) {
    var startTime = Date.now();
    var startTimes = new Array();
    var invokeTimes = new Array();
    var retTimes = new Array();
    
    if (params.n == 1) {
        startTimes.push(startTime)
        retTimes.push(Date.now())
        return { result: 1 ,startTime:startTimes, retTime:retTimes}
    }
    else {

        var openwhisk = require('openwhisk')
        var ow = openwhisk({
            ignore_certs: true
        }
        )
        return new Promise(function (resolve, reject) {
            var invokeTime = Date.now()
            invokeTimes.push(invokeTime)
            ow.actions.invoke({ actionName: "arraySumNested", result: true, blocking: true, params: { n: params.n - 1 } }).then(result1 => {
                startTimes.push(startTime)
                if(result1.invokeTime != null){
                    retTimes.push(Date.now())
                    resolve({ result: 1 + result1.result, startTime:startTimes.concat(result1.startTime), 
                        retTime:retTimes.concat(result1.retTime), invokeTime:invokeTimes.concat(result1.invokeTime)})
                }
                else{
                    retTimes.push(Date.now())
                    resolve({ result: 1 + result1.result, startTime:startTimes.concat(result1.startTime), 
                        retTime:retTimes.concat(result1.retTime), invokeTime:invokeTimes})
                }
            }).catch(err =>{
                reject(err)
            })
        })

    }
}

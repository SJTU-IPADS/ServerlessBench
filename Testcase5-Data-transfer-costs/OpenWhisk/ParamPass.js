
function main(params){
    startTime = Date.now()
    payload = params.payload
    if(params.retTime){
        comTime = startTime - params.retTime
        console.log("payload size: " + payload.length)
        return {
            "retTime": Date.now(),
            "startTime": startTime,
            "comTime": comTime,
        }
    } else{
        console.log("chain head with payload size: " + payload.length )
        return{
            "payload": payload,
            'retTime':Date.now(),
        }
    }
    
}
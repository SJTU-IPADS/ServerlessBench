
function main(params) {
    startTime = Date.now();
    output = 'Hello, ' + params.payload
    return {greeting: output, startTime: startTime}
}

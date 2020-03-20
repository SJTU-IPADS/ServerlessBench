
function main(params){
    var a = params.a
    if(a==undefined){
        a = 10
    }
    var b = params.b
    if(b == undefined){
        b = 10
    }
    var temp = 0
    for(let i = 0;i < params.times;i++){
        if(i % 4 == 0){
            temp = a + b
        }
        else if(i % 4 == 1){
            temp = a - b
        }
        else if(i % 4 == 2) {
            temp = a * b
        }
        else if(i % 4 == 3){
            temp = b == 0 ? a / b : a / (b+1)
        }
    }
    console.log(temp)
    return {result:temp}
}

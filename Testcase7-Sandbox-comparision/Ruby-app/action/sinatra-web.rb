require 'sinatra'   
def main(params)
    startTime = `/home/hello`   
    startTimeNum = startTime.each_char{ |c| startTime.delete!(c) if c.ord<48 or c.ord>57 }              
    { startTime:startTimeNum }
    end              

require 'date'
def main(params)
  startTime = DateTime.now.strftime('%Q')
  { hello: "world",
    startTime:startTime }
  end

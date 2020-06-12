const TAX = require('./constances').TAX
const ROLES = require('./constances').ROLES

function main(params) {
  console.log('[wage-analysis-realpay] entry');

  var realpay = {'staff': 0, 'teamleader': 0, 'manager': 0};

  ROLES.forEach( role => {
      var num = params['total']['statistics'][role+'-number'];
      console.log('[realpay] role='+role+', num='+num);
      if (num !== 0) {
          var base = params['base']['statistics'][role];
          var merit = params['merit']['statistics'][role];

          realpay[role] = (1-TAX) * (base + merit) / num;
      }
  })

  params['statistics']['average-realpay'] = realpay;
  return params;
}

exports.main = main

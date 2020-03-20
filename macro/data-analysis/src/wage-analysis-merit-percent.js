const TAX = require('./constances').TAX
const ROLES = require('./constances').ROLES

function main(params) {
  console.log('[wage-analysis-merit-percent] entry');

  var meritp = {'staff': 0, 'teamleader': 0, 'manager': 0};

  ROLES.forEach( role => {
      var num = params['total']['statistics'][role+'-number'];
      if (num !== 0) {
          var base = params['base']['statistics'][role];
          var merit = params['merit']['statistics'][role];

          meritp[role] = merit / base;
      }
  })

  params['statistics']['average-merit-percent'] = meritp;
  return {'statistics': params['statistics'], 'operator' : params['operator']};
}

exports.main = main

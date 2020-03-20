function main(params) {
  console.log('[wage-analysis-total] entry');

  var stats = {'total': params['total']['statistics']['total'] };
  console.log('params[\'total\'][\'statistics\']=', JSON.stringify(params['total']['statistics']));
  console.log('stats:', JSON.stringify(stats));
  params['statistics'] = stats;
  return params;
}

exports.main = main

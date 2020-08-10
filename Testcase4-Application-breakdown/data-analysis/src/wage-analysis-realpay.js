/*
 * Copyright (c) 2020 Institution of Parallel and Distributed System, Shanghai Jiao Tong University
 * ServerlessBench is licensed under the Mulan PSL v1.
 * You can use this software according to the terms and conditions of the Mulan PSL v1.
 * You may obtain a copy of Mulan PSL v1 at:
 *     http://license.coscl.org.cn/MulanPSL
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR
 * PURPOSE.
 * See the Mulan PSL v1 for more details.
 */

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

//
// Copyright (c) 2020 Institution of Parallel and Distributed System, Shanghai Jiao Tong University
// ServerlessBench is licensed under the Mulan PSL v1.
// You can use this software according to the terms and conditions of the Mulan PSL v1.
// You may obtain a copy of Mulan PSL v1 at:
//     http://license.coscl.org.cn/MulanPSL
// THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR
// PURPOSE.
// See the Mulan PSL v1 for more details.
//

/* -*-mode:c++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */

/* combine of net/lambda.hh and net/aws.hh */

#ifndef OPENWHISK_HH
#define OPENWHISK_HH

#include <string>
#include <map>

#include "http_request.hh"

class OpenwhiskInvocationRequest
{
public:
  std::string first_line_;
  std::string contents_;

  std::map<std::string, std::string> headers_;

  static std::string endpoint();

  OpenwhiskInvocationRequest(const std::string & function_name,
                           const std::string & payload);

  HTTPRequest to_http_request() const;
};

#endif /* OPENWHISK_HH */

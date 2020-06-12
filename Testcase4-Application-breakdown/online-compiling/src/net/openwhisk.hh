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

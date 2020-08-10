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

#include "openwhisk.hh"

#include <cassert>
#include <string>
#include <stdexcept>

#include "util/util.hh"

using namespace std;

std::string OpenwhiskInvocationRequest::endpoint( )
{
  const static string openwhisk_apihost = safe_getenv( "OPENWHISK_APIHOST" );
  if ( openwhisk_apihost.length() == 0 ) {
    throw runtime_error( "OPENWHISK_APIHOST environment variable not set" );
  }
  return openwhisk_apihost;
}

OpenwhiskInvocationRequest::OpenwhiskInvocationRequest(const string & function_name,
                                                  const string & payload)
  : first_line_({}), contents_(payload), headers_()
{
  const static string openwhisk_token = safe_getenv( "OPENWHISK_TOKEN" );
  if ( openwhisk_token.length() == 0 ) {
    throw runtime_error( "OPENWHISK_TOKEN environment variable not set" );
  }
  const static string openwhisk_apihost = safe_getenv( "OPENWHISK_APIHOST" );
  if ( openwhisk_apihost.length() == 0 ) {
    throw runtime_error( "OPENWHISK_APIHOST environment variable not set" );
  }
  const static string openwhisk_apiport = safe_getenv( "OPENWHISK_APIPORT" );
  if ( openwhisk_apiport.length() == 0 ) {
    throw runtime_error( "OPENWHISK_APIPORT environment variable not set" );
  }

  const string path = "/api/" + openwhisk_token + "/guest/" + function_name;
  string uri = path + "?blocking=true";
  first_line_ = "POST " + uri + " HTTP/1.1";

  headers_[ "Host" ] = openwhisk_apihost + ":" + openwhisk_apiport;
  headers_[ "content-length" ] = to_string( payload.length() );
  headers_[ "Content-Type" ] = "application/json";
}

HTTPRequest OpenwhiskInvocationRequest::to_http_request() const
{
  HTTPRequest req;

  req.set_first_line( first_line_ );
  for ( const auto & header : headers_ ) {
    req.add_header( HTTPHeader { header.first, header.second } );
  }
  req.done_with_headers();

  req.read_in_body( contents_ );
  assert( req.state() == COMPLETE );

  return req;
}

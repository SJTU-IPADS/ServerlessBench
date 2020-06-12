/* -*-mode:c++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */

#ifndef ENGINE_OPENWHISK_HH
#define ENGINE_OPENWHISK_HH

#include <unordered_map>
#include <chrono>

#include "engine.hh"
#include "thunk/thunk.hh"
#include "net/openwhisk.hh"
#include "net/http_request.hh"

class OpenwhiskExecutionEngine : public ExecutionEngine
{
private:
  Address address_;

  size_t running_jobs_ { 0 };
  std::map<uint64_t, std::chrono::steady_clock::time_point> start_times_ {};

  HTTPRequest generate_request( const gg::thunk::Thunk & thunk );

  static float compute_cost( const std::chrono::steady_clock::time_point & begin,
                             const std::chrono::steady_clock::time_point & end = std::chrono::steady_clock::now() );

public:
  OpenwhiskExecutionEngine( const size_t max_jobs)
    : ExecutionEngine( max_jobs ),
      address_(OpenwhiskInvocationRequest::endpoint(), "9090")  
  {}

  void force_thunk( const gg::thunk::Thunk & thunk,
                    ExecutionLoop & exec_loop ) override;

  bool is_remote() const { return true; }
  bool can_execute( const gg::thunk::Thunk & thunk ) const override;
  std::string label() const override { return "\u03bb"; }
  size_t job_count() const override;
};

#endif /* ENGINE_OPENWHISK_HH */

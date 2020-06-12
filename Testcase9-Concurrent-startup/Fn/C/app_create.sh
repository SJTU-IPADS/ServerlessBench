#!/bin/bash
export FN_API_URL=http://127.0.0.1:7777
fn -v build
fn create app rawapp
fn deploy --app rawapp --local --no-bump
#!/bin/bash
export FN_API_URL=http://127.0.0.1:7777
fn -v build
fn create app javaapp
fn --verbose deploy --app javaapp --local --no-bump
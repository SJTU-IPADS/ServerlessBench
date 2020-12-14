#!/bin/bash -e

GIT_DIR=$(git rev-parse --git-dir)

git submodule init
mkdir -p ${GIT_DIR}/modules

git clone --depth 1 --branch gcc-7_2_0-release \
  --separate-git-dir ${GIT_DIR}/modules/gcc \
  https://github.com/gcc-mirror/gcc || true

git clone --depth 1 --branch binutils-2_28 \
  --separate-git-dir ${GIT_DIR}/modules/binutils-gdb \
  git://sourceware.org/git/binutils-gdb.git || true

git clone --depth 1 --branch gg \
  --separate-git-dir ${GIT_DIR}/modules/libgg \
  https://github.com/stanfordsnr/libgg || true

cd gcc && ./contrib/download_prerequisites

#!/bin/bash -xe

SRCDIR=`pwd`
NCPU=`nproc`

export PATH=${SRCDIR}/deps/bin:$PATH
export LD_LIBRARY_PATH=${SRCDIR}/deps/lib:${SRCDIR}/deps/x86_64-linux-musl/lib64

# build and install gg-gcc static
pushd build/gg-gcc
rm -f gcc/xgcc gcc/xg++ gcc/cc1 gcc/cc1plus gcc/collect2
make -j${NCPU} LDFLAGS="-static"
make DESTDIR=${SRCDIR}/inst install-strip
popd

# build and install gg-binutils
pushd build/gg-binutils
rm -f gas/as-new ld/ld-new binutils/ar binutils/nm-new binutils/ranlib binutils/strip-new binutils/readelf
make -j${NCPU} configure-host
make -j${NCPU} LDFLAGS="-all-static"
make DESTDIR=${SRCDIR}/inst install
popd

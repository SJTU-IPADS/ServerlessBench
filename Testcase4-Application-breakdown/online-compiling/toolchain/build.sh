#!/bin/bash -xe

ACTION=$1

case $ACTION in
  do-configure )
    DO_CONFIGURE=1
    ;;
esac

SRCDIR=`pwd`
NCPU=`nproc`

mkdir -p build
mkdir -p deps
mkdir -p inst

# build and install libgg
mkdir -p build/libgg
pushd build/libgg
if [ ! -z ${DO_CONFIGURE+x} ]
then
  ../../libgg/configure --prefix=${SRCDIR}/deps --syslibdir=${SRCDIR}/deps/lib
fi
make -j${NCPU}
make install
popd

# install minimal binutils symlinks
ln -sf /usr/bin/x86_64-linux-gnu-strip deps/bin/x86_64-linux-musl-strip
ln -sf /usr/bin/x86_64-linux-gnu-ranlib deps/bin/x86_64-linux-musl-ranlib
ln -sf /usr/bin/x86_64-linux-gnu-nm deps/bin/x86_64-linux-musl-nm
ln -sf /usr/bin/x86_64-linux-gnu-ld deps/bin/x86_64-linux-musl-ld
ln -sf /usr/bin/x86_64-linux-gnu-as deps/bin/x86_64-linux-musl-as
ln -sf /usr/bin/x86_64-linux-gnu-ar deps/bin/x86_64-linux-musl-ar

export PATH=${SRCDIR}/deps/bin:$PATH
export LD_LIBRARY_PATH=${SRCDIR}/deps/lib:${SRCDIR}/deps/x86_64-linux-musl/lib64

# build and install gnu-to-gg cross-compiler
mkdir -p build/gnu-to-gg-gcc
pushd build/gnu-to-gg-gcc
if [ ! -z ${DO_CONFIGURE+x} ]
then
  ../../gcc/configure --enable-languages=c,c++ --prefix=${SRCDIR}/deps --disable-multilib --disable-libsanitizer --disable-bootstrap --disable-nls --program-prefix="gnu-to-gg-" --with-sysroot=${SRCDIR}/deps --with-native-system-header-dir=/include --build=x86_64-linux-gnu --host=x86_64-linux-gnu --target=x86_64-linux-musl --enable-checking=release --disable-lto --with-gcc-major-version-only
fi
make -j${NCPU}
make install-strip
popd

# build and install gg-gcc
mkdir -p build/gg-gcc
pushd build/gg-gcc
if [ ! -z ${DO_CONFIGURE+x} ]
then
  ../../gcc/configure --enable-languages=c,c++ --prefix=/usr --disable-multilib --disable-bootstrap --disable-nls --program-prefix="gg-" --with-sysroot=/ --build=x86_64-linux-musl --host=x86_64-linux-musl --target=x86_64-linux-gnu --enable-checking=release --disable-lto --with-gcc-major-version-only --enable-default-pie CC="gnu-to-gg-gcc -Wl,-I${SRCDIR}/deps/lib/libc.so" CXX="gnu-to-gg-g++ -Wl,-I${SRCDIR}/deps/lib/libc.so"
fi
make -j${NCPU}
make DESTDIR=${SRCDIR}/inst install
popd

# build and install gg-binutils
mkdir -p build/gg-binutils
pushd build/gg-binutils
if [ ! -z ${DO_CONFIGURE+x} ]
then
  ../../binutils-gdb/configure --prefix=/usr --disable-gdb --disable-readline --disable-sim --enable-deterministic-archives --build=x86_64-linux-musl --host=x86_64-linux-musl --target=x86_64-linux-gnu --program-prefix="gg-" CC="gnu-to-gg-gcc -Wl,-I${SRCDIR}/deps/lib/libc.so" CXX="gnu-to-gg-g++ -Wl,-I${SRCDIR}/deps/lib/libc.so"
fi
make -j${NCPU}
make DESTDIR=${SRCDIR}/inst install
popd

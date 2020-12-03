#!/bin/bash -xe

SRCDIR=`pwd`
DESTDIR=${SRCDIR}/bin
INSTDIR=${SRCDIR}/inst/usr/bin
GCC_INSTDIR=${SRCDIR}/inst/usr/libexec/gcc/x86_64-linux-gnu/7

mkdir -p ${DESTDIR}

for exe in g++ gcc ld as ar ranlib nm strip as readelf
do
  cp ${INSTDIR}/gg-${exe} ${DESTDIR}/${exe}
done

for exe in cc1 cc1plus collect2
do
  cp ${GCC_INSTDIR}/${exe} ${DESTDIR}/${exe}
done

for exe in $(ls ${DESTDIR})
do
  strip ${DESTDIR}/${exe}
done

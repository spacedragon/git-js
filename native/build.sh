#!/bin/bash
source scl_source enable devtoolset-3
OUTPUT_DIR=/src
mkdir -p $OUTPUT_DIR
cd $OUTPUT_DIR
OPENSSL_DIR=$OUTPUT_DIR/openssl
CURL_DIR=$OUTPUT_DIR/curl
GIT_DIR=$OUTPUT_DIR/git

OPENSSL_VERSION=1.1.1c
CURL_VERSION=7.65.3
GIT_VERSION=2.22.0

(
# download and compile openssl

wget "https://www.openssl.org/source/openssl-${OPENSSL_VERSION}.tar.gz"
tar xfz openssl-${OPENSSL_VERSION}.tar.gz
cd openssl-${OPENSSL_VERSION}
# compile to static lib only
./config no-shared --prefix=${OPENSSL_DIR} --openssldir=${OPENSSL_DIR}
TARGET_ARCH="" make
make install
)


(
# download an compile curl
cd $OUTPUT_DIR
wget https://curl.haxx.se/download/curl-${CURL_VERSION}.tar.gz
tar xfz curl-${CURL_VERSION}.tar.gz
cd curl-${CURL_VERSION}
./configure --prefix=${CURL_DIR} --with-ssl=${OPENSSL_DIR} \
    --disable-ldap --disable-sspi --without-librtmp --disable-ftp --disable-file --disable-dict --disable-telnet --disable-tftp \
    --disable-rtsp --disable-pop3 --disable-imap --disable-smtp --disable-gopher --disable-smb --without-libidn
make install

)



cd $OUTPUT_DIR
wget https://mirrors.edge.kernel.org/pub/software/scm/git/git-${GIT_VERSION}.tar.gz
tar xfz git-${GIT_VERSION}.tar.gz
cd git-${GIT_VERSION}/
make clean
make configure
CC='gcc' \
  CFLAGS='-Wall -g -O2 -fstack-protector --param=ssp-buffer-size=4 -Wformat -Werror=format-security -U_FORTIFY_SOURCE' \
  LDFLAGS='-Wl,-Bsymbolic-functions -Wl,-z,relro' \
  ./configure \
  --with-curl="${CURL_DIR}" \
  --with-openssl="${OPENSSL_DIR}" \
  --prefix=/

DESTDIR="${GIT_DIR}" \
  NO_TCLTK=1 \
  NO_GETTEXT=1 \
  NO_INSTALL_HARDLINKS=1 \
  NO_R_TO_GCC_LINKER=1 \
  make LIB_4_CRYPTO='$(OPENSSL_LINK) -lcrypto -ldl'  \
    EXPAT_LIBEXPAT='-l:libexpat.a'  \
    CURL_LDFLAGS="-l:libcurl.a -L${OPENSSL_DIR}/lib -lssl -lz -lrt -lcrypto -ldl -lpthread" \
    strip \
    install

(
# download CA bundle and write straight to temp folder
# for more information: https://curl.haxx.se/docs/caextract.html
echo "-- Adding CA bundle"
cd "$GIT_DIR" || exit 1
mkdir -p ssl
curl -sL -o ssl/cacert.pem https://curl.haxx.se/ca/cacert.pem
)

if [[ ! -f "$GIT_DIR/ssl/cacert.pem" ]]; then
  echo "-- Skipped bundling of CA certificates (failed to download them)"
fi

echo "-- Removing server-side programs"
rm "$GIT_DIR/bin/git-cvsserver"
rm "$GIT_DIR/bin/git-receive-pack"
rm "$GIT_DIR/bin/git-upload-archive"
rm "$GIT_DIR/bin/git-upload-pack"
rm "$GIT_DIR/bin/git-shell"

echo "-- Removing unsupported features"
rm "$GIT_DIR/libexec/git-core/git-svn"
rm "$GIT_DIR/libexec/git-core/git-remote-testsvn"
rm "$GIT_DIR/libexec/git-core/git-p4"
rm "$GIT_DIR/libexec/git-core/git-imap-send"


echo "-- Testing clone operation with generated binary"

TEMP_CLONE_DIR=/tmp/clones
mkdir -p $TEMP_CLONE_DIR

(
cd "$GIT_DIR/bin" || exit 1
./git --version
GIT_CURL_VERBOSE=1 \
  GIT_TEMPLATE_DIR="$GIT_DIR/share/git-core/templates" \
  GIT_SSL_CAINFO="$GIT_DIR/ssl/cacert.pem" \
  GIT_EXEC_PATH="$GIT_DIR/libexec/git-core" \
  PREFIX="$GIT_DIR" \
  ./git clone https://github.com/git/git.github.io "$TEMP_CLONE_DIR/git.github.io"
)
DEST=$1
if [ -z "$1" ] ; then
    DEST="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
fi

cp -r $GIT_DIR $DEST
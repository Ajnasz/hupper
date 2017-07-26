#!/bin/sh

set -e

NPMBIN=$(npm bin)

ESLINT=$NPMBIN/eslint
BROWSERIFY=$NPMBIN/browserify

$ESLINT --ignore-pattern=bundle\.js -c .eslintrc {options,lib,data,core}/**/*.js

mkdir -p images/icons
cp ../icons/IconMoon/009-pen.png images/icons/

createzip() {
	version=$1
	grunt $version
}

createzip "chrome"
createzip "firefox"
echo " . "

echo "build on `date`"

#!/bin/sh

set -e

BROWSERIFY=$(npm bin)/browserify

echo -n " ."
$BROWSERIFY options/main.js -o options/bundle.js -t babelify
echo -n " ."
$BROWSERIFY data/main.js -o data/bundle.js -t babelify
echo -n " ."
$BROWSERIFY lib/main.js -o lib/bundle.js -t babelify
echo -n " ."
rm -f hupper*.zip
echo -n " ."

PATHS="data/bundle.js data/core/css/*.css lib/bundle.js options/bundle.js options/*.css options.html manifest.json"

for icon in 128 48 32 16;do
	PATHS="icons/$icon.png $PATHS"
done

zip --quiet -MM -r hupper.zip $PATHS
echo " . "

echo "build on `date`"

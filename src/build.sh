#!/bin/sh

BROWSERIFY=$(npm bin)/browserify

echo -n " ."
$BROWSERIFY options/main.js -o options/bundle.js -t [ babelify --presets [ es2015 ] ]
echo -n " ."
$BROWSERIFY data/main.js -o data/bundle.js -t [ babelify --presets [ es2015 ] ]
echo -n " ."
$BROWSERIFY lib/main.js -o lib/bundle.js -t [ babelify --presets [ es2015 ] ]
echo -n " ."
rm -f hupper*.zip
echo -n " ."

zip --quiet -r hupper.zip icons/{128,16,32,48}.png data/bundle.js data/core/css/*.css lib/bundle.js options/bundle.js options/*.css options.html manifest.json
echo " . "

echo "build on `date`"

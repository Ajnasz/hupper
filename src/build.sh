#!/bin/sh

BROWSERIFY=$(npm bin)/browserify

echo -n " ."
$BROWSERIFY options/main.js -o options/bundle.js -t [ babelify --presets [ es2015 ] ]
echo -n " ."
$BROWSERIFY data/main.js -o data/bundle.js -t [ babelify --presets [ es2015 ] ]
echo -n " ."
$BROWSERIFY lib/main.js -o lib/bundle.js -t [ babelify --presets [ es2015 ] ]
echo -n " ."
rm -f hupper.zip
echo -n " ."
zip --quiet -r hupper.zip data lib options options.html manifest.json package.json
echo " . "

echo "build on `date`"

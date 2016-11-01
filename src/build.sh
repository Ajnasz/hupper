#!/bin/sh

BROWSERIFY=$(npm bin)/browserify

echo $BROWSERIFY

echo start build
$BROWSERIFY options/main.js -o options/bundle.js -t [ babelify --presets [ es2015 ] ]
echo -n " ."
$BROWSERIFY data/main.js -o data/bundle.js -t [ babelify --presets [ es2015 ] ]
echo -n " ."
$BROWSERIFY lib/main.js -o lib/bundle.js -t [ babelify --presets [ es2015 ] ]
echo " . "
echo "done `date`"

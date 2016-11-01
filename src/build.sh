browserify options/main.js -o options/bundle.js -t [ babelify --presets [ es2015 ] ]
browserify data/main.js -o data/bundle.js -t [ babelify --presets [ es2015 ] ]
browserify lib/main.js -o lib/bundle.js -t [ babelify --presets [ es2015 ] ]
echo "built" `date`

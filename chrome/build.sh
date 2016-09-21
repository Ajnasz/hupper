#!/bin/sh
mkdir -p data/core
mkdir -p data/core/css
mkdir -p lib/core
mkdir -p options/core
# cp -ar ../core/data/* data/core
# cp -ar ../core/data/css/* data/core/css/
# cp -ar ../core/lib/* lib/core

# cp lib/require.js options/
# cp lib/pref.js options/
# cp -ar ../core/lib/* options/core

# cat data/core/rq.js data/core/dom.js data/core/func.js data/core/commenttree.js data/core/comments.js data/core/articles.js data/core/blocks.js data/core/hupper-block.js data/core/unlimitedlinks.js data/hupper.js > data/built-es6.js
# babel data/built-es6.js > data/built.js

# node modulenamefixer.js lib/core

# cat lib/require.js \
# 	lib/core/pref.js \
# 	lib/pref.js \
# 	lib/core/func.js \
# 	lib/core/main.js \
# 	lib/core/pagestyles.js \
# 	lib/core/articles.js \
# 	lib/core/comments.js \
# 	lib/core/blocks.js \
# 	lib/main.js > lib/built-es6.js
# $(npm bin)/babel --compact=false lib/built-es6.js > lib/built.js

# cp lib/pref.js options/pref.js
# cp lib/require.js options/require.js
# cp ../core/options/edit-trolls.js options/core/edit-trolls.js
# cp ../core/lib/func.js options/core/func.js
# cp ../core/data/dom.js options/core/dom.js
# cp ../core/lib/pref.js  options/core/pref.js

# cat options/require.js \
# 	options/core/func.js \
# 	options/core/dom.js \
# 	options/core/pref.js \
# 	options/pref.js \
# 	options/edit-highlightedusers.js \
# 	options/core/edit-trolls.js \
# 	options/edit-trolls.js \
# 	options/options.js > options/built-es6.js
# $(npm bin)/babel --compact=false options/built-es6.js > options/built.js

echo "built" `date`
browserify options/main.js -o options/bundle.js -t [ babelify --presets [ es2015 ] ]
browserify data/main.js -o data/bundle.js -t [ babelify --presets [ es2015 ] ]
browserify lib/main.js -o lib/bundle.js -t [ babelify --presets [ es2015 ] ]

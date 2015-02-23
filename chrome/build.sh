#!/bin/sh
cat data/core/rq.js data/core/dom.js data/core/func.js data/core/commenttree.js data/core/comments.js data/core/articles.js data/core/blocks.js data/core/hupper-block.js data/core/unlimitedlinks.js data/hupper.js > data/built-es6.js
babel data/built-es6.js > data/built.js

cat lib/require.js lib/pref.js lib/core/func.js lib/core/articles.js lib/main.js > lib/built-es6.js
babel --compact=false lib/built-es6.js > lib/built.js

echo "built" `date`

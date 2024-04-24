#!/usr/bin/env sh

npm run build
cp -r build/* ~/Websites/chronoquiz.net/www/

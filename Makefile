babel := babel
browserify := browserify -t aliasify
presets := es2015,react
sourcesdir := lib
builddir := es5
standalone := static/corleone.js
main := lib/component/app.js


include babel.mk

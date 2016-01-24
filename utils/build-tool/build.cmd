@echo off
echo [0/4] compiling .coffee to .js
call coffee -bcm ../../src/
echo [1/4] concating .js
call coffee concat-tool\concat-tool.coffee
echo [2/4] minifying geom2d.js to geom2d.min.js
call java -jar compiler/compiler.jar --js ../../build/geom2d.js --js_output_file ../../build/geom2d.min.js
echo [3/4] compiling .jade to .html
call jade -P ../../examples/
echo [4/4] build completed!
pause

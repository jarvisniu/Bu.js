/**
 * build the examples by compiling .coffee -> .js and .jade -> .html
 */

var process = require('process');
var child_process = require('child_process');

process.chdir(__dirname);

console.log('[0/4] compiling src/ .coffee to .js');
child_process.execSync('coffee -bcm ../src/');

console.log('[1/4] compiling examples/lib/ .coffee to .js');
child_process.execSync('coffee -bcm ../examples/lib/');

console.log('[2/4] compiling .jade to .html');
child_process.execSync('jade -P ../examples/');

console.log('[3/4] compiling .styl to .css');
child_process.execSync('stylus ../examples/style/');

console.log('[4/4] build completed!');

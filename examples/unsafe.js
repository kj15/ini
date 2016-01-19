//This is the example to test the unsafe function.

//Get ini module
var ini = require('../ini');

var testStr = '"This is a string."';
var test2Str = '\\#This is another string\\;';

console.log('Test string #1: ' + testStr);
console.log('unsafe: ' + ini.unsafe(testStr));

console.log('\nTest string #2: ' + test2Str);
console.log('unsafe: ' + ini.unsafe(test2Str));
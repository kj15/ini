//This is the example to test the dotSplit function.

//Get ini module.
var ini = require('../ini');

var testStr = '\'This is a string with quotes\'';
var test2Str = 'This is a string without quotes';

console.log('Test string #1: ' + testStr);
console.log('isQuoted: ' + ini.isQuoted(testStr));

console.log('\nTest string #2: ' + test2Str);
console.log('isQuoted: ' + ini.isQuoted(test2Str));
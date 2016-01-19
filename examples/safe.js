//This is the example to test the safe function.

//Get ini module
var ini = require('../ini');

var testStr = '"This is a string."';
var test2Str = '#This is another string;';

console.log('Test string #1: ' + testStr);
console.log('safe: ' + ini.safe(testStr));

console.log('\nTest string #2: ' + test2Str);
console.log('safe: ' + ini.safe(test2Str));
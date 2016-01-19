//This is the example to test the dotSplit function.

//Get ini module.
var ini = require("../ini");

var testStr = 'hello';
var test2Str = 'he.ll.o';
var test3Str = '...h..ello..';

console.log('Test #1 string: ' + testStr);
console.log(ini.dotSplit(testStr));

console.log('\nTest #2 string: ' + test2Str);
console.log(ini.dotSplit(test2Str));

console.log('\nTest #3 string: ' + test3Str);
console.log(ini.dotSplit(test3Str));
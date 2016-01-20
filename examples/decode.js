//This is the example to test the decode function.

//Get ini module.
var ini = require('../ini');
//Get file reader.
var fs = require('fs');

var testIniStr = fs.readFileSync('decodeIni.ini', "utf8");

console.log('Test .ini file: \n' + testIniStr);

console.log('\nDecoded object: \n' + JSON.stringify(ini.decode(testIniStr)));
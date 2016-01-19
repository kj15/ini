//This is the example to test the encode function.

//Get ini module
var ini = require('../ini');

var testObj = {
	a: {
		ab: 1
	},
	b: {
		ba: 3,
		bb: 4,
	},
	c: {
		ca: 5,
		cb: 6,
		cc: 7
	}
}

console.log('Object without encoding:\n' + JSON.stringify(testObj));

console.log('\nObject with encoding, no options:\n' + ini.encode(testObj));

console.log('\nObject with encoding, with whitespace option:\n' + ini.encode(testObj, {whitespace: true}));

console.log('\nObject with encoding, with section headers option:\n' + ini.encode(testObj, {section: 'header'}));
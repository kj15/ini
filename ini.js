exports.parse = exports.decode = decode
exports.stringify = exports.encode = encode

exports.safe = safe
exports.unsafe = unsafe

//Added these to module exports for example purposes.
exports.dotSplit = dotSplit
exports.isQuoted = isQuoted

//End of line characters depends on system
var eol = process.platform === 'win32' ? '\r\n' : '\n'

/**
 * Given a JS object, return a properly formatted .ini string.
 * @param {object} obj - The object to be encoded.
 * @param {object/string} opt - The options for encoding, which can be an object with attributes section and whitespace
	*	@attr {string} section - A section header prefix for each section, defaults to none.
	*	@attr {bool} whitespace - True will add whitespaces before and after the = sign, false will ommit them. 
 * If opt is read as a string, then the method will assume opt is the value for section.
 * @returns a string properly structured as an .ini file
*/
function encode (obj, opt) {
  var children = []
  var out = ''

  //Test type of opt to determine if it's the value for section
  if (typeof opt === 'string') {
    opt = {
      section: opt,
      whitespace: false
    }
  } else {
    opt = opt || {}
    opt.whitespace = opt.whitespace === true
  }

  var separator = opt.whitespace ? ' = ' : '='

  //Main loop through obj's attributes, will append to out the correct structure.
  Object.keys(obj).forEach(function (k, _, __) {
    var val = obj[k]
	//Loop to display arrays.
    if (val && Array.isArray(val)) {
      val.forEach(function (item) {
        out += safe(k + '[]') + separator + safe(item) + '\n'
      })
	  //Deal with objects by assigning them to children.
    } else if (val && typeof val === 'object') {
      children.push(k)
    } else {
      out += safe(k) + separator + safe(val) + eol
    }
  })

  //Insert section header prefix if specified.
  if (opt.section && out.length) {
    out = '[' + safe(opt.section) + ']' + eol + out
  }
  //Go through objects to display, recursively call them back to encode if children are objects.
  children.forEach(function (k, _, __) {
    var nk = dotSplit(k).join('\\.')
    var section = (opt.section ? opt.section + '.' : '') + nk
    var child = encode(obj[k], {
      section: section,
      whitespace: opt.whitespace
    })
    if (out.length && child.length) {
      out += eol
    }
    out += child
  })

  return out
}

/**
 * Basic function used to split on the string literal of a period or dot.
 * @param {object} str - The string to be split.
 * @returns an array delimited by the unicode literal of a period or dot.
*/
function dotSplit (str) {
  return str.replace(/\1/g, '\u0002LITERAL\\1LITERAL\u0002')
    .replace(/\\\./g, '\u0001')
    .split(/\./).map(function (part) {
    return part.replace(/\1/g, '\\.')
      .replace(/\2LITERAL\\1LITERAL\2/g, '\u0001')
  })
}

function decode (str) {
  var out = {}
  var p = out
  var section = null
  //          section     |key      = value
  var re = /^\[([^\]]*)\]$|^([^=]+)(=(.*))?$/i
  var lines = str.split(/[\r\n]+/g)

  lines.forEach(function (line, _, __) {
    if (!line || line.match(/^\s*[;#]/)) return
    var match = line.match(re)
    if (!match) return
    if (match[1] !== undefined) {
      section = unsafe(match[1])
      p = out[section] = out[section] || {}
      return
    }
    var key = unsafe(match[2])
    var value = match[3] ? unsafe((match[4] || '')) : true
    switch (value) {
      case 'true':
      case 'false':
      case 'null': value = JSON.parse(value)
    }

    // Convert keys with '[]' suffix to an array
    if (key.length > 2 && key.slice(-2) === '[]') {
      key = key.substring(0, key.length - 2)
      if (!p[key]) {
        p[key] = []
      } else if (!Array.isArray(p[key])) {
        p[key] = [p[key]]
      }
    }

    // safeguard against resetting a previously defined
    // array by accidentally forgetting the brackets
    if (Array.isArray(p[key])) {
      p[key].push(value)
    } else {
      p[key] = value
    }
  })

  // {a:{y:1},"a.b":{x:2}} --> {a:{y:1,b:{x:2}}}
  // use a filter to return the keys that have to be deleted.
  Object.keys(out).filter(function (k, _, __) {
    if (!out[k] ||
      typeof out[k] !== 'object' ||
      Array.isArray(out[k])) {
      return false
    }
    // see if the parent section is also an object.
    // if so, add it to that, and mark this one for deletion
    var parts = dotSplit(k)
    var p = out
    var l = parts.pop()
    var nl = l.replace(/\\\./g, '.')
    parts.forEach(function (part, _, __) {
      if (!p[part] || typeof p[part] !== 'object') p[part] = {}
      p = p[part]
    })
    if (p === out && nl === l) {
      return false
    }
    p[nl] = out[k]
    return true
  }).forEach(function (del, _, __) {
    delete out[del]
  })

  return out
}

/**
 * Determines if the string passed to it is surrounded by quotes (single or double).
 * @param {string} val - The string to be tested.
 * @returns True if the string begins and starts with ' or ", False if not.
*/
function isQuoted (val) {
  return (val.charAt(0) === '"' && val.slice(-1) === '"') ||
    (val.charAt(0) === "'" && val.slice(-1) === "'")
}

/**
 * Sanitizes input for use as a key or value in an .ini file.
 * @param {string} val - The string to be escaped.
 * @returns an string where each character with a conflict with .ini file standards is escaped.
*/
function safe (val) {
  return (typeof val !== 'string' ||
    val.match(/[=\r\n]/) ||
    val.match(/^\[/) ||
    (val.length > 1 &&
     isQuoted(val)) ||
    val !== val.trim()) ?
      JSON.stringify(val) :
      val.replace(/;/g, '\\;').replace(/#/g, '\\#')
}

/**
 * Unescapes all escaped characters contained in the string passed in.
 * @param {string} val - The string to be escaped.
 * @param {object} doUnesc - Not used.
 * @returns a string with all instances of an escaped character unescaped, specifically those escaped by the safe method.
*/
function unsafe (val, doUnesc) {
  val = (val || '').trim()
  if (isQuoted(val)) {
    // remove the single quotes before calling JSON.parse
    if (val.charAt(0) === "'") {
      val = val.substr(1, val.length - 2)
    }
    try { val = JSON.parse(val) } catch (_) {}
  } else {
    // walk the val to find the first not-escaped ; character
    var esc = false
    var unesc = ''
    for (var i = 0, l = val.length; i < l; i++) {
      var c = val.charAt(i)
      if (esc) {
        if ('\\;#'.indexOf(c) !== -1) {
          unesc += c
        } else {
          unesc += '\\' + c
        }
        esc = false
      } else if (';#'.indexOf(c) !== -1) {
        break
      } else if (c === '\\') {
        esc = true
      } else {
        unesc += c
      }
    }
    if (esc) {
      unesc += '\\'
    }
    return unesc
  }
  return val
}

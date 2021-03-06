"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.__parseVersion = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.parseDirString = parseDirString;
exports.disjointVersionsAll = disjointVersionsAll;
exports.toDirString = toDirString;
exports.toSemverString = toSemverString;

var _validationErrors = require("./validationErrors");

function _parseVerNum(numStr, verName, context, validationErrs) {
  var num = parseInt(numStr, 10);
  if (String(num) !== numStr) {
    var error = "'" + context + "': Invalid " + verName + " number: '" + numStr + "'. Expected a number.";
    (0, _validationErrors.validationError)(context, error, validationErrs);
  }
  return num;
}

function _parseVerNumOrX(numStr, verName, context, validationErrs) {
  if (numStr == null) {
    return 'x';
  }

  if (numStr === 'x') {
    return numStr;
  }

  return _parseVerNum(numStr, verName, context, validationErrs);
}

function _parseVersion(verStr, expectPossibleRangeUpper, validationErrs) {
  if (verStr[0] !== 'v') {
    (0, _validationErrors.validationError)(verStr, 'Flow version ranges must start with a `v`!', validationErrs);
    return _parseVersion('v' + verStr, expectPossibleRangeUpper, validationErrs);
  }

  var verParts = verStr.slice(1).match(/^([0-9]+)\.([0-9]+|x)(\.([0-9]+|x))?/);
  var majorStr = void 0,
      minorStr = void 0,
      patchStr = void 0;
  if (verParts == null) {
    if (verStr[1] === 'x') {
      (0, _validationErrors.validationError)(verStr, 'The major version of a Flow version string cannot be `x`, it must ' + 'be a number!', validationErrs);
      return _parseVersion('v0' + verStr.substr(2), expectPossibleRangeUpper, validationErrs);
    } else {
      (0, _validationErrors.validationError)(verStr, 'Flow versions must be a non-range semver with an exact major ' + 'version and either an exact minor version or an `x` minor ver.', validationErrs);
    }
    return [0, { major: 0, minor: 'x', patch: 'x', prerel: null }];
  } else {
    majorStr = verParts[1];
    minorStr = verParts[2];
    patchStr = verParts[4];
  }

  var _ref = [_parseVerNum(majorStr, 'major', verStr, validationErrs), _parseVerNumOrX(minorStr, 'minor', verStr, validationErrs), _parseVerNumOrX(patchStr, 'patch', verStr, validationErrs)],
      major = _ref[0],
      minor = _ref[1],
      patch = _ref[2];


  var verAfterParts = verStr.substr(verParts[0].length + 1);
  if (patchStr != null && verAfterParts[0] === '-' && verAfterParts[1] != null) {
    if (expectPossibleRangeUpper) {
      // A `-` could indicate either a range or a prerel. This is technically
      // a real ambiguity in our versioning syntax -- but luckily it's rarely
      // encountered.
      //
      // To deal with this, we try parsing as a version. If it parses we assume
      // a range. If it doesn't parse as a version, we assume a pre-rel
      // identifier.
      //
      // This is excitingly inefficient but because it operates on tiny inputs
      // (and only sometimes) it shouldn't be an issue in practice.
      try {
        _parseVersion(verAfterParts.substr(1), false);
        return [verParts[0].length + 1, { major: major, minor: minor, patch: patch, prerel: null }];
      } catch (e) {
        // It's possible that a prerel *and* a range co-exist!
        // v0.1.x-prerel-v0.2.x
        var prerelParts = verAfterParts.substr(1).split('-'); // ['prerel', 'v0.2.x']
        var _prerel = prerelParts.shift(); // 'prerel'
        while (prerelParts.length > 0) {
          try {
            _parseVersion(prerelParts.join('-'), false);
            break;
          } catch (e) {
            _prerel += '-' + prerelParts.shift();
          }
        }

        return [verParts[0].length + '-'.length + _prerel.length + 1, {
          major: major,
          minor: minor,
          patch: patch,
          prerel: _prerel
        }];
      }
    } else {
      // After the `-` must be a prerel
      return [verStr.length + 1, {
        major: major,
        minor: minor,
        patch: patch,
        prerel: verAfterParts.substr(1)
      }];
    }
  } else {
    return [verParts[0].length + 1, { major: major, minor: minor, patch: patch, prerel: null }];
  }
}

function parseDirString(verStr, validationErrs) {
  if (verStr.substr(0, 'flow_'.length) !== 'flow_') {
    (0, _validationErrors.validationError)(verStr, 'Flow versions must start with `flow-`', validationErrs);
    return { kind: 'all' };
  }

  var afterPrefix = verStr.substr('flow_'.length);

  if (afterPrefix === 'all') {
    return { kind: 'all' };
  } else if (afterPrefix[0] === '-') {
    return {
      kind: 'ranged',
      lower: null,
      upper: _parseVersion(verStr.substr('flow_-'.length), false, validationErrs)[1]
    };
  } else {
    var _parseVersion2 = _parseVersion(afterPrefix, true, validationErrs),
        _parseVersion3 = _slicedToArray(_parseVersion2, 2),
        offset = _parseVersion3[0],
        lowerVer = _parseVersion3[1];

    if (offset === afterPrefix.length) {
      return {
        kind: 'specific',
        ver: lowerVer
      };
    } else if (afterPrefix[offset] === '-') {
      var upperVer = offset + 1 === afterPrefix.length ? null : _parseVersion(afterPrefix.substr(offset + 1), false, validationErrs)[1];
      return {
        kind: 'ranged',
        lower: lowerVer,
        upper: upperVer
      };
    } else {
      (0, _validationErrors.validationError)(verStr, "Unexpected trailing characters: " + afterPrefix.substr(offset), validationErrs);
      return {
        kind: 'specific',
        ver: lowerVer
      };
    }
  }
}

/**
 * Given two version ranges a and b, determine whether a is before b.
 */
function lt(n1, n2) {
  if (n1 === "x" || n2 === "x") return false;
  if (n1 < n2) return true;
  if (n1 > n2) return false;
  return "maybe";
}
function before(a, b) {
  var test = lt(a.major, b.major);
  if (test !== "maybe") return test;
  test = lt(a.minor, b.minor);
  if (test !== "maybe") return test;
  test = lt(a.patch, b.patch);
  if (test !== "maybe") return test;
  return false;
}

/**
 * Given a version range, returns the max version satisfying the range.
 */
function maxSat(ver) {
  switch (ver.kind) {
    case 'all':
      return null;
    case 'ranged':
      return ver.upper;
    case 'specific':
      return ver.ver;
    default:
      ver;throw new Error('Unexpected FlowVersion kind!');
  }
}

/**
 * Given a version range, returns the min version satisfying the range.
 */
function minSat(ver) {
  switch (ver.kind) {
    case 'all':
      return null;
    case 'ranged':
      return ver.lower;
    case 'specific':
      return ver.ver;
    default:
      ver;throw new Error('Unexpected FlowVersion kind!');
  }
}

/**
 * Given two versions, returns whether they are disjoint.
 */
function _before(a, b) {
  // If a is undefined, it denotes the maximum version. If b is undefined, it
  // denotes the minimum version.
  if (a && b) return before(a, b);
  return false;
}
function disjointVersions(a, b) {
  return _before(maxSat(a), minSat(b)) || _before(maxSat(b), minSat(a));
}

/**
 * Given an array of versions, returns whether they are mutually disjoint.
 */
function _disjointVersionsAll(vers, len, i) {
  if (i + 1 >= len) return true;
  for (var j = i + 1; j < len; j++) {
    if (!disjointVersions(vers[i], vers[j])) {
      return false;
    }
  }
  return _disjointVersionsAll(vers, len, i + 1);
}
function disjointVersionsAll(vers) {
  return _disjointVersionsAll(vers, vers.length, 0);
};

function toDirString(ver) {
  switch (ver.kind) {
    case 'all':
      return 'flow_all';

    case 'specific':
      {
        var str = "flow_v" + ver.ver.major + "." + ver.ver.minor;
        if (ver.ver.patch !== null) {
          str += "." + ver.ver.patch;
          if (ver.ver.prerel) {
            str += "-" + ver.ver.prerel;
          }
        }
        return str;
      }

    case "ranged":
      {
        var _lower = ver.lower,
            _upper = ver.upper;

        var _str = "flow_";
        if (_lower !== null) {
          _str += "v" + _lower.major + "." + _lower.minor;
          if (_lower.patch !== null) {
            _str += "." + _lower.patch;
            if (_lower.prerel !== null) {
              _str += "-" + _lower.prerel;
            }
          }
        }

        _str += '-';

        if (_upper !== null) {
          _str += "v" + _upper.major + "." + _upper.minor;
          if (_upper.patch !== null) {
            _str += "." + _upper.patch;
            if (_upper.prerel !== null) {
              _str += "-" + _upper.prerel;
            }
          }
        }
        return _str;
      }

    default:
      ver;throw new Error('Unexpected FlowVersion kind!');
  }
};

function toSemverString(ver) {
  switch (ver.kind) {
    case 'all':
      return 'vx.x.x';

    case 'specific':
      return toDirString(ver).substr('flow_'.length);

    case 'ranged':
      {
        var _upper2 = ver.upper,
            _lower2 = ver.lower;

        var str = '';
        if (_lower2 !== null) {
          str += ">=v" + _lower2.major + "." + _lower2.minor;
          if (_lower2.patch !== null) {
            str += "." + _lower2.patch;
            if (_lower2.prerel !== null) {
              str += "-" + _lower2.prerel;
            }
          }
          if (_upper2 !== null) {
            str += ' ';
          }
        }

        if (_upper2 !== null) {
          str += "<=v" + _upper2.major + "." + _upper2.minor;
          if (_upper2.patch !== null) {
            str += "." + _upper2.patch;
            if (_upper2.prerel !== null) {
              str += "-" + _upper2.prerel;
            }
          }
        }
        return str;
      }

    default:
      ver;throw new Error('Unexpected FlowVersion kind!');
  };
};

// Exported for tests
exports.__parseVersion = _parseVersion;
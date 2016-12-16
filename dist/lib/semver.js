"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.emptyVersion = emptyVersion;
exports.copyVersion = copyVersion;
exports.sortVersions = sortVersions;
exports.disjointVersions = disjointVersions;
exports.isSatVersion = isSatVersion;
exports.disjointVersionsAll = disjointVersionsAll;
exports.getRangeLowerBound = getRangeLowerBound;
exports.stringToVersion = stringToVersion;
exports.versionToString = versionToString;
exports.wildcardSatisfies = wildcardSatisfies;

var _semver = require("semver");

var semver = _interopRequireWildcard(_semver);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function emptyVersion() {
  return {
    range: '<=',
    major: 'x',
    minor: 'x',
    patch: 'x'
  };
}

function copyVersion(ver) {
  return {
    range: ver.range,
    major: ver.major,
    minor: ver.minor,
    patch: ver.patch
  };
}

/**
 * Given two versions (can be ranges), returns < 0 if a's lower
 * bound is less than b's lower bound. When used as a comparator,
 * his should sort a list of ranges in ascending order by lower bound.
 */
function _replaceVersionPart(part) {
  return typeof part === 'string' ? 0 : part;
}
function sortVersions(a, b) {
  if (a.major !== b.major) {
    return _replaceVersionPart(a.major) - _replaceVersionPart(b.major);
  } else if (a.minor !== b.minor) {
    return _replaceVersionPart(a.minor) - _replaceVersionPart(b.minor);
  } else if (a.patch !== b.patch) {
    return _replaceVersionPart(a.patch) - _replaceVersionPart(b.patch);
  }
  return 0;
};

/**
 * Given a version range, returns the max version satisfying the range.
 */
function maxSat(ver) {
  if (ver.range === '>=') {
    // TODO: ensure that if ver.upperBound exists, it is "greater than" ver
    return ver.upperBound;
  };
  return ver;
}

/**
 * Given a version range, returns the min version satisfying the range.
 */
function minSat(ver) {
  if (ver.range === '<=') {
    // TODO: ensure that if ver.upperBound exists, it is "lesser than" ver
    return ver.upperBound;
  };
  return ver;
}

/**
 * Given two version ranges a and b, determine whether a is before b.
 */
function lt(n1, n2) {
  if (typeof n1 === 'string' || typeof n2 === 'string') return false;
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
 * Given a version range, returns if the range is satisfiable.
 */
function isSatVersion(ver) {
  var upperBound = ver.upperBound;
  if (upperBound) {
    if (upperBound.range === '>=' && ver.range !== '>=') {
      return !before(ver, upperBound);
    }
    if (upperBound.range === '<=' && ver.range !== '<=') {
      return !before(upperBound, ver);
    }
    return true;
  }
  return true;
}

/**
 * Given an array of versions, returns whether they are mutually disjoint.
 */
function _disjointVersionsAll(vers, len, i) {
  if (i + 1 >= len) return true;
  for (var j = i + 1; j < len; j++) {
    if (!disjointVersions(vers[i], vers[j])) return false;
  }
  return _disjointVersionsAll(vers, len, i + 1);
}
function disjointVersionsAll(vers) {
  return _disjointVersionsAll(vers, vers.length, 0);
};

function getRangeLowerBound(rangeStr) {
  var range = new semver.Range(rangeStr);
  return range.set[0][0].semver.version;
};

// TODO: This has some egregious duplication with
//       libDef.getLocalLibDefFlowVersions(). Need to better consolidate logic
var VER = 'v([0-9]+)\.([0-9]+|x)\.([0-9]+|x)';
var VERSION_RE = new RegExp("^([><]=?)?" + VER + "(_([><]=?)" + VER + ")?$");
function stringToVersion(verStr) {
  var versionParts = verStr.match(VERSION_RE);
  if (versionParts == null) {
    throw new Error(verStr + " is a malformed version string. Expected a version formatted " + "as `" + VERSION_RE.toString() + "`");
  }

  var _versionParts = _slicedToArray(versionParts, 10),
      _1 = _versionParts[0],
      range = _versionParts[1],
      major = _versionParts[2],
      minor = _versionParts[3],
      patch = _versionParts[4],
      _2 = _versionParts[5],
      upperRange = _versionParts[6],
      upperMajor = _versionParts[7],
      upperMinor = _versionParts[8],
      upperPatch = _versionParts[9];

  if (range != null && range !== ">=" && range !== "<=") {
    throw new Error("'" + verStr + "': Invalid version range: " + range);
  }
  if (upperRange != null && upperRange !== ">=" && upperRange !== "<=") {
    throw new Error("'" + verStr + "': Invalid version upper-bound range: " + upperRange);
  }

  major = _validateVersionNumberPart(verStr, "major", major);
  if (minor !== "x") {
    minor = _validateVersionNumberPart(verStr, "minor", minor);
  }
  if (patch !== "x") {
    patch = _validateVersionNumberPart(verStr, "patch", patch);
  }

  var upperBound = void 0;
  if (upperMajor) {
    upperMajor = _validateVersionNumberPart(verStr, "upper-bound major", upperMajor);
    if (upperMinor !== "x") {
      upperMinor = _validateVersionNumberPart(verStr, "upper-bound minor", upperMinor);
    }
    if (upperPatch !== "x") {
      upperPatch = _validateVersionNumberPart(verStr, "upper-bound patch", upperPatch);
    }
    upperBound = {
      range: upperRange,
      major: upperMajor,
      minor: upperMinor,
      patch: upperPatch
    };
  }

  if (range === '<=' && major === minor === patch === 0) {
    throw new Error("It doesn't make sense to have a version range of '<=v0.0.0'!");
  }

  return { range: range, major: major, minor: minor, patch: patch, upperBound: upperBound };
};

function versionToString(ver) {
  var rangeStr = ver.range ? ver.range : '';
  var upperBoundStr = ver.upperBound ? "_" + versionToString(ver.upperBound) : '';
  return rangeStr + "v" + ver.major + "." + ver.minor + "." + ver.patch + upperBoundStr;
};

function _validateVersionNumberPart(context, partName, part) {
  var num = parseInt(part, 10);
  if (String(num) !== part) {
    throw new Error(context + ": Invalid " + partName + " number. Expected a number.");
  }
  return num;
}

/**
 * Just like semver.satisfies(), except it handles simple wildcard + range
 * operators in the "version" operand.
 *
 * Note that this is a quick and basic version that could probably be optimized
 * for common cases -- but will worry about that later.
 */
function wildcardSatisfies(ver, range) {
  if (ver.major === 'x' && ver.minor === 'x' && ver.patch === 'x') {
    return true;
  } else if (ver.major === 'x') {
    var verCopy = copyVersion(ver);
    for (var i = 0; i <= 9; i++) {
      verCopy.major = i;
      if (wildcardSatisfies(verCopy, range)) {
        return true;
      }
    }
    return false;
  } else if (ver.minor === 'x') {
    var _verCopy = copyVersion(ver);
    for (var _i = 0; _i <= 9; _i++) {
      _verCopy.minor = _i;
      if (wildcardSatisfies(_verCopy, range)) {
        return true;
      }
    }
    return false;
  } else if (ver.patch === 'x') {
    var _verCopy2 = copyVersion(ver);
    for (var _i2 = 0; _i2 <= 9; _i2++) {
      _verCopy2.patch = _i2;
      if (wildcardSatisfies(_verCopy2, range)) {
        return true;
      }
    }
    return false;
  } else {
    return semver.satisfies(versionToString(ver), range);
  }
};
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.getSignedCodeVersion = getSignedCodeVersion;
exports.signCode = signCode;
exports.signCodeStream = signCodeStream;
exports.verifySignedCode = verifySignedCode;

var _md = require("md5");

var _md2 = _interopRequireDefault(_md);

var _through = require("through");

var _through2 = _interopRequireDefault(_through);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var VERSION_COMMENT_RE = /\/\/ flow-typed version: (.*)$/;
function getSignedCodeVersion(signedCode) {
  var _signedCode$split = signedCode.split('\n'),
      _signedCode$split2 = _slicedToArray(_signedCode$split, 2),
      _ = _signedCode$split2[0],
      versionComment = _signedCode$split2[1];

  var versionMatches = versionComment.trim().match(VERSION_COMMENT_RE);
  if (versionMatches == null) {
    return null;
  }
  return versionMatches[1];
};

function signCode(code, version) {
  var versionedCode = "// flow-typed version: " + version + "\n\n" + code;
  var hash = (0, _md2.default)(versionedCode);
  return "// flow-typed signature: " + hash + "\n" + versionedCode;
};

function signCodeStream(version) {
  var code = '';
  return (0, _through2.default)(function write(data) {
    code += data;
  }, function end() {
    this.emit('data', signCode(code, version));
    this.emit('close');
  });
};

var HASH_COMMENT_RE = /\/\/ flow-typed signature: (.*)$/;
function verifySignedCode(signedCode) {
  var signedCodeLines = signedCode.split('\n');

  var _signedCodeLines = _slicedToArray(signedCodeLines, 1),
      hashComment = _signedCodeLines[0];

  var hashMatches = hashComment.trim().match(HASH_COMMENT_RE);
  if (hashMatches == null) {
    return false;
  }

  var _hashMatches = _slicedToArray(hashMatches, 2),
      _ = _hashMatches[0],
      hash = _hashMatches[1];

  var versionedCode = signedCodeLines.slice(1).join('\n');
  return (0, _md2.default)(versionedCode) === hash;
};
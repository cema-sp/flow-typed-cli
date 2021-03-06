"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._REMOTE_REPO_URL = exports._LAST_UPDATED_FILE = exports.updateCacheRepo = exports._ensureCacheRepo = exports._CACHE_REPO_GIT_DIR = exports._CACHE_REPO_EXPIRY = exports._CACHE_REPO_DIR = exports._cacheRepoAssure = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.getLibDefs = getLibDefs;
exports.getLocalLibDefs = getLocalLibDefs;
exports.getCacheLibDefs = getCacheLibDefs;
exports.getCacheLibDefVersion = getCacheLibDefVersion;
exports.filterLibDefs = filterLibDefs;

var _semver = require("semver");

var _semver2 = _interopRequireDefault(_semver);

var _git = require("./git.js");

var _fileUtils = require("./fileUtils.js");

var _node = require("./node.js");

var _semver3 = require("./semver.js");

var _flowVersion2 = require("./flowVersion.js");

var _validationErrors = require("./validationErrors");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var P = Promise;

var CACHE_DIR = _node.path.join(_node.os.homedir(), '.flow-typed');
var CACHE_REPO_DIR = _node.path.join(CACHE_DIR, 'repo');
var GIT_REPO_DIR = _node.path.join(__dirname, '..', '..', '..');

var REMOTE_REPO_URL = 'http://github.com/flowtype/flow-typed.git';
var LAST_UPDATED_FILE = _node.path.join(CACHE_DIR, 'lastUpdated');

function cloneCacheRepo(verbose) {
  return regeneratorRuntime.async(function cloneCacheRepo$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap((0, _fileUtils.mkdirp)(CACHE_REPO_DIR));

        case 2:
          _context.prev = 2;
          _context.next = 5;
          return regeneratorRuntime.awrap((0, _git.cloneInto)(REMOTE_REPO_URL, CACHE_REPO_DIR));

        case 5:
          _context.next = 11;
          break;

        case 7:
          _context.prev = 7;
          _context.t0 = _context["catch"](2);

          writeVerbose(verbose, 'ERROR: Unable to clone the local cache repo.');
          throw _context.t0;

        case 11:
          _context.next = 13;
          return regeneratorRuntime.awrap(_node.fs.writeFile(LAST_UPDATED_FILE, String(Date.now())));

        case 13:
        case "end":
          return _context.stop();
      }
    }
  }, null, this, [[2, 7]]);
}

var CACHE_REPO_GIT_DIR = _node.path.join(CACHE_REPO_DIR, '.git');
function rebaseCacheRepo(verbose) {
  return regeneratorRuntime.async(function rebaseCacheRepo$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(_node.fs.exists(CACHE_REPO_DIR));

        case 2:
          _context2.t0 = _context2.sent;

          if (!_context2.t0) {
            _context2.next = 7;
            break;
          }

          _context2.next = 6;
          return regeneratorRuntime.awrap(_node.fs.exists(CACHE_REPO_GIT_DIR));

        case 6:
          _context2.t0 = _context2.sent;

        case 7:
          if (!_context2.t0) {
            _context2.next = 22;
            break;
          }

          _context2.prev = 8;
          _context2.next = 11;
          return regeneratorRuntime.awrap((0, _git.rebaseRepoMaster)(CACHE_REPO_DIR));

        case 11:
          _context2.next = 17;
          break;

        case 13:
          _context2.prev = 13;
          _context2.t1 = _context2["catch"](8);

          writeVerbose(verbose, 'ERROR: Unable to rebase the local cache repo. ' + _context2.t1.message);
          return _context2.abrupt("return", false);

        case 17:
          _context2.next = 19;
          return regeneratorRuntime.awrap(_node.fs.writeFile(LAST_UPDATED_FILE, String(Date.now())));

        case 19:
          return _context2.abrupt("return", true);

        case 22:
          _context2.next = 24;
          return regeneratorRuntime.awrap(cloneCacheRepo(verbose));

        case 24:
          return _context2.abrupt("return", true);

        case 25:
        case "end":
          return _context2.stop();
      }
    }
  }, null, this, [[8, 13]]);
}

/**
 * Utility wrapper for ensureCacheRepo with an update expiry of 0 hours.
 */
function updateCacheRepo(verbose) {
  return regeneratorRuntime.async(function updateCacheRepo$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return regeneratorRuntime.awrap(ensureCacheRepo(verbose, 0));

        case 2:
          return _context3.abrupt("return", _context3.sent);

        case 3:
        case "end":
          return _context3.stop();
      }
    }
  }, null, this);
}

/**
 * Ensure that the CACHE_REPO_DIR exists and is recently rebased.
 * (else: create/rebase it)
 */
var CACHE_REPO_EXPIRY = 1000 * 60; // 1 minute
var _cacheRepoAssure = exports._cacheRepoAssure = {
  lastAssured: 0,
  pendingAssure: Promise.resolve()
};
function ensureCacheRepo(verbose) {
  var cacheRepoExpiry = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : CACHE_REPO_EXPIRY;
  var prevAssure;
  return regeneratorRuntime.async(function ensureCacheRepo$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          if (!(_cacheRepoAssure.lastAssured + 5 * 1000 * 60 >= Date.now())) {
            _context5.next = 2;
            break;
          }

          return _context5.abrupt("return", _cacheRepoAssure.pendingAssure);

        case 2:

          _cacheRepoAssure.lastAssured = Date.now();
          prevAssure = _cacheRepoAssure.pendingAssure;
          return _context5.abrupt("return", _cacheRepoAssure.pendingAssure = prevAssure.then(function () {
            return function _callee() {
              var repoDirExists, repoGitDirExists, lastUpdated, lastUpdatedRaw, lastUpdatedNum, rebaseSuccessful;
              return regeneratorRuntime.async(function _callee$(_context4) {
                while (1) {
                  switch (_context4.prev = _context4.next) {
                    case 0:
                      repoDirExists = _node.fs.exists(CACHE_REPO_DIR);
                      repoGitDirExists = _node.fs.exists(CACHE_REPO_GIT_DIR);
                      _context4.next = 4;
                      return regeneratorRuntime.awrap(repoDirExists);

                    case 4:
                      _context4.t0 = !_context4.sent;

                      if (_context4.t0) {
                        _context4.next = 9;
                        break;
                      }

                      _context4.next = 8;
                      return regeneratorRuntime.awrap(repoGitDirExists);

                    case 8:
                      _context4.t0 = !_context4.sent;

                    case 9:
                      if (!_context4.t0) {
                        _context4.next = 16;
                        break;
                      }

                      writeVerbose(verbose, '• flow-typed cache not found, fetching from GitHub...', false);
                      _context4.next = 13;
                      return regeneratorRuntime.awrap(cloneCacheRepo(verbose));

                    case 13:
                      writeVerbose(verbose, 'done.');
                      _context4.next = 31;
                      break;

                    case 16:
                      lastUpdated = 0;
                      _context4.next = 19;
                      return regeneratorRuntime.awrap(_node.fs.exists(LAST_UPDATED_FILE));

                    case 19:
                      if (!_context4.sent) {
                        _context4.next = 25;
                        break;
                      }

                      _context4.next = 22;
                      return regeneratorRuntime.awrap(_node.fs.readFile(LAST_UPDATED_FILE));

                    case 22:
                      lastUpdatedRaw = _context4.sent;
                      lastUpdatedNum = parseInt(lastUpdatedRaw, 10);

                      if (String(lastUpdatedNum) === String(lastUpdatedRaw)) {
                        lastUpdated = lastUpdatedNum;
                      }

                    case 25:
                      if (!(lastUpdated + cacheRepoExpiry < Date.now())) {
                        _context4.next = 31;
                        break;
                      }

                      writeVerbose(verbose, '• rebasing flow-typed cache...', false);
                      _context4.next = 29;
                      return regeneratorRuntime.awrap(rebaseCacheRepo(verbose));

                    case 29:
                      rebaseSuccessful = _context4.sent;

                      if (rebaseSuccessful) {
                        writeVerbose(verbose, 'done.');
                      } else {
                        writeVerbose(verbose, '\nNOTE: Unable to rebase local cache! If you don\'t currently ' + 'have internet connectivity, no worries -- we\'ll update the ' + 'local cache the next time you do.\n');
                      }

                    case 31:
                    case "end":
                      return _context4.stop();
                  }
                }
              }, null, this);
            }();
          }));

        case 5:
        case "end":
          return _context5.stop();
      }
    }
  }, null, this);
}
// Exported for tests -- since we really want this part well-tested.
exports._CACHE_REPO_DIR = CACHE_REPO_DIR;
exports._CACHE_REPO_EXPIRY = CACHE_REPO_EXPIRY;
exports._CACHE_REPO_GIT_DIR = CACHE_REPO_GIT_DIR;
exports._ensureCacheRepo = ensureCacheRepo;
exports.updateCacheRepo = updateCacheRepo;
exports._LAST_UPDATED_FILE = LAST_UPDATED_FILE;
exports._REMOTE_REPO_URL = REMOTE_REPO_URL;


function addLibDefs(pkgDirPath, libDefs, validationErrs) {
  var parsedDirItem;
  return regeneratorRuntime.async(function addLibDefs$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          parsedDirItem = parseRepoDirItem(pkgDirPath, validationErrs);
          _context6.next = 3;
          return regeneratorRuntime.awrap(parseLibDefsFromPkgDir(parsedDirItem, pkgDirPath, validationErrs));

        case 3:
          _context6.t0 = function (libDef) {
            return libDefs.push(libDef);
          };

          _context6.sent.forEach(_context6.t0);

        case 5:
        case "end":
          return _context6.stop();
      }
    }
  }, null, this);
}

/**
 * Given a 'definitions/npm' dir, return a list of LibDefs that it contains.
 */
function getLibDefs(defsDir, validationErrs) {
  var _this = this;

  var libDefs, defsDirItems;
  return regeneratorRuntime.async(function getLibDefs$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          libDefs = [];
          _context10.next = 3;
          return regeneratorRuntime.awrap(_node.fs.readdir(defsDir));

        case 3:
          defsDirItems = _context10.sent;
          _context10.next = 6;
          return regeneratorRuntime.awrap(P.all(defsDirItems.map(function _callee4(item) {
            var itemPath, itemStat, error;
            return regeneratorRuntime.async(function _callee4$(_context9) {
              while (1) {
                switch (_context9.prev = _context9.next) {
                  case 0:
                    if (!(item === '.cli-metadata.json')) {
                      _context9.next = 2;
                      break;
                    }

                    return _context9.abrupt("return");

                  case 2:
                    itemPath = _node.path.join(defsDir, item);
                    _context9.next = 5;
                    return regeneratorRuntime.awrap(_node.fs.stat(itemPath));

                  case 5:
                    itemStat = _context9.sent;

                    if (!itemStat.isDirectory()) {
                      _context9.next = 16;
                      break;
                    }

                    if (!(item.charAt(0) === '@')) {
                      _context9.next = 12;
                      break;
                    }

                    _context9.next = 10;
                    return regeneratorRuntime.awrap(function _callee3() {
                      var scope, defsDirItems;
                      return regeneratorRuntime.async(function _callee3$(_context8) {
                        while (1) {
                          switch (_context8.prev = _context8.next) {
                            case 0:
                              // directory is of the form '@<scope>', so go one level deeper
                              scope = item;
                              _context8.next = 3;
                              return regeneratorRuntime.awrap(_node.fs.readdir(itemPath));

                            case 3:
                              defsDirItems = _context8.sent;
                              _context8.next = 6;
                              return regeneratorRuntime.awrap(P.all(defsDirItems.map(function _callee2(item) {
                                var itemPath, itemStat, error;
                                return regeneratorRuntime.async(function _callee2$(_context7) {
                                  while (1) {
                                    switch (_context7.prev = _context7.next) {
                                      case 0:
                                        itemPath = _node.path.join(defsDir, scope, item);
                                        _context7.next = 3;
                                        return regeneratorRuntime.awrap(_node.fs.stat(itemPath));

                                      case 3:
                                        itemStat = _context7.sent;

                                        if (!itemStat.isDirectory()) {
                                          _context7.next = 9;
                                          break;
                                        }

                                        _context7.next = 7;
                                        return regeneratorRuntime.awrap(addLibDefs(itemPath, libDefs, validationErrs));

                                      case 7:
                                        _context7.next = 11;
                                        break;

                                      case 9:
                                        error = "Expected only directories in the 'definitions/npm/@<scope>' directory!";

                                        (0, _validationErrors.validationError)(itemPath, error, validationErrs);

                                      case 11:
                                      case "end":
                                        return _context7.stop();
                                    }
                                  }
                                }, null, _this);
                              })));

                            case 6:
                            case "end":
                              return _context8.stop();
                          }
                        }
                      }, null, _this);
                    }());

                  case 10:
                    _context9.next = 14;
                    break;

                  case 12:
                    _context9.next = 14;
                    return regeneratorRuntime.awrap(addLibDefs(itemPath, libDefs, validationErrs));

                  case 14:
                    _context9.next = 18;
                    break;

                  case 16:
                    error = "Expected only directories in the 'definitions/npm' directory!";

                    (0, _validationErrors.validationError)(itemPath, error, validationErrs);

                  case 18:
                  case "end":
                    return _context9.stop();
                }
              }
            }, null, _this);
          })));

        case 6:
          return _context10.abrupt("return", libDefs);

        case 7:
        case "end":
          return _context10.stop();
      }
    }
  }, null, this);
};

function parsePkgFlowDirVersion(pkgFlowDirPath, validationErrs) {
  var pkgFlowDirName = _node.path.basename(pkgFlowDirPath);
  return (0, _flowVersion2.parseDirString)(pkgFlowDirName, validationErrs);
}

/**
 * Given a parsed package name and version and a path to the package directory
 * on disk, scan the directory and generate a list of LibDefs for each
 * flow-versioned definition file.
 */
function parseLibDefsFromPkgDir(_ref, pkgDirPath, validationErrs) {
  var pkgName = _ref.pkgName,
      pkgVersion = _ref.pkgVersion;

  var _this2 = this;

  var repoPath, pkgVersionStr, pkgDirItems, commonTestFiles, flowDirs, libDefs;
  return regeneratorRuntime.async(function parseLibDefsFromPkgDir$(_context12) {
    while (1) {
      switch (_context12.prev = _context12.next) {
        case 0:
          repoPath = _node.path.relative(pkgDirPath, '..');
          pkgVersionStr = (0, _semver3.versionToString)(pkgVersion);
          _context12.next = 4;
          return regeneratorRuntime.awrap(_node.fs.readdir(pkgDirPath));

        case 4:
          pkgDirItems = _context12.sent;
          commonTestFiles = [];
          flowDirs = [];

          pkgDirItems.forEach(function (pkgDirItem) {
            var pkgDirItemPath = _node.path.join(pkgDirPath, pkgDirItem);
            var pkgDirItemContext = _node.path.relative(repoPath, pkgDirItemPath);

            var pkgDirItemStat = _node.fs.statSync(pkgDirItemPath);
            if (pkgDirItemStat.isFile()) {
              if (_node.path.extname(pkgDirItem) === '.swp') {
                return;
              }

              var isValidTestFile = validateTestFile(pkgDirItemPath, pkgDirItemContext, validationErrs);

              if (isValidTestFile) {
                commonTestFiles.push(pkgDirItemPath);
              }
            } else if (pkgDirItemStat.isDirectory()) {
              flowDirs.push([pkgDirItemPath, parsePkgFlowDirVersion(pkgDirItemPath, validationErrs)]);
            } else {
              var error = 'Unexpected directory item';
              (0, _validationErrors.validationError)(pkgDirItemContext, error, validationErrs);
            }
          });

          if (!(0, _flowVersion2.disjointVersionsAll)(flowDirs.map(function (_ref2) {
            var _ref3 = _slicedToArray(_ref2, 2),
                _ = _ref3[0],
                ver = _ref3[1];

            return ver;
          }))) {
            (0, _validationErrors.validationError)(pkgDirPath, 'Flow versions not disjoint!', validationErrs);
          }

          if (flowDirs.length === 0) {
            (0, _validationErrors.validationError)(pkgDirPath, 'No libdef files found!', validationErrs);
          }

          libDefs = [];
          _context12.next = 13;
          return regeneratorRuntime.awrap(P.all(flowDirs.map(function _callee5(_ref4) {
            var _ref5 = _slicedToArray(_ref4, 2),
                flowDirPath = _ref5[0],
                flowVersion = _ref5[1];

            var testFilePaths, basePkgName, libDefFileName, libDefFilePath, error;
            return regeneratorRuntime.async(function _callee5$(_context11) {
              while (1) {
                switch (_context11.prev = _context11.next) {
                  case 0:
                    testFilePaths = [].concat(commonTestFiles);
                    basePkgName = pkgName.charAt(0) === '@' ? pkgName.split(_node.path.sep).pop() : pkgName;
                    libDefFileName = basePkgName + "_" + pkgVersionStr + ".js";
                    libDefFilePath = void 0;
                    _context11.next = 6;
                    return regeneratorRuntime.awrap(_node.fs.readdir(flowDirPath));

                  case 6:
                    _context11.t0 = function (flowDirItem) {
                      var flowDirItemPath = _node.path.join(flowDirPath, flowDirItem);
                      var flowDirItemContext = _node.path.relative(repoPath, flowDirItemPath);
                      var flowDirItemStat = _node.fs.statSync(flowDirItemPath);
                      if (flowDirItemStat.isFile()) {
                        // If we couldn't discern the package name, we've already recorded an
                        // error for that -- so try to avoid spurious downstream errors.
                        if (pkgName === 'ERROR') {
                          return;
                        }

                        if (_node.path.extname(flowDirItem) === '.swp') {
                          return;
                        }

                        if (flowDirItem === libDefFileName) {
                          libDefFilePath = _node.path.join(flowDirPath, flowDirItem);
                          return;
                        }

                        var isValidTestFile = validateTestFile(flowDirItemPath, flowDirItemContext, validationErrs);

                        if (isValidTestFile) {
                          testFilePaths.push(flowDirItemPath);
                        }
                      } else {
                        var error = 'Unexpected directory item';
                        (0, _validationErrors.validationError)(flowDirItemContext, error, validationErrs);
                      }
                    };

                    _context11.sent.forEach(_context11.t0);

                    if (!(libDefFilePath == null)) {
                      _context11.next = 12;
                      break;
                    }

                    libDefFilePath = _node.path.join(flowDirPath, libDefFileName);
                    if (pkgName !== 'ERROR') {
                      error = 'No libdef file found!';

                      (0, _validationErrors.validationError)(flowDirPath, error, validationErrs);
                    }
                    return _context11.abrupt("return");

                  case 12:

                    libDefs.push({
                      pkgName: pkgName,
                      pkgVersionStr: pkgVersionStr,
                      flowVersion: flowVersion,
                      flowVersionStr: (0, _flowVersion2.toDirString)(flowVersion),
                      path: libDefFilePath,
                      testFilePaths: testFilePaths
                    });

                  case 13:
                  case "end":
                    return _context11.stop();
                }
              }
            }, null, _this2);
          })));

        case 13:
          return _context12.abrupt("return", libDefs);

        case 14:
        case "end":
          return _context12.stop();
      }
    }
  }, null, this);
}

/**
 * Given the path to a directory item in the 'definitions' directory, parse the
 * directory's name into a package name and version.
 */
var REPO_DIR_ITEM_NAME_RE = /^(.*)_v([0-9]+)\.([0-9]+|x)\.([0-9]+|x)(-.*)?$/;
function parseRepoDirItem(dirItemPath, validationErrs) {
  var dirItem = _node.path.basename(dirItemPath);
  var itemMatches = dirItem.match(REPO_DIR_ITEM_NAME_RE);
  if (itemMatches == null) {
    var error = "'" + dirItem + "' is a malformed definitions/npm/ directory name! " + "Expected the name to be formatted as <PKGNAME>_v<MAJOR>.<MINOR>.<PATCH>";
    (0, _validationErrors.validationError)(dirItem, error, validationErrs);
    var _pkgName = 'ERROR';
    var pkgVersion = (0, _semver3.emptyVersion)();
    return { pkgName: _pkgName, pkgVersion: pkgVersion };
  }

  var _itemMatches = _slicedToArray(itemMatches, 6),
      _ = _itemMatches[0],
      pkgName = _itemMatches[1],
      major = _itemMatches[2],
      minor = _itemMatches[3],
      patch = _itemMatches[4],
      prerel = _itemMatches[5];

  var item = _node.path.dirname(dirItemPath).split(_node.path.sep).pop();
  if (item.charAt(0) === '@') {
    pkgName = "" + item + _node.path.sep + pkgName;
  }
  major = validateVersionNumPart(major, "major", dirItemPath, validationErrs);
  minor = validateVersionPart(minor, "minor", dirItemPath, validationErrs);
  patch = validateVersionPart(patch, "patch", dirItemPath, validationErrs);

  if (prerel != null) {
    prerel = prerel.substr(1);
  }

  return { pkgName: pkgName, pkgVersion: { major: major, minor: minor, patch: patch, prerel: prerel } };
}

/**
 * Given a path to an assumed test file, ensure that it is named as expected.
 */
var TEST_FILE_NAME_RE = /^test_.*\.js$/;
function validateTestFile(testFilePath, context, validationErrs) {
  var testFileName = _node.path.basename(testFilePath);
  if (!TEST_FILE_NAME_RE.test(testFileName)) {
    var error = "Malformed test file name! Test files must be formatted as test_(.*).js: " + testFileName;
    (0, _validationErrors.validationError)(context, error, validationErrs);
    return false;
  }
  return true;
}

/**
 * Given a number-only part of a version string (i.e. the `major` part), parse
 * the string into a number.
 */
function validateVersionNumPart(part, partName, context, validationErrs) {
  var num = parseInt(part, 10);
  if (String(num) !== part) {
    var error = "'" + context + "': Invalid " + partName + " number: '" + part + "'. Expected a number.";
    (0, _validationErrors.validationError)(context, error, validationErrs);
  }
  return num;
}

/**
 * Given a number-or-wildcard part of a version string (i.e. a `minor` or
 * `patch` part), parse the string into either a number or 'x'.
 */
function validateVersionPart(part, partName, context, validationErrs) {
  if (part === "x") {
    return part;
  }
  return validateVersionNumPart(part, partName, context, validationErrs);
}

/**
 * Given a path to a 'definitions' dir, assert that the currently-running
 * version of the CLI is compatible with the repo.
 */
function verifyCLIVersion(defsDirPath) {
  var metadataFilePath, metadata, minCLIVersion, thisCLIVersion;
  return regeneratorRuntime.async(function verifyCLIVersion$(_context13) {
    while (1) {
      switch (_context13.prev = _context13.next) {
        case 0:
          metadataFilePath = _node.path.join(defsDirPath, '.cli-metadata.json');
          _context13.t0 = JSON;
          _context13.t1 = String;
          _context13.next = 5;
          return regeneratorRuntime.awrap(_node.fs.readFile(metadataFilePath));

        case 5:
          _context13.t2 = _context13.sent;
          _context13.t3 = (0, _context13.t1)(_context13.t2);
          metadata = _context13.t0.parse.call(_context13.t0, _context13.t3);

          if (metadata.compatibleCLIRange) {
            _context13.next = 10;
            break;
          }

          throw new Error("Unable to find the 'compatibleCLIRange' property in " + (metadataFilePath + ". You might need to update to a newer version of ") + "the Flow CLI.");

        case 10:
          minCLIVersion = metadata.compatibleCLIRange;
          thisCLIVersion = require('../../package.json').version;

          if (_semver2.default.satisfies(thisCLIVersion, minCLIVersion)) {
            _context13.next = 14;
            break;
          }

          throw new Error("Please upgrade your CLI version! This CLI is version " + (thisCLIVersion + ", but the latest flow-typed definitions are only ") + ("compatible with flow-typed@" + minCLIVersion));

        case 14:
        case "end":
          return _context13.stop();
      }
    }
  }, null, this);
}

/**
 * Helper function to write verbose output only when an output stream was
 * provided.
 */

function writeVerbose(stream, msg) {
  var writeNewline = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

  if (stream != null) {
    stream.write(msg + (writeNewline ? '\n' : ''));
  }
}

/**
 * Get a list of LibDefs from the local repo.
 *
 * Note that this is mainly only useful while working on the flow-typed repo
 * itself. It is useless when running the npm-install CLI.
 */
var GIT_REPO_DEFS_DIR = _node.path.join(GIT_REPO_DIR, 'definitions', 'npm');
function getLocalLibDefs(validationErrs) {
  return regeneratorRuntime.async(function getLocalLibDefs$(_context14) {
    while (1) {
      switch (_context14.prev = _context14.next) {
        case 0:
          _context14.next = 2;
          return regeneratorRuntime.awrap(verifyCLIVersion(_node.path.join(GIT_REPO_DIR, 'definitions')));

        case 2:
          return _context14.abrupt("return", getLibDefs(GIT_REPO_DEFS_DIR, validationErrs));

        case 3:
        case "end":
          return _context14.stop();
      }
    }
  }, null, this);
};

/**
 * Get a list of LibDefs from the flow-typed cache repo checkout.
 *
 * If the repo checkout does not exist or is out of date, it will be
 * created/updated automatically first.
 */
var CACHE_REPO_DEFS_DIR = _node.path.join(CACHE_REPO_DIR, 'definitions', 'npm');
function getCacheLibDefs() {
  var verbose = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : process.stdout;
  var validationErrs = arguments[1];
  return regeneratorRuntime.async(function getCacheLibDefs$(_context15) {
    while (1) {
      switch (_context15.prev = _context15.next) {
        case 0:
          _context15.next = 2;
          return regeneratorRuntime.awrap(ensureCacheRepo(verbose));

        case 2:
          _context15.next = 4;
          return regeneratorRuntime.awrap(verifyCLIVersion(_node.path.join(CACHE_REPO_DIR, 'definitions')));

        case 4:
          return _context15.abrupt("return", getLibDefs(CACHE_REPO_DEFS_DIR, validationErrs));

        case 5:
        case "end":
          return _context15.stop();
      }
    }
  }, null, this);
};

function getCacheLibDefVersion(libDef) {
  var latestCommitHash;
  return regeneratorRuntime.async(function getCacheLibDefVersion$(_context16) {
    while (1) {
      switch (_context16.prev = _context16.next) {
        case 0:
          _context16.next = 2;
          return regeneratorRuntime.awrap(ensureCacheRepo());

        case 2:
          _context16.next = 4;
          return regeneratorRuntime.awrap(verifyCLIVersion(_node.path.join(CACHE_REPO_DIR, 'definitions')));

        case 4:
          _context16.next = 6;
          return regeneratorRuntime.awrap((0, _git.findLatestFileCommitHash)(CACHE_REPO_DIR, _node.path.relative(CACHE_REPO_DIR, libDef.path)));

        case 6:
          latestCommitHash = _context16.sent;
          return _context16.abrupt("return", latestCommitHash.substr(0, 10) + "/" + (libDef.pkgName + "_" + libDef.pkgVersionStr + "/") + ("flow_" + libDef.flowVersionStr));

        case 8:
        case "end":
          return _context16.stop();
      }
    }
  }, null, this);
};

function packageNameMatch(a, b) {
  return a.toLowerCase() === b.toLowerCase();
}

function libdefMatchesPackageVersion(pkgSemver, defVersionRaw) {
  // The libdef version should be treated as a semver prefixed by a carat
  // (i.e: "foo_v2.2.x" is the same range as "^2.2.x")
  // UNLESS it is prefixed by the equals character (i.e. "foo_=v2.2.x")
  var defVersion = defVersionRaw;
  if (defVersionRaw[0] !== '=' && defVersionRaw[0] !== '^') {
    defVersion = '^' + defVersionRaw;
  }

  if (_semver2.default.valid(pkgSemver)) {
    // test the single package version against the libdef range
    return _semver2.default.satisfies(pkgSemver, defVersion);
  }

  if (_semver2.default.valid(defVersion)) {
    // test the single defVersion agains the package range
    return _semver2.default.satisfies(defVersion, pkgSemver);
  }

  var pkgRange = new _semver2.default.Range(pkgSemver);
  var defRange = new _semver2.default.Range(defVersion);

  if (defRange.set[0].length !== 2) {
    throw Error("Invalid libDef version, It appears to be a non-contiguous range.");
  }

  var defLowerB = defRange.set[0][0].semver.version;
  var defUpperB = defRange.set[0][1].semver.version;

  if (_semver2.default.gtr(defLowerB, pkgSemver) || _semver2.default.ltr(defUpperB, pkgSemver)) {
    return false;
  }

  var pkgLowerB = pkgRange.set[0][0].semver.version;
  return defRange.test(pkgLowerB);
}

/**
 * Filter a given list of LibDefs down using a specified filter.
 */
function filterLibDefs(defs, filter) {
  return defs.filter(function (def) {
    var filterMatch = false;
    switch (filter.type) {
      case 'exact':
        if (packageNameMatch(def.pkgName, filter.pkgName)) {
          try {
            filterMatch = libdefMatchesPackageVersion(filter.pkgVersionStr, def.pkgVersionStr);
          } catch (error) {
            if (error.message.indexOf('Invalid comparator') > -1) {
              console.error("\u2022 Unprocessible version of '" + filter.pkgName + "' " + ("in package.json: '" + filter.pkgVersionStr + "'."));
            } else {
              throw error;
            }
          }
        }
        break;

      case 'exact-name':
        filterMatch = packageNameMatch(def.pkgName, filter.term);
        break;

      case 'fuzzy':
        filterMatch = def.pkgName.toLowerCase().indexOf(filter.term.toLowerCase()) !== -1;
        break;

      default:
        throw new Error("'" + filter.type + "' is an unexpected filter type! This should never " + "happen!");
    }

    if (!filterMatch) {
      return false;
    }

    var filterFlowVerStr = filter.flowVersionStr;
    if (filterFlowVerStr) {
      var _flowVersion = def.flowVersion;

      switch (_flowVersion.kind) {
        case 'all':
          return _semver2.default.satisfies(filterFlowVerStr, def.flowVersionStr);
        case 'specific':
          return _semver2.default.satisfies(filterFlowVerStr, def.flowVersionStr);
        case 'ranged':
          var upper = _flowVersion.upper;

          if (upper) {
            var lowerSpecific = {
              kind: 'ranged',
              upper: null,
              lower: _flowVersion.lower
            };
            var lowerSpecificSemver = (0, _flowVersion2.toSemverString)(lowerSpecific);
            var upperSpecificSemver = (0, _flowVersion2.toSemverString)({
              kind: 'specific',
              ver: upper
            });
            return _semver2.default.satisfies(filterFlowVerStr, lowerSpecificSemver) && _semver2.default.satisfies(filterFlowVerStr, upperSpecificSemver);
          } else {
            return _semver2.default.satisfies(filterFlowVerStr, def.flowVersionStr);
          }

        default:
          _flowVersion;throw new Error('Unexpected FlowVersion kind!');
      }
    }

    return true;
  }).sort(function (a, b) {
    var aZeroed = a.pkgVersionStr.replace(/x/g, '0');
    var bZeroed = b.pkgVersionStr.replace(/x/g, '0');
    return _semver2.default.gt(aZeroed, bZeroed) ? -1 : 1;
  });
};
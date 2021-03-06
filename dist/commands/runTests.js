"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.description = exports.name = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.run = run;

var _node = require("../lib/node.js");

var _fileUtils = require("../lib/fileUtils.js");

var _github = require("../lib/github.js");

var _libDefs = require("../lib/libDefs.js");

var _isInFlowTypedRepo = require("../lib/isInFlowTypedRepo");

var _isInFlowTypedRepo2 = _interopRequireDefault(_isInFlowTypedRepo);

var _flowVersion = require("../lib/flowVersion");

var _request = require("request");

var _request2 = _interopRequireDefault(_request);

var _semver = require("semver");

var semver = _interopRequireWildcard(_semver);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Used to decide which binary to fetch for each version of Flow
var BIN_PLATFORM = function (_) {
  switch (_node.os.type()) {
    case "Linux":
      return "linux64";
    case "Darwin":
      return "osx";
    case "Windows_NT":
      return "win64";

    default:
      throw new Error("Unsupported os.type()! " + _node.os.type());
  }
}();
var PKG_ROOT_DIR = _node.path.join(__dirname, "..", "..");
var TEST_DIR = _node.path.join(PKG_ROOT_DIR, ".test-dir");
var BIN_DIR = _node.path.join(PKG_ROOT_DIR, ".flow-bins-cache");
var P = Promise;

/**
 * Scan the definitions/ directory to extract a flat list of TestGroup
 * structs. Each TestGroup represents a Package/PackageVersion/FlowVersion
 * directory.
 */
function getTestGroups(repoDirPath) {
  var libDefs;
  return regeneratorRuntime.async(function getTestGroups$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap((0, _libDefs.getLibDefs)(repoDirPath));

        case 2:
          libDefs = _context.sent;
          return _context.abrupt("return", libDefs.map(function (libDef) {
            var groupID = libDef.pkgName + "_" + libDef.pkgVersionStr + _node.path.sep + ("" + libDef.flowVersionStr);
            return {
              id: groupID,
              testFilePaths: libDef.testFilePaths,
              libDefPath: libDef.path,
              flowVersion: libDef.flowVersion
            };
          }));

        case 4:
        case "end":
          return _context.stop();
      }
    }
  }, null, this);
}

/**
 * Memoized function that queries the GitHub releases for Flow, downloads the
 * zip for each version, extracts the zip, and moves the binary to
 * TEST_BIN/flow-vXXX for use later when running tests.
 */
var _flowBinVersionPromise = null;
function getOrderedFlowBinVersions() {
  return regeneratorRuntime.async(function getOrderedFlowBinVersions$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          if (_flowBinVersionPromise === null) {
            _flowBinVersionPromise = function _callee2() {
              var _this = this;

              var FLOW_BIN_VERSION_ORDER, GH_CLIENT, QUERY_PAGE_SIZE, OS_ARCH_FILTER_RE, binURLs, apiPayload, page;
              return regeneratorRuntime.async(function _callee2$(_context3) {
                while (1) {
                  switch (_context3.prev = _context3.next) {
                    case 0:
                      console.log("Fetching all Flow binaries...");
                      FLOW_BIN_VERSION_ORDER = [];
                      GH_CLIENT = (0, _github.gitHubClient)();
                      QUERY_PAGE_SIZE = 100;
                      OS_ARCH_FILTER_RE = new RegExp(BIN_PLATFORM);
                      binURLs = new Map();
                      apiPayload = null;
                      page = 0;

                    case 8:
                      if (!(apiPayload === null || apiPayload.length === QUERY_PAGE_SIZE)) {
                        _context3.next = 15;
                        break;
                      }

                      _context3.next = 11;
                      return regeneratorRuntime.awrap(new Promise(function (res, rej) {
                        GH_CLIENT.releases.listReleases({
                          owner: "facebook",
                          repo: "flow",
                          page: page++,
                          per_page: QUERY_PAGE_SIZE
                        }, function (err, result) {
                          if (err) {
                            rej(err);
                          } else {
                            res(result);
                          }
                        });
                      }));

                    case 11:
                      apiPayload = _context3.sent;


                      apiPayload.forEach(function (rel) {
                        // We only test against versions since 0.15.0 because it has proper
                        // [ignore] fixes (which are necessary to run tests)
                        if (semver.lt(rel.tag_name, "0.15.0")) {
                          return;
                        }

                        // Find the binary zip in the list of assets
                        var binZip = rel.assets.filter(function (_ref) {
                          var name = _ref.name;

                          return OS_ARCH_FILTER_RE.test(name) && !/-latest.zip$/.test(name);
                        }).map(function (asset) {
                          return asset.browser_download_url;
                        });

                        if (binZip.length !== 1) {
                          throw new Error("Unexpected number of " + BIN_PLATFORM + " assets for flow-" + rel.tag_name + "! " + JSON.stringify(binZip));
                        } else {
                          var version = rel.tag_name[0] === "v" ? rel.tag_name : "v" + rel.tag_name;

                          FLOW_BIN_VERSION_ORDER.push(version);
                          binURLs.set(version, binZip[0]);
                        }
                      });
                      _context3.next = 8;
                      break;

                    case 15:

                      FLOW_BIN_VERSION_ORDER.sort(function (a, b) {
                        return semver.lt(a, b) ? -1 : 1;
                      });

                      _context3.next = 18;
                      return regeneratorRuntime.awrap(_node.fs.exists(BIN_DIR));

                    case 18:
                      if (_context3.sent) {
                        _context3.next = 21;
                        break;
                      }

                      _context3.next = 21;
                      return regeneratorRuntime.awrap(_node.fs.mkdir(BIN_DIR));

                    case 21:
                      _context3.next = 23;
                      return regeneratorRuntime.awrap(P.all(Array.from(binURLs).map(function _callee(_ref2) {
                        var _ref3 = _slicedToArray(_ref2, 2),
                            version = _ref3[0],
                            binURL = _ref3[1];

                        var zipPath, flowBinDirPath;
                        return regeneratorRuntime.async(function _callee$(_context2) {
                          while (1) {
                            switch (_context2.prev = _context2.next) {
                              case 0:
                                zipPath = _node.path.join(BIN_DIR, "flow-" + version + ".zip");
                                _context2.next = 3;
                                return regeneratorRuntime.awrap(_node.fs.exists(_node.path.join(BIN_DIR, "flow-" + version)));

                              case 3:
                                if (!_context2.sent) {
                                  _context2.next = 5;
                                  break;
                                }

                                return _context2.abrupt("return");

                              case 5:
                                _context2.next = 7;
                                return regeneratorRuntime.awrap(new Promise(function (res, rej) {
                                  console.log("  Fetching flow-%s...", version);
                                  var fileRequest = (0, _request2.default)({
                                    url: binURL,
                                    headers: {
                                      "User-Agent": "flow-typed Test Runner " + "(github.com/flowtype/flow-typed)"
                                    }
                                  }).on("error", function (err) {
                                    return rej(err);
                                  });;

                                  fileRequest.pipe(_node.fs.createWriteStream(zipPath).on("close", function () {
                                    console.log("    flow-%s finished downloading.", version);
                                    res();
                                  }));
                                }));

                              case 7:

                                // Extract the flow binary
                                flowBinDirPath = _node.path.join(BIN_DIR, "TMP-flow-" + version);
                                _context2.next = 10;
                                return regeneratorRuntime.awrap(_node.fs.mkdir(flowBinDirPath));

                              case 10:
                                console.log("  Extracting flow-%s...", version);
                                _context2.next = 13;
                                return regeneratorRuntime.awrap(new Promise(function (res, rej) {
                                  var child = _node.child_process.exec("unzip " + zipPath + " flow/flow -d " + flowBinDirPath);
                                  var stdErrOut = "";
                                  child.stdout.on("data", function (data) {
                                    return stdErrOut += data;
                                  });
                                  child.stderr.on("data", function (data) {
                                    return stdErrOut += data;
                                  });
                                  child.on("error", function (err) {
                                    return rej(err);
                                  });
                                  child.on("close", function (code) {
                                    if (code === 0) {
                                      res();
                                    } else {
                                      rej(stdErrOut);
                                    }
                                  });
                                }));

                              case 13:
                                _context2.next = 15;
                                return regeneratorRuntime.awrap(_node.fs.rename(_node.path.join(flowBinDirPath, "flow", "flow"), _node.path.join(BIN_DIR, "flow-" + version)));

                              case 15:
                                console.log("  Removing flow-%s artifacts...", version);
                                _context2.next = 18;
                                return regeneratorRuntime.awrap(P.all([(0, _fileUtils.recursiveRmdir)(flowBinDirPath), _node.fs.unlink(zipPath)]));

                              case 18:
                                console.log("    flow-%s complete!", version);

                              case 19:
                              case "end":
                                return _context2.stop();
                            }
                          }
                        }, null, _this);
                      })));

                    case 23:

                      console.log("Finished fetching Flow binaries.\n");

                      return _context3.abrupt("return", FLOW_BIN_VERSION_ORDER);

                    case 25:
                    case "end":
                      return _context3.stop();
                  }
                }
              }, null, this);
            }();
          }
          return _context4.abrupt("return", _flowBinVersionPromise);

        case 2:
        case "end":
          return _context4.stop();
      }
    }
  }, null, this);
}

/**
 * Given a TestGroup structure determine all versions of Flow that match the
 * FlowVersion specification and, for each, run `flow check` on the test
 * directory.
 */
function runTestGroup(testGroup) {
  var _this2 = this;

  var errors = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

  var testDirName, testDirPath, orderedFlowVersions, _ret;

  return regeneratorRuntime.async(function runTestGroup$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          // Some older versions of Flow choke on ">"/"<"/"="
          testDirName = testGroup.id.split(_node.path.sep).join('--').replace(/>/g, "gt").replace(/</g, "lt").replace(/=/g, "eq");
          testDirPath = _node.path.join(TEST_DIR, testDirName);
          _context8.next = 4;
          return regeneratorRuntime.awrap(_node.fs.exists(testDirPath));

        case 4:
          if (!_context8.sent) {
            _context8.next = 6;
            break;
          }

          throw new Error("Trying to run " + testGroup.id + ", but test dir already exists! I'm" + "confused... Bailing out!");

        case 6:
          _context8.next = 8;
          return regeneratorRuntime.awrap(getOrderedFlowBinVersions());

        case 8:
          orderedFlowVersions = _context8.sent;
          _context8.prev = 9;
          _context8.next = 12;
          return regeneratorRuntime.awrap(function _callee5() {
            var destLibDefPath, destFlowConfigPath, flowConfigData, testGrpFlowSemVerRange, flowVersionsToRun, testBatch;
            return regeneratorRuntime.async(function _callee5$(_context7) {
              while (1) {
                switch (_context7.prev = _context7.next) {
                  case 0:
                    _context7.next = 2;
                    return regeneratorRuntime.awrap(_node.fs.mkdir(testDirPath));

                  case 2:

                    // Copy files into the test dir
                    destLibDefPath = _node.path.join(testDirPath, _node.path.basename(testGroup.libDefPath));
                    _context7.next = 5;
                    return regeneratorRuntime.awrap(P.all([P.all(testGroup.testFilePaths.map(function _callee3(filePath, idx) {
                      var destBasename;
                      return regeneratorRuntime.async(function _callee3$(_context5) {
                        while (1) {
                          switch (_context5.prev = _context5.next) {
                            case 0:
                              // Because there could be multiple test files with the same basename,
                              // we disambiguate each one with a locally-unique index.
                              //
                              // i.e. underscore/v1.x.x/test-underscore.js
                              //      underscore/v1.x.x/flow-v0.22.x/test-underscore.js
                              destBasename = idx + "-" + _node.path.basename(filePath);
                              _context5.next = 3;
                              return regeneratorRuntime.awrap((0, _fileUtils.copyFile)(filePath, _node.path.join(testDirPath, destBasename)));

                            case 3:
                            case "end":
                              return _context5.stop();
                          }
                        }
                      }, null, _this2);
                    })), (0, _fileUtils.copyFile)(testGroup.libDefPath, destLibDefPath)]));

                  case 5:

                    // Write out a .flowconfig
                    destFlowConfigPath = _node.path.join(testDirPath, ".flowconfig");
                    flowConfigData = ["[libs]", _node.path.basename(testGroup.libDefPath), "", "[options]", "suppress_comment=\\\\(.\\\\|\\n\\\\)*\\\\$ExpectError", "",

                    // Be sure to ignore stuff in the node_modules directory of the flow-typed
                    // CLI repository!
                    "[ignore]", _node.path.join(testDirPath, "..", "..", "node_modules")].join("\n");
                    _context7.next = 9;
                    return regeneratorRuntime.awrap(_node.fs.writeFile(destFlowConfigPath, flowConfigData));

                  case 9:

                    // For each compatible version of Flow, run `flow check` and verify there
                    // are no errors.
                    testGrpFlowSemVerRange = (0, _flowVersion.toSemverString)(testGroup.flowVersion);
                    flowVersionsToRun = orderedFlowVersions.filter(function (flowVer) {
                      return semver.satisfies(flowVer, testGrpFlowSemVerRange);
                    });

                  case 11:
                    if (!(flowVersionsToRun.length > 0)) {
                      _context7.next = 17;
                      break;
                    }

                    // Run tests in batches to avoid saturation
                    testBatch = flowVersionsToRun.slice(0, Math.min(flowVersionsToRun.length, 5)).map(function (group) {
                      return flowVersionsToRun.shift(), group;
                    });
                    _context7.next = 15;
                    return regeneratorRuntime.awrap(P.all(testBatch.map(function _callee4(flowVer) {
                      var testRunId, _ref4, stdErrOut, errCode, execError;

                      return regeneratorRuntime.async(function _callee4$(_context6) {
                        while (1) {
                          switch (_context6.prev = _context6.next) {
                            case 0:
                              testRunId = testGroup.id + " (flow-" + flowVer + ")";


                              console.log("Testing %s...", testRunId);

                              _context6.next = 4;
                              return regeneratorRuntime.awrap(new Promise(function (res) {
                                var child = _node.child_process.exec([_node.path.join(BIN_DIR, "flow-" + flowVer), "check", "--strip-root", "--all", testDirPath].join(" "));

                                var stdErrOut = "";
                                child.stdout.on("data", function (data) {
                                  return stdErrOut += data;
                                });
                                child.stderr.on("data", function (data) {
                                  return stdErrOut += data;
                                });

                                child.on("error", function (execError) {
                                  res({ stdErrOut: stdErrOut, errCode: null, execError: execError });
                                });

                                child.on("close", function (errCode) {
                                  res({ stdErrOut: stdErrOut, errCode: errCode, execError: null });
                                });
                              }));

                            case 4:
                              _ref4 = _context6.sent;
                              stdErrOut = _ref4.stdErrOut;
                              errCode = _ref4.errCode;
                              execError = _ref4.execError;


                              if (execError !== null) {
                                errors.push(testRunId + ": Error executing Flow process: " + execError.stack);
                              } else if (errCode !== 0) {
                                errors.push(testRunId + ": Unexpected Flow errors(" + String(errCode) + "):\n" + stdErrOut + "\n" + String(execError));
                              }

                            case 9:
                            case "end":
                              return _context6.stop();
                          }
                        }
                      }, null, _this2);
                    })));

                  case 15:
                    _context7.next = 11;
                    break;

                  case 17:
                    return _context7.abrupt("return", {
                      v: errors
                    });

                  case 18:
                  case "end":
                    return _context7.stop();
                }
              }
            }, null, _this2);
          }());

        case 12:
          _ret = _context8.sent;

          if (!((typeof _ret === "undefined" ? "undefined" : _typeof(_ret)) === "object")) {
            _context8.next = 15;
            break;
          }

          return _context8.abrupt("return", _ret.v);

        case 15:
          _context8.prev = 15;
          _context8.next = 18;
          return regeneratorRuntime.awrap(_node.fs.exists(testDirPath));

        case 18:
          if (!_context8.sent) {
            _context8.next = 21;
            break;
          }

          _context8.next = 21;
          return regeneratorRuntime.awrap((0, _fileUtils.recursiveRmdir)(testDirPath));

        case 21:
          return _context8.finish(15);

        case 22:
        case "end":
          return _context8.stop();
      }
    }
  }, null, this, [[9,, 15, 22]]);
}

function runTests(repoDirPath, testPatterns) {
  var testPatternRes, testGroups, results, testGroup, testGroupErrors;
  return regeneratorRuntime.async(function runTests$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          testPatternRes = testPatterns.map(function (patt) {
            return new RegExp(patt, "g");
          });
          _context9.next = 3;
          return regeneratorRuntime.awrap(getTestGroups(repoDirPath));

        case 3:
          _context9.t0 = function (testGroup) {
            if (testPatternRes.length === 0) {
              return true;
            }

            for (var i = 0; i < testPatternRes.length; i++) {
              var pattern = testPatternRes[i];
              if (testGroup.id.match(pattern) != null) {
                return true;
              }
            }

            return false;
          };

          testGroups = _context9.sent.filter(_context9.t0);
          _context9.prev = 5;
          _context9.next = 8;
          return regeneratorRuntime.awrap(_node.fs.exists(TEST_DIR));

        case 8:
          if (!_context9.sent) {
            _context9.next = 11;
            break;
          }

          _context9.next = 11;
          return regeneratorRuntime.awrap((0, _fileUtils.recursiveRmdir)(TEST_DIR));

        case 11:
          _context9.next = 13;
          return regeneratorRuntime.awrap(_node.fs.mkdir(TEST_DIR));

        case 13:
          results = new Map();

        case 14:
          if (!(testGroups.length > 0)) {
            _context9.next = 22;
            break;
          }

          testGroup = testGroups.shift();
          _context9.next = 18;
          return regeneratorRuntime.awrap(runTestGroup(testGroup));

        case 18:
          testGroupErrors = _context9.sent;

          if (testGroupErrors.length > 0) {
            (function () {
              var errors = results.get(testGroup.id) || [];
              testGroupErrors.forEach(function (err) {
                return errors.push(err);
              });
              results.set(testGroup.id, errors);
            })();
          }
          _context9.next = 14;
          break;

        case 22:
          return _context9.abrupt("return", results);

        case 23:
          _context9.prev = 23;
          _context9.next = 26;
          return regeneratorRuntime.awrap(_node.fs.exists(TEST_DIR));

        case 26:
          if (!_context9.sent) {
            _context9.next = 29;
            break;
          }

          _context9.next = 29;
          return regeneratorRuntime.awrap((0, _fileUtils.recursiveRmdir)(TEST_DIR));

        case 29:
          return _context9.finish(23);

        case 30:
        case "end":
          return _context9.stop();
      }
    }
  }, null, this, [[5,, 23, 30]]);
}

var name = exports.name = "run-tests";
var description = exports.description = "Run definition tests of library definitions in the flow-typed project.";
function run(argv) {
  var testPatterns, cwd, cwdDefsNPMPath, repoDirPath, results;
  return regeneratorRuntime.async(function run$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          if ((0, _isInFlowTypedRepo2.default)()) {
            _context10.next = 3;
            break;
          }

          console.log("This command only works in a clone of flowtype/flow-typed. " + "It is a tool used to run tests of the library definitions in the flow-typed project.");
          return _context10.abrupt("return", 1);

        case 3:
          testPatterns = argv._.slice(1);
          cwd = process.cwd();
          cwdDefsNPMPath = _node.path.join(cwd, 'definitions', 'npm');
          _context10.next = 8;
          return regeneratorRuntime.awrap(_node.fs.exists(cwdDefsNPMPath));

        case 8:
          if (!_context10.sent) {
            _context10.next = 12;
            break;
          }

          _context10.t0 = cwdDefsNPMPath;
          _context10.next = 13;
          break;

        case 12:
          _context10.t0 = _node.path.join(__dirname, '..', '..', '..', 'definitions', 'npm');

        case 13:
          repoDirPath = _context10.t0;


          console.log('Running definition tests in %s...\n', repoDirPath);

          _context10.next = 17;
          return regeneratorRuntime.awrap(runTests(repoDirPath, testPatterns));

        case 17:
          results = _context10.sent;

          console.log(" ");
          Array.from(results).forEach(function (_ref5) {
            var _ref6 = _slicedToArray(_ref5, 2),
                testGroupName = _ref6[0],
                errors = _ref6[1];

            console.log("ERROR: %s", testGroupName);
            errors.forEach(function (err) {
              return console.log(" * %s\n", err.split("\n").map(function (line, idx) {
                return idx === 0 ? line : "   " + line;
              }).join("\n"));
            });
          });

          if (!(results.size === 0)) {
            _context10.next = 23;
            break;
          }

          console.log("All tests passed!");
          return _context10.abrupt("return", 0);

        case 23:
          return _context10.abrupt("return", 1);

        case 24:
        case "end":
          return _context10.stop();
      }
    }
  }, null, this);
};
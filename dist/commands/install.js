"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.description = exports.name = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.setup = setup;
exports.run = run;

var _safe = require("colors/safe");

var _safe2 = _interopRequireDefault(_safe);

var _fileUtils = require("../lib/fileUtils.js");

var _stubUtils = require("../lib/stubUtils.js");

var _npmProjectUtils = require("../lib/npmProjectUtils.js");

var _libDefs = require("../lib/libDefs.js");

var _flowProjectUtils = require("../lib/flowProjectUtils.js");

var _node = require("../lib/node.js");

var _semver = require("../lib/semver.js");

var _semver2 = require("semver");

var _semver3 = _interopRequireDefault(_semver2);

var _codeSign = require("../lib/codeSign.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var name = exports.name = 'install';
var description = exports.description = 'Installs a libdef to the ./flow-typed directory';

var FLOW_BUILT_IN_LIBS = ['react', 'react-dom'];

function setup(yargs) {
  return yargs.usage("$0 " + name + " - " + description).options({
    flowVersion: {
      alias: 'f',
      describe: 'The version of Flow fetched libdefs must be compatible with',
      type: 'string'
    },
    overwrite: {
      alias: 'o',
      describe: 'Overwrite a libdef if it is already present in the ' + '`flow-typed` directory',
      type: 'boolean',
      demand: false
    },
    verbose: {
      describe: 'Print additional, verbose information while installing ' + 'libdefs.',
      type: 'boolean',
      demand: false
    }
  });
};

function failWithMessage(message) {
  console.error(message);
  return 1;
}

function run(args) {
  var _this = this;

  var cwd, flowVersionArg, flowVer, discoveredFlowVer, flowVersionStr, flowVersion, flowProjectRoot, depsMap, term, matches, npmScope, pkgName, pkgVerStr, scopedPkgName, pkgJsonData, libDefsToInstall, missingLibDefs, libDefNeedsUpdate, depNames, libDefPlural;
  return regeneratorRuntime.async(function run$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          cwd = process.cwd();
          flowVersionArg = args.flowVersion;
          flowVer = void 0;

          if (!(flowVersionArg == null)) {
            _context6.next = 15;
            break;
          }

          _context6.next = 6;
          return regeneratorRuntime.awrap((0, _npmProjectUtils.determineFlowVersion)(cwd));

        case 6:
          discoveredFlowVer = _context6.sent;

          if (!(discoveredFlowVer !== null)) {
            _context6.next = 12;
            break;
          }

          flowVer = discoveredFlowVer;
          console.log("\u2022 Found flow-bin@" + (0, _semver.versionToString)(flowVer) + " installed. Installing " + "libdefs compatible with this version of Flow...");
          _context6.next = 13;
          break;

        case 12:
          return _context6.abrupt("return", failWithMessage('Failed to find a flow-bin dependency in package.json.\n' + 'Please install flow bin: `npm install --save-dev flow-bin` ' + 'or provide a version on the command line: ' + '`flow-typed install --flowVersion=0.24.0`'));

        case 13:
          _context6.next = 18;
          break;

        case 15:
          flowVersionStr = flowVersionArg[0] === 'v' ? flowVersionArg : 'v' + flowVersionArg;


          if (/^v[0-9]+\.[0-9]+$/.test(flowVersionStr)) {
            flowVersionStr = flowVersionStr + ".0";
          }
          flowVer = (0, _semver.stringToVersion)(flowVersionStr);

        case 18:
          flowVersion = flowVer;

          // Find the Flow project root

          _context6.next = 21;
          return regeneratorRuntime.awrap((0, _flowProjectUtils.findFlowRoot)(cwd));

        case 21:
          flowProjectRoot = _context6.sent;

          if (!(flowProjectRoot === null)) {
            _context6.next = 24;
            break;
          }

          return _context6.abrupt("return", failWithMessage('ERROR: Unable to find a flow project in the current dir or any of ' + 'it\'s parents!\n' + 'Please run this command from within a Flow project.'));

        case 24:

          // Generate a map { dependency: version } for libs to install from command
          depsMap = {};

          // If a specific package was specified, look it up. Otherwise find/read
          // the package.json.

          if (!args._[1]) {
            _context6.next = 37;
            break;
          }

          term = args._[1];
          matches = term.match(/(@[^@\/]+\/)?([^@]*)@(.+)/);

          if (!(matches == null)) {
            _context6.next = 30;
            break;
          }

          return _context6.abrupt("return", failWithMessage("ERROR: Please specify an npm package name of the format 'foo@1.2.3'"));

        case 30:
          npmScope = matches[1];
          pkgName = matches[2];
          pkgVerStr = matches[3];
          scopedPkgName = npmScope ? npmScope + pkgName : pkgName;

          depsMap[scopedPkgName] = pkgVerStr;
          _context6.next = 46;
          break;

        case 37:
          _context6.next = 39;
          return regeneratorRuntime.awrap((0, _npmProjectUtils.getPackageJsonData)(cwd));

        case 39:
          pkgJsonData = _context6.sent;
          _context6.next = 42;
          return regeneratorRuntime.awrap((0, _npmProjectUtils.getPackageJsonDependencies)(pkgJsonData));

        case 42:
          depsMap = _context6.sent;

          if (!(Object.keys(depsMap).length === 0)) {
            _context6.next = 45;
            break;
          }

          return _context6.abrupt("return", failWithMessage("No package dependencies were found in package.json."));

        case 45:

          if (args.verbose) {
            Object.keys(depsMap).forEach(function (dep) {
              console.log("\u2022 Found package.json dependency: " + dep + " " + depsMap[dep]);
            });
          } else {
            console.log("\u2022 Found " + String(Object.keys(depsMap).length) + " dependencies in " + "package.json. Searching for libdefs...");
          }

        case 46:

          // Get a list of defs to install.
          libDefsToInstall = [];
          missingLibDefs = [];
          libDefNeedsUpdate = [];
          depNames = Object.keys(depsMap);
          _context6.next = 52;
          return regeneratorRuntime.awrap(Promise.all(depNames.map(function _callee(pkgName) {
            var pkgVersionStr, libDef, libDefLowerBound, pkgDepLowerBound;
            return regeneratorRuntime.async(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    if (!(FLOW_BUILT_IN_LIBS.indexOf(pkgName) > -1)) {
                      _context.next = 2;
                      break;
                    }

                    return _context.abrupt("return");

                  case 2:
                    pkgVersionStr = depsMap[pkgName];
                    _context.next = 5;
                    return regeneratorRuntime.awrap(findLibDef(pkgName, pkgVersionStr, flowVersion));

                  case 5:
                    libDef = _context.sent;

                    if (libDef) {
                      libDefsToInstall.push(libDef);
                      libDefLowerBound = (0, _semver.getRangeLowerBound)(libDef.pkgVersionStr);
                      pkgDepLowerBound = (0, _semver.getRangeLowerBound)(pkgVersionStr);

                      if (_semver3.default.lt(libDefLowerBound, pkgDepLowerBound)) {
                        libDefNeedsUpdate.push([libDef, [pkgName, pkgVersionStr]]);
                      }
                    } else {
                      missingLibDefs.push([pkgName, pkgVersionStr]);
                    }

                  case 7:
                  case "end":
                    return _context.stop();
                }
              }
            }, null, _this);
          })));

        case 52:
          if (!(libDefsToInstall.length > 0)) {
            _context6.next = 55;
            break;
          }

          _context6.next = 55;
          return regeneratorRuntime.awrap(function _callee2() {
            var flowTypedDirPathStr;
            return regeneratorRuntime.async(function _callee2$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    console.log("\u2022 Installing " + libDefsToInstall.length + " libdefs...");
                    flowTypedDirPathStr = _node.path.join(flowProjectRoot, 'flow-typed', 'npm');
                    _context2.next = 4;
                    return regeneratorRuntime.awrap((0, _fileUtils.mkdirp)(flowTypedDirPathStr));

                  case 4:
                    _context2.next = 6;
                    return regeneratorRuntime.awrap(Promise.all(libDefsToInstall.map(function (def) {
                      return installLibDef(def, flowTypedDirPathStr, args.overwrite);
                    })));

                  case 6:
                  case "end":
                    return _context2.stop();
                }
              }
            }, null, _this);
          }());

        case 55:

          if ((args.verbose || missingLibDefs.length === 0) && libDefNeedsUpdate.length > 0) {
            console.log("\u2022 The following installed libdefs are compatible with your " + "dependencies, but may not include all minor and patch changes for " + "your specific dependency version:\n");
            libDefNeedsUpdate.forEach(function (_ref) {
              var _ref2 = _slicedToArray(_ref, 2),
                  libDef = _ref2[0],
                  _ref2$ = _slicedToArray(_ref2[1], 2),
                  pkgName = _ref2$[0],
                  pkgVersionStr = _ref2$[1];

              console.log('  • libdef: %s (satisfies %s)', _safe2.default.yellow(libDef.pkgName + "_" + libDef.pkgVersionStr), _safe2.default.bold(pkgName + "@" + pkgVersionStr));
            });
            libDefPlural = libDefNeedsUpdate.length > 1 ? ['versioned updates', 'these packages'] : ['a versioned update', 'this package'];

            console.log("\n  Consider submitting " + libDefPlural[0] + " for " + libDefPlural[1] + " to\n" + "  https://github.com/flowtype/flow-typed/\n");
          }

          if (!(missingLibDefs.length > 0)) {
            _context6.next = 63;
            break;
          }

          if (!args._[1]) {
            _context6.next = 61;
            break;
          }

          console.log(_safe2.default.red("!! No libdefs found in flow-typed for " + args._[1] + ". !!") + '\n\nConsider using `%s` to generate an empty libdef that you can fill in.', _safe2.default.bold("flow-typed create-stub " + args._[1]));
          _context6.next = 63;
          break;

        case 61:
          _context6.next = 63;
          return regeneratorRuntime.awrap(function _callee5() {
            var untypedMissingLibDefs, typedMissingLibDefs, plural;
            return regeneratorRuntime.async(function _callee5$(_context5) {
              while (1) {
                switch (_context5.prev = _context5.next) {
                  case 0:
                    // If a package that's missing a flow-typed libdef has any .flow files,
                    // we'll skip generating a stub for it.
                    untypedMissingLibDefs = [];
                    typedMissingLibDefs = [];
                    _context5.next = 4;
                    return regeneratorRuntime.awrap(Promise.all(missingLibDefs.map(function _callee3(_ref3) {
                      var _ref4 = _slicedToArray(_ref3, 2),
                          pkgName = _ref4[0],
                          pkgVerStr = _ref4[1];

                      var hasFlowFiles;
                      return regeneratorRuntime.async(function _callee3$(_context3) {
                        while (1) {
                          switch (_context3.prev = _context3.next) {
                            case 0:
                              _context3.next = 2;
                              return regeneratorRuntime.awrap((0, _stubUtils.pkgHasFlowFiles)(cwd, pkgName));

                            case 2:
                              hasFlowFiles = _context3.sent;

                              if (hasFlowFiles) {
                                typedMissingLibDefs.push([pkgName, pkgVerStr]);
                              } else {
                                untypedMissingLibDefs.push([pkgName, pkgVerStr]);
                              }

                            case 4:
                            case "end":
                              return _context3.stop();
                          }
                        }
                      }, null, _this);
                    })));

                  case 4:
                    if (!(untypedMissingLibDefs.length > 0)) {
                      _context5.next = 11;
                      break;
                    }

                    console.log('• Generating stubs for untyped dependencies...');
                    _context5.next = 8;
                    return regeneratorRuntime.awrap(Promise.all(untypedMissingLibDefs.map(function _callee4(_ref5) {
                      var _ref6 = _slicedToArray(_ref5, 2),
                          pkgName = _ref6[0],
                          pkgVerStr = _ref6[1];

                      return regeneratorRuntime.async(function _callee4$(_context4) {
                        while (1) {
                          switch (_context4.prev = _context4.next) {
                            case 0:
                              _context4.next = 2;
                              return regeneratorRuntime.awrap((0, _stubUtils.createStub)(flowProjectRoot, pkgName, pkgVerStr, args.overwrite));

                            case 2:
                            case "end":
                              return _context4.stop();
                          }
                        }
                      }, null, _this);
                    })));

                  case 8:

                    console.log(_safe2.default.red("\n!! No flow@" + (0, _semver.versionToString)(flowVersion) + "-compatible libdefs " + "found in flow-typed for the above untyped dependencies !!"));
                    plural = missingLibDefs.length > 1 ? ['libdefs', 'these packages', 'them'] : ['a libdef', 'this package', 'it'];

                    console.log("\n   I've generated " + '`' + "any" + '`' + "-typed stubs for " + plural[1] + ", but consider submitting\n   " + plural[0] + " for " + plural[2] + " to " + _safe2.default.bold('https://github.com/flowtype/flow-typed/') + "\n");

                  case 11:
                  case "end":
                    return _context5.stop();
                }
              }
            }, null, _this);
          }());

        case 63:
          return _context6.abrupt("return", 0);

        case 64:
        case "end":
          return _context6.stop();
      }
    }
  }, null, this);
};

/**
 * Install a libDef into the given directory path.
 */
function installLibDef(def, flowTypedDirPathStr, overwrite) {
  var pkgName, libDefDirPathStr, targetFileName, targetFilePath, terseTargetFile, libDefVersion, codeSignPreprocessor;
  return regeneratorRuntime.async(function installLibDef$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          pkgName = def.pkgName;
          libDefDirPathStr = pkgName.charAt(0) === '@' ? _node.path.join(flowTypedDirPathStr, pkgName.split(_node.path.sep)[0]) : flowTypedDirPathStr;
          _context7.next = 4;
          return regeneratorRuntime.awrap((0, _fileUtils.mkdirp)(libDefDirPathStr));

        case 4:
          targetFileName = pkgName + "_" + def.pkgVersionStr + ".js";
          targetFilePath = _node.path.join(libDefDirPathStr, targetFileName);

          // Find the libdef

          _context7.prev = 6;
          terseTargetFile = _node.path.relative(process.cwd(), targetFilePath);
          _context7.next = 10;
          return regeneratorRuntime.awrap(_node.fs.exists(targetFilePath));

        case 10:
          _context7.t0 = _context7.sent;

          if (!_context7.t0) {
            _context7.next = 13;
            break;
          }

          _context7.t0 = !overwrite;

        case 13:
          if (!_context7.t0) {
            _context7.next = 16;
            break;
          }

          console.log("  • %s\n" + "    └> %s", _safe2.default.bold(_safe2.default.red(terseTargetFile + " already exists!")), "Use --overwrite to overwrite the existing libdef.");
          return _context7.abrupt("return", false);

        case 16:
          _context7.next = 18;
          return regeneratorRuntime.awrap((0, _libDefs.getCacheLibDefVersion)(def));

        case 18:
          libDefVersion = _context7.sent;
          codeSignPreprocessor = (0, _codeSign.signCodeStream)(libDefVersion);
          _context7.next = 22;
          return regeneratorRuntime.awrap((0, _fileUtils.copyFile)(def.path, targetFilePath, codeSignPreprocessor));

        case 22:
          console.log(_safe2.default.bold("  • %s\n" + "    └> %s"), targetFileName, _safe2.default.green("." + _node.path.sep + terseTargetFile));

          return _context7.abrupt("return", true);

        case 26:
          _context7.prev = 26;
          _context7.t1 = _context7["catch"](6);

          console.log("  !! Failed to install " + def.pkgName + " into " + targetFilePath);
          console.log("  ERROR: " + _context7.t1.message);
          return _context7.abrupt("return", false);

        case 31:
        case "end":
          return _context7.stop();
      }
    }
  }, null, this, [[6, 26]]);
}

/**
 * Search flow typed for a matching libdef.
 */
function findLibDef(defName, defVersion, flowVersion) {
  var filter, defs, filtered;
  return regeneratorRuntime.async(function findLibDef$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          filter = {
            type: 'exact',
            pkgName: defName,
            pkgVersionStr: defVersion,
            flowVersionStr: (0, _semver.versionToString)(flowVersion)
          };
          _context8.next = 3;
          return regeneratorRuntime.awrap((0, _libDefs.getCacheLibDefs)());

        case 3:
          defs = _context8.sent;
          filtered = (0, _libDefs.filterLibDefs)(defs, filter);

          if (!(filtered.length === 0)) {
            _context8.next = 7;
            break;
          }

          return _context8.abrupt("return", null);

        case 7:
          return _context8.abrupt("return", filtered[0]);

        case 8:
        case "end":
          return _context8.stop();
      }
    }
  }, null, this);
}
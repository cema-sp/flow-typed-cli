"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findPackageJsonDepVersionStr = findPackageJsonDepVersionStr;
exports.findPackageJsonPath = findPackageJsonPath;
exports.getPackageJsonDependencies = getPackageJsonDependencies;
exports.getPackageJsonData = getPackageJsonData;
exports.determineFlowVersion = determineFlowVersion;

var _node = require("./node.js");

var _fileUtils = require("./fileUtils.js");

var _semver = require("semver");

var _semver2 = _interopRequireDefault(_semver);

var _semver3 = require("./semver.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PKG_JSON_DEP_FIELDS = ['dependencies', 'devDependencies', 'peerDependencies', 'bundledDependencies'];

function findPackageJsonDepVersionStr(pkgJson, depName) {
  var matchedFields, deps;
  return regeneratorRuntime.async(function findPackageJsonDepVersionStr$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          matchedFields = [];
          deps = PKG_JSON_DEP_FIELDS.reduce(function (deps, section) {
            var contentSection = pkgJson.content[section];
            if (contentSection && contentSection[depName]) {
              matchedFields.push(section);
              deps.push(contentSection[depName]);
            }
            return deps;
          }, []);

          if (!(deps.length === 0)) {
            _context.next = 6;
            break;
          }

          return _context.abrupt("return", null);

        case 6:
          if (!(deps.length === 1)) {
            _context.next = 10;
            break;
          }

          return _context.abrupt("return", deps.pop());

        case 10:
          throw new Error("Found " + depName + " listed in " + String(deps.length) + " places in " + (pkgJson.pathStr + "!"));

        case 11:
        case "end":
          return _context.stop();
      }
    }
  }, null, this);
}

function findPackageJsonPath(pathStr) {
  var _this = this;

  var pkgJsonPathStr;
  return regeneratorRuntime.async(function findPackageJsonPath$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return regeneratorRuntime.awrap((0, _fileUtils.searchUpDirPath)(pathStr, function _callee(p) {
            return regeneratorRuntime.async(function _callee$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    _context2.next = 2;
                    return regeneratorRuntime.awrap(_node.fs.exists(_node.path.join(p, 'package.json')));

                  case 2:
                    return _context2.abrupt("return", _context2.sent);

                  case 3:
                  case "end":
                    return _context2.stop();
                }
              }
            }, null, _this);
          }));

        case 2:
          pkgJsonPathStr = _context3.sent;

          if (!(pkgJsonPathStr === null)) {
            _context3.next = 5;
            break;
          }

          throw new Error("Unable to find a package.json for " + pathStr + "!");

        case 5:
          return _context3.abrupt("return", _node.path.join(pkgJsonPathStr, 'package.json'));

        case 6:
        case "end":
          return _context3.stop();
      }
    }
  }, null, this);
};

function getPackageJsonDependencies(pkgJson) {
  return PKG_JSON_DEP_FIELDS.reduce(function (deps, section) {
    var contentSection = pkgJson.content[section];
    if (contentSection) {
      Object.keys(contentSection).forEach(function (pkgName) {
        if (deps[pkgName]) {
          throw new Error("Found " + pkgName + " listed twice in package.json!");
        }
        deps[pkgName] = contentSection[pkgName];
      });
    }
    return deps;
  }, {});
}

function getPackageJsonData(pathStr) {
  var pkgJsonPath, pkgJsonContent;
  return regeneratorRuntime.async(function getPackageJsonData$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return regeneratorRuntime.awrap(findPackageJsonPath(pathStr));

        case 2:
          pkgJsonPath = _context4.sent;
          _context4.next = 5;
          return regeneratorRuntime.awrap(_node.fs.readFile(pkgJsonPath));

        case 5:
          pkgJsonContent = _context4.sent;
          return _context4.abrupt("return", {
            pathStr: pkgJsonPath,
            content: JSON.parse(pkgJsonContent.toString())
          });

        case 7:
        case "end":
          return _context4.stop();
      }
    }
  }, null, this);
};

function determineFlowVersion(pathStr) {
  var pkgJsonData, flowBinVersionStr, flowVerStr, flowVerRange, cliPkgJson, cliFlowVer;
  return regeneratorRuntime.async(function determineFlowVersion$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.next = 2;
          return regeneratorRuntime.awrap(getPackageJsonData(pathStr));

        case 2:
          pkgJsonData = _context5.sent;
          _context5.next = 5;
          return regeneratorRuntime.awrap(findPackageJsonDepVersionStr(pkgJsonData, 'flow-bin'));

        case 5:
          flowBinVersionStr = _context5.sent;

          if (!(flowBinVersionStr !== null)) {
            _context5.next = 19;
            break;
          }

          flowVerStr = void 0;

          if (!_semver2.default.valid(flowBinVersionStr)) {
            _context5.next = 12;
            break;
          }

          flowVerStr = flowBinVersionStr;
          _context5.next = 18;
          break;

        case 12:
          flowVerRange = new _semver2.default.Range(flowBinVersionStr);

          if (!(flowVerRange.set[0].length !== 2)) {
            _context5.next = 17;
            break;
          }

          cliPkgJson = require("../../package.json");
          cliFlowVer = cliPkgJson.devDependencies['flow-bin'];
          throw new Error("Unable to extract flow-bin version from package.json!\n" + "Never use a complex version range with flow-bin. Always use a " + ("specific version (i.e. \"" + cliFlowVer + "\")."));

        case 17:
          flowVerStr = flowVerRange.set[0][0].semver.version;

        case 18:
          return _context5.abrupt("return", (0, _semver3.stringToVersion)('v' + flowVerStr));

        case 19:
          return _context5.abrupt("return", null);

        case 20:
        case "end":
          return _context5.stop();
      }
    }
  }, null, this);
};
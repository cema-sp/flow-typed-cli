'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.glob = glob;
exports.pkgHasFlowFiles = pkgHasFlowFiles;
exports.createStub = createStub;

var _safe = require('colors/safe');

var _safe2 = _interopRequireDefault(_safe);

var _npmProjectUtils = require('./npmProjectUtils');

var _util = require('util');

var _node = require('./node');

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _fileUtils = require('./fileUtils');

var _codeSign = require('./codeSign');

var _semver = require('./semver');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function glob(pattern, options) {
  return new Promise(function (resolve, reject) {
    return (0, _glob2.default)(pattern, options, function (err, files) {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
}

function resolvePkgDirPath(pkgName, pkgJsonDirPath) {
  var prevNodeModulesDirPath, nodeModulesDirPath, pkgDirPath;
  return regeneratorRuntime.async(function resolvePkgDirPath$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          prevNodeModulesDirPath = void 0;
          nodeModulesDirPath = _node.path.resolve(pkgJsonDirPath, 'node_modules');

        case 2:
          if (!true) {
            _context.next = 14;
            break;
          }

          pkgDirPath = _node.path.resolve(nodeModulesDirPath, pkgName);
          _context.next = 6;
          return regeneratorRuntime.awrap(_node.fs.exists(pkgDirPath));

        case 6:
          if (!_context.sent) {
            _context.next = 8;
            break;
          }

          return _context.abrupt('return', pkgDirPath);

        case 8:

          prevNodeModulesDirPath = nodeModulesDirPath;
          nodeModulesDirPath = _node.path.resolve(nodeModulesDirPath, '..', '..', 'node_modules');

          if (!(prevNodeModulesDirPath === nodeModulesDirPath)) {
            _context.next = 12;
            break;
          }

          return _context.abrupt('break', 14);

        case 12:
          _context.next = 2;
          break;

        case 14:
          throw new Error('Unable to find `node_modules/' + pkgName + '/` install directory! ' + 'Did you forget to run `npm install` before running `flow-typed install`?');

        case 15:
        case 'end':
          return _context.stop();
      }
    }
  }, null, this);
}

var moduleStubTemplate = '\ndeclare module \'%s\' {\n  declare module.exports: any;\n}'.trim();
var aliasTemplate = '\ndeclare module \'%s%s\' {\n  declare module.exports: $Exports<\'%s\'>;\n}'.trim();

function stubFor(moduleName, fileExt) {
  var moduleStub = (0, _util.format)(moduleStubTemplate, moduleName);
  if (fileExt !== undefined) {
    var aliasStub = (0, _util.format)(aliasTemplate, moduleName, fileExt, moduleName);
    return moduleStub + '\n' + aliasStub;
  }
  return moduleStub;
}

function writeStub(projectRoot, packageName, packageVersion, overwrite, files) {
  var output, _files$reduce, _files$reduce2, fileDecls, aliases, filename, exists, existingStub, flowVersionRaw, flowVersion, stubVersion;

  return regeneratorRuntime.async(function writeStub$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          output = ['/**', ' * This is an autogenerated libdef stub for:', ' *', ' *   \'' + packageName + '\'', ' *', ' * Fill this stub out by replacing all the `any` types.', ' *', ' * Once filled out, we encourage you to share your work with the ', ' * community by sending a pull request to: ', ' * https://github.com/flowtype/flow-typed', ' */\n\n'].join('\n');


          output += stubFor(packageName);

          if (files.length > 0) {
            output += '\n\n/**\n * We include stubs for each file inside this npm package in case you need to\n * require those files directly. Feel free to delete any files that aren\'t\n * needed.\n */\n';

            _files$reduce = files.reduce(function (_ref, file) {
              var _ref2 = _slicedToArray(_ref, 2),
                  fileDecls = _ref2[0],
                  aliases = _ref2[1];

              var ext = _node.path.extname(file);
              var name = file.substr(0, file.length - ext.length);
              var moduleName = packageName + '/' + name;
              if (name === 'index') {
                aliases.push((0, _util.format)(aliasTemplate, moduleName, '', packageName));
                aliases.push((0, _util.format)(aliasTemplate, moduleName, ext, packageName));
              } else {
                fileDecls.push((0, _util.format)(moduleStubTemplate, moduleName));
                aliases.push((0, _util.format)(aliasTemplate, moduleName, ext, moduleName));
              }
              return [fileDecls, aliases];
            }, [[], []]), _files$reduce2 = _slicedToArray(_files$reduce, 2), fileDecls = _files$reduce2[0], aliases = _files$reduce2[1];


            output += fileDecls.join('\n\n');
            output += '\n\n// Filename aliases\n';
            output += aliases.join('\n');
          }
          output += "\n"; // File should end with a newline
          filename = _node.path.join(projectRoot, "flow-typed", "npm", (0, _util.format)("%s_vx.x.x.js", packageName));
          _context2.next = 7;
          return regeneratorRuntime.awrap((0, _fileUtils.mkdirp)(_node.path.dirname(filename)));

        case 7:
          if (overwrite) {
            _context2.next = 17;
            break;
          }

          _context2.next = 10;
          return regeneratorRuntime.awrap(_node.fs.exists(filename));

        case 10:
          exists = _context2.sent;

          if (!exists) {
            _context2.next = 17;
            break;
          }

          _context2.next = 14;
          return regeneratorRuntime.awrap(_node.fs.readFile(filename));

        case 14:
          existingStub = _context2.sent;

          if ((0, _codeSign.verifySignedCode)(existingStub.toString())) {
            _context2.next = 17;
            break;
          }

          throw new Error("Stub already exists and has been modified. " + "Use --overwrite to overwrite");

        case 17:
          _context2.next = 19;
          return regeneratorRuntime.awrap((0, _npmProjectUtils.determineFlowVersion)(projectRoot));

        case 19:
          flowVersionRaw = _context2.sent;
          flowVersion = flowVersionRaw ? '/flow_' + (0, _semver.versionToString)(flowVersionRaw) : '';
          stubVersion = '<<STUB>>/' + packageName + '_v' + packageVersion + flowVersion;
          _context2.next = 24;
          return regeneratorRuntime.awrap(_node.fs.writeFile(filename, (0, _codeSign.signCode)(output, stubVersion)));

        case 24:
          return _context2.abrupt('return', filename);

        case 25:
        case 'end':
          return _context2.stop();
      }
    }
  }, null, this);
}

function pkgHasFlowFiles(projectRoot, packageName) {
  var pathToPackage, files;
  return regeneratorRuntime.async(function pkgHasFlowFiles$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return regeneratorRuntime.awrap(resolvePkgDirPath(packageName, projectRoot));

        case 2:
          pathToPackage = _context3.sent;
          _context3.next = 5;
          return regeneratorRuntime.awrap(glob("**/*.flow", {
            cwd: pathToPackage,
            ignore: "node_modules/**"
          }));

        case 5:
          files = _context3.sent;
          return _context3.abrupt('return', files.length > 0);

        case 7:
        case 'end':
          return _context3.stop();
      }
    }
  }, null, this);
};

/**
 * createStub("/path/to/root", "foo") will create a file
 * /path/to/root/flow-typed/npm/foo.js that contains a stub for the module foo.
 *
 * If foo is installed, it will read the directory that require("foo") resolves
 * to and include definitions for "foo/FILE", for every FILE in the foo package
 */
function createStub(projectRoot, packageName, explicitVersion, overwrite) {
  var files, resolutionError, pathToPackage, version, pkgJsonPathStr, pkgJsonData, rootDependencies, filename, terseFilename;
  return regeneratorRuntime.async(function createStub$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          files = [];
          resolutionError = null;
          pathToPackage = null;
          version = explicitVersion || null;
          _context4.prev = 4;
          _context4.next = 7;
          return regeneratorRuntime.awrap(resolvePkgDirPath(packageName, process.cwd()));

        case 7:
          pathToPackage = _context4.sent;
          _context4.next = 10;
          return regeneratorRuntime.awrap(glob("**/*.{js,jsx}", {
            cwd: pathToPackage,
            ignore: "node_modules/**"
          }));

        case 10:
          files = _context4.sent;
          _context4.next = 16;
          break;

        case 13:
          _context4.prev = 13;
          _context4.t0 = _context4['catch'](4);

          resolutionError = _context4.t0;

        case 16:

          // Try to deduce a version if one isn't provided
          if (version == null) {
            // Look at the package.json for the installed module
            if (pathToPackage != null) {
              try {
                version = require(_node.path.join(pathToPackage, 'package.json')).version;
              } catch (e) {}
            }
          }

          // If that failed, try looking for a package.json in the root

          if (!(version == null)) {
            _context4.next = 33;
            break;
          }

          _context4.prev = 18;
          _context4.next = 21;
          return regeneratorRuntime.awrap((0, _npmProjectUtils.findPackageJsonPath)(projectRoot));

        case 21:
          pkgJsonPathStr = _context4.sent;
          _context4.next = 24;
          return regeneratorRuntime.awrap((0, _npmProjectUtils.getPackageJsonData)(pkgJsonPathStr));

        case 24:
          pkgJsonData = _context4.sent;
          _context4.next = 27;
          return regeneratorRuntime.awrap((0, _npmProjectUtils.getPackageJsonDependencies)(pkgJsonData));

        case 27:
          rootDependencies = _context4.sent;

          version = rootDependencies[packageName] || null;
          _context4.next = 33;
          break;

        case 31:
          _context4.prev = 31;
          _context4.t1 = _context4['catch'](18);

        case 33:
          _context4.prev = 33;

          if (!(version === null)) {
            _context4.next = 36;
            break;
          }

          throw new Error("Could not deduce version from node_modules or package.json. " + "Please provide an explicit version");

        case 36:
          _context4.next = 38;
          return regeneratorRuntime.awrap(writeStub(projectRoot, packageName, version, overwrite, files));

        case 38:
          filename = _context4.sent;
          terseFilename = _node.path.relative(projectRoot, filename);

          console.log(_safe2.default.bold("  • %s@%s\n" + "    └> %s"), packageName, version, _safe2.default.red(terseFilename));
          if (resolutionError) {
            console.log(_safe2.default.yellow("\t  Unable to stub all files in '%s', " + "so only created a stub for the main module (%s)"), packageName, resolutionError.message);
          }
          return _context4.abrupt('return', true);

        case 45:
          _context4.prev = 45;
          _context4.t2 = _context4['catch'](33);

          console.log(_safe2.default.red("❌\t%s%s': %s"), packageName, version ? "@" + version : "", _context4.t2.message);
          return _context4.abrupt('return', false);

        case 49:
        case 'end':
          return _context4.stop();
      }
    }
  }, null, this, [[4, 13], [18, 31], [33, 45]]);
};
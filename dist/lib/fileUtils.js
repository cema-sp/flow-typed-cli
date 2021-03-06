"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.copyFile = copyFile;
exports.mkdirp = mkdirp;
exports.recursiveRmdir = recursiveRmdir;
exports.searchUpDirPath = searchUpDirPath;

var _mkdirp = require("mkdirp");

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _node = require("./node.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var P = Promise;

function copyFile(srcPath, destPath, preProcessor) {
  return new Promise(function (res, rej) {
    var reader = _node.fs.createReadStream(srcPath);
    reader.on("error", rej);
    var writer = _node.fs.createWriteStream(destPath);
    writer.on("error", rej);
    writer.on("close", res);
    if (preProcessor) {
      reader.pipe(preProcessor);
      preProcessor.pipe(writer);
    } else {
      reader.pipe(writer);
    }
  });
};

function mkdirp(path) {
  return new Promise(function (res, rej) {
    (0, _mkdirp2.default)(path, function (err) {
      if (err) {
        rej(err);
      } else {
        res();
      }
    });
  });
};

function recursiveRmdir(dirPath) {
  var _this = this;

  var dirItems, dirItemStats;
  return regeneratorRuntime.async(function recursiveRmdir$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(_node.fs.readdir(dirPath));

        case 2:
          dirItems = _context2.sent;
          _context2.next = 5;
          return regeneratorRuntime.awrap(P.all(dirItems.map(function (item) {
            return _node.fs.stat(_node.path.join(dirPath, item));
          })));

        case 5:
          dirItemStats = _context2.sent;
          _context2.next = 8;
          return regeneratorRuntime.awrap(P.all(dirItems.map(function _callee(itemName, idx) {
            var itemStat, itemPath;
            return regeneratorRuntime.async(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    itemStat = dirItemStats[idx];
                    itemPath = _node.path.join(dirPath, itemName);

                    if (!itemStat.isFile()) {
                      _context.next = 7;
                      break;
                    }

                    _context.next = 5;
                    return regeneratorRuntime.awrap(_node.fs.unlink(itemPath));

                  case 5:
                    _context.next = 11;
                    break;

                  case 7:
                    _context.next = 9;
                    return regeneratorRuntime.awrap(recursiveRmdir(itemPath));

                  case 9:
                    _context.next = 11;
                    return regeneratorRuntime.awrap(_node.fs.rmdir(itemPath).catch(function (err) {
                      if (err.code === 'ENOENT') {
                        // Ignore ENOENT error
                        // it's okay if the files are already removed
                        return;
                      }

                      throw err;
                    }));

                  case 11:
                  case "end":
                    return _context.stop();
                }
              }
            }, null, _this);
          })));

        case 8:
          return _context2.abrupt("return", _node.fs.rmdir(dirPath));

        case 9:
        case "end":
          return _context2.stop();
      }
    }
  }, null, this);
};

function searchUpDirPath(startDir, testFn) {
  var currDir, lastDir;
  return regeneratorRuntime.async(function searchUpDirPath$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          currDir = startDir;
          lastDir = null;

        case 2:
          if (!(currDir !== lastDir)) {
            _context3.next = 11;
            break;
          }

          _context3.next = 5;
          return regeneratorRuntime.awrap(testFn(currDir));

        case 5:
          if (!_context3.sent) {
            _context3.next = 7;
            break;
          }

          return _context3.abrupt("return", currDir);

        case 7:
          lastDir = currDir;
          currDir = _node.path.resolve(currDir, '..');
          _context3.next = 2;
          break;

        case 11:
          return _context3.abrupt("return", null);

        case 12:
        case "end":
          return _context3.stop();
      }
    }
  }, null, this);
};
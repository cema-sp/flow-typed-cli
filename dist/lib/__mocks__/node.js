'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.url = exports.path = exports.os = exports.https = exports.fs = exports.child_process = undefined;

var _child_process = require('child_process');

var node_child_process = _interopRequireWildcard(_child_process);

var _https = require('https');

var node_https = _interopRequireWildcard(_https);

var _os = require('os');

var node_os = _interopRequireWildcard(_os);

var _path = require('path');

var node_path = _interopRequireWildcard(_path);

var _url = require('url');

var node_url = _interopRequireWildcard(_url);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var node_fs = jest.genMockFromModule('fs');

// Mocks for the node modules
var child_process = exports.child_process = node_child_process;
var fs = exports.fs = {
  // This is a custom function that our tests can use during setup to specify
  // what the files on the "mock" filesystem should look like when any of the
  // `fs` APIs are used.
  mockFiles: {},

  __setMockFiles: function __setMockFiles(newMockFiles) {
    fs.mockFiles = newMockFiles;
  },

  createReadStream: node_fs.createReadStream,
  createWriteStream: node_fs.createWriteStream,
  exists: jest.fn(function _callee(dirOrFilePath) {
    return regeneratorRuntime.async(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            return _context.abrupt('return', new Promise(function (resolve) {
              process.nextTick(function () {
                return resolve(fs.mockFiles[dirOrFilePath] !== undefined);
              });
            }));

          case 1:
          case 'end':
            return _context.stop();
        }
      }
    }, null, undefined);
  }),
  mkdir: node_fs.mkdir,
  readdir: node_fs.readdir,
  readFile: jest.fn(function _callee2(filePath) {
    return regeneratorRuntime.async(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            return _context2.abrupt('return', new Promise(function (resolve, reject) {
              process.nextTick(function () {
                if (fs.mockFiles[filePath]) {
                  resolve(fs.mockFiles[filePath]);
                } else {
                  reject(new Error('ENOENT: no such file or directory, open \'' + filePath + '\''));
                }
              });
            }));

          case 1:
          case 'end':
            return _context2.stop();
        }
      }
    }, null, undefined);
  }),
  rename: node_fs.rename,
  rmdir: node_fs.rmdir,
  stat: node_fs.stat,
  statSync: node_fs.statSync,
  Stats: node_fs.Stats,
  unlink: node_fs.unlink,
  writeFile: node_fs.writeFile
};

var https = exports.https = node_https;
var os = exports.os = node_os;
var path = exports.path = node_path;
var url = exports.url = node_url;
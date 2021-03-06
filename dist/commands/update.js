"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setup = exports.description = exports.name = undefined;
exports.run = run;

var _install = require("./install");

var Install = _interopRequireWildcard(_install);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var name = exports.name = 'update';

var description = exports.description = 'Download updates for any installed libdefs. (Note: This is just an alias ' + 'of `flow-typed install --overwrite`)';

var setup = exports.setup = Install.setup;

function run(args) {
  return regeneratorRuntime.async(function run$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          args.overwrite = true;
          return _context.abrupt("return", Install.run(args));

        case 2:
        case "end":
          return _context.stop();
      }
    }
  }, null, this);
};
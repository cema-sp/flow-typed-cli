"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.description = exports.name = undefined;
exports._formatDefTable = _formatDefTable;
exports.run = run;

var _libDefs = require("../lib/libDefs.js");

var _flowVersion = require("../lib/flowVersion");

var _table = require("table");

var _table2 = _interopRequireDefault(_table);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _formatDefTable(defs) {
  var formatted = [['Name', 'Package Version', 'Flow Version']].concat(defs.map(function (def) {
    return [def.pkgName, def.pkgVersionStr, (0, _flowVersion.toSemverString)(def.flowVersion)];
  }));
  if (formatted.length === 1) {
    return "No definitions found, sorry!";
  } else {
    return "\nFound definitions:\n" + (0, _table2.default)(formatted);
  }
}

;

var name = exports.name = "search";
var description = exports.description = "Performs a simple search (by name) of available libdefs";

function run(args) {
  var flowVersionStr, term, defs, filtered;
  return regeneratorRuntime.async(function run$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          if (!(!args._ || !(args._.length > 1))) {
            _context.next = 3;
            break;
          }

          console.error('Please provide a term for which to search!');
          return _context.abrupt("return", 1);

        case 3:
          flowVersionStr = void 0;

          if (typeof args.flowVersion === "string") {
            flowVersionStr = args.flowVersion;
          }

          term = args._[1];
          _context.next = 8;
          return regeneratorRuntime.awrap((0, _libDefs.getCacheLibDefs)(process.stdout));

        case 8:
          defs = _context.sent;
          filtered = (0, _libDefs.filterLibDefs)(defs, {
            type: 'fuzzy',
            term: term,
            flowVersionStr: flowVersionStr
          });

          console.log(_formatDefTable(filtered));
          return _context.abrupt("return", 0);

        case 12:
        case "end":
          return _context.stop();
      }
    }
  }, null, this);
};
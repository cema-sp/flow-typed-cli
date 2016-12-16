"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.description = exports.name = undefined;
exports.run = run;

var _libDefs = require("../lib/libDefs.js");

var _isInFlowTypedRepo = require("../lib/isInFlowTypedRepo");

var _isInFlowTypedRepo2 = _interopRequireDefault(_isInFlowTypedRepo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function validationError(errKey, errMsg, validationErrs) {
  var errors = validationErrs.get(errKey) || [];
  errors.push(errMsg);
  validationErrs.set(errKey, errors);
}

var name = exports.name = "validate-defs";
var description = exports.description = "Validates the structure of the definitions in the flow-typed project.";

function run() {
  var validationErrors, localDefs;
  return regeneratorRuntime.async(function run$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          if ((0, _isInFlowTypedRepo2.default)()) {
            _context.next = 3;
            break;
          }

          console.log("This command only works in a clone of flowtype/flow-typed. " + "It is a tool used to validate the library definitions flow-typed project.");
          return _context.abrupt("return", 1);

        case 3:
          validationErrors = new Map();
          _context.next = 6;
          return regeneratorRuntime.awrap((0, _libDefs.getLocalLibDefs)(validationErrors));

        case 6:
          localDefs = _context.sent;

          localDefs.forEach(function (def) {
            if (def.testFilePaths.length === 0) {
              validationError(def.pkgName + "_" + def.pkgVersionStr, 'Every definition file must have at least one test file!', validationErrors);
            }
          });

          console.log(" ");

          validationErrors.forEach(function (errors, pkgNameVersion) {
            console.log("Found some problems with %s:", pkgNameVersion);
            errors.forEach(function (err) {
              return console.log("  • " + err);
            });
            console.log("");
          });

          if (!(validationErrors.size === 0)) {
            _context.next = 13;
            break;
          }

          console.log("All library definitions are named and structured correctedly. " + ("(Found " + localDefs.length + ")"));
          return _context.abrupt("return", 0);

        case 13:
          return _context.abrupt("return", 1);

        case 14:
        case "end":
          return _context.stop();
      }
    }
  }, null, this);
};
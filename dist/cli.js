#!/usr/bin/env node
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.runCLI = runCLI;

var _yargs = require("yargs");

var _yargs2 = _interopRequireDefault(_yargs);

var _node = require("./lib/node.js");

var _install = require("./commands/install.js");

var Install = _interopRequireWildcard(_install);

var _createStub = require("./commands/create-stub.js");

var CreateStub = _interopRequireWildcard(_createStub);

var _runTests = require("./commands/runTests.js");

var RunTests = _interopRequireWildcard(_runTests);

var _search = require("./commands/search.js");

var Search = _interopRequireWildcard(_search);

var _update = require("./commands/update.js");

var Update = _interopRequireWildcard(_update);

var _updateCache = require("./commands/update-cache");

var UpdateCache = _interopRequireWildcard(_updateCache);

var _validateDefs = require("./commands/validateDefs.js");

var ValidateDefs = _interopRequireWildcard(_validateDefs);

var _version = require("./commands/version.js");

var Version = _interopRequireWildcard(_version);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (!global.__flowTypedBabelPolyfill) {
  require("babel-polyfill");
  global.__flowTypedBabelPolyfill = true;
}

var identity = function identity(x) {
  return x;
};

function runCLI() {
  var commands = [CreateStub, Install, RunTests, Search, Update, UpdateCache, ValidateDefs, Version];

  commands.reduce(function (cmdYargs, cmd) {
    return cmdYargs.command(cmd.name, cmd.description, cmd.setup || identity, function (args) {
      return cmd.run(args, _yargs2.default).catch(function (err) {
        if (err.stack) {
          console.log('UNCAUGHT ERROR: %s', err.stack);
        } else if ((typeof err === "undefined" ? "undefined" : _typeof(err)) === 'object' && err !== null) {
          console.log("UNCAUGHT ERROR: %s", JSON.stringify(err, null, 2));
        } else {
          console.log("UNCAUGHT ERROR:", err);
        }
        process.exit(1);
      }).then(function (code) {
        return process.exit(code);
      });
    });
  }, _yargs2.default).demand(1).strict().help('h').alias('h', 'help').argv;
}

/**
 * Look to see if the CWD is within an npm project. If it is, and that project
 * has a flow-typed CLI `npm install`ed, use that version instead of the global
 * version of the CLI.
 */
// $FlowFixMe: Need to teach Flow about `require.main`
if (require.main === module) {
  var CWD = process.cwd();
  var currDir = CWD;
  var lastDir = null;
  while (currDir !== lastDir) {
    var localCLIPath = _node.path.join(currDir, 'node_modules', '.bin', 'flow-typed');
    try {
      if (_node.fs.statSync(localCLIPath).isFile()) {
        exports.runCLI = runCLI = require.call(null, localCLIPath).runCLI;
        break;
      }
    } catch (e) {/* File doesn't exist, move up a dir... */}
    lastDir = currDir;
    currDir = _node.path.resolve(currDir, '..');
  }
  runCLI();
}
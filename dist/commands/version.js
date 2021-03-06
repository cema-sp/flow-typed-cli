"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.description = exports.name = undefined;
exports.setup = setup;
exports.run = run;

var _node = require("../lib/node.js");

var name = exports.name = "version";

var description = exports.description = "Prints the CLI version.";
function setup(yargs) {
  return yargs.options({
    showDelegatorVersion: {
      alias: 'g',
      demand: false,
      describe: 'Include info about the globally-installed CLI if the ' + 'it delegated to a local package-installed version of the ' + 'CLI.',
      type: 'boolean'
    }
  }).strict();
};
function run(argv) {
  var runningCliVersion, suffix, executedCLIPkgJsonPath, executedCLIVersion;
  return regeneratorRuntime.async(function run$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          runningCliVersion = require('../../package.json').version;
          suffix = '';

          if (argv.showDelegatorVersion) {
            executedCLIPkgJsonPath = _node.path.resolve(require.main.filename, '..', '..', 'package.json');
            executedCLIVersion = require.call(null, executedCLIPkgJsonPath).version;

            suffix = "\n(delegated from global flow-typed@" + executedCLIVersion + ")";
          }

          console.log("flow-typed@" + runningCliVersion + suffix);
          return _context.abrupt("return", 0);

        case 5:
        case "end":
          return _context.stop();
      }
    }
  }, null, this);
};
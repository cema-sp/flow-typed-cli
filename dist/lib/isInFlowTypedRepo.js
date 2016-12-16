"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = isInFlowTypedRepo;
function isInFlowTypedRepo() {
  return (/\/flow-typed/.test(process.cwd())
  );
}
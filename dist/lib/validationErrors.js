"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validationError = validationError;
function validationError(errKey, errMsg, validationErrs) {
  if (validationErrs) {
    var errors = validationErrs.get(errKey) || [];
    errors.push(errMsg);
    validationErrs.set(errKey, errors);
  } else {
    throw new Error(errKey + ": " + errMsg);
  }
}
#!/usr/bin/env node
'use strict';

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _minimist = require('minimist');

var _minimist2 = _interopRequireDefault(_minimist);

var _index = require('./index');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('babel-register');

var debug = (0, _debug2.default)('ache');
var argv = (0, _minimist2.default)(process.argv.slice(2));
if (argv['ache-verbose']) _debug2.default.enable('ache');
if (argv['ache-verbose']) argv['ache-error'] = true;
debug('starting');

(0, _index.acheCommand)().catch(function (e) {
  if (argv['ache-error']) {
    console.error(e);
  } else {
    console.log('error: %s', e.message);
  }
});
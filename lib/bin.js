#!/usr/bin/env node
'use strict';

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _index = require('./index');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('babel-register');

var debug = (0, _debug2.default)('ache');
debug('starting');

(0, _index.acheCommand)().then(console.log).catch(function (e) {
  return debug('error: %s', e.message);
});
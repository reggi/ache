'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

exports.requireDirectory = requireDirectory;
exports.getFlattenArrayOfObjects = getFlattenArrayOfObjects;
exports.getAbsolutePathDirContents = getAbsolutePathDirContents;
exports.getMatchingFiles = getMatchingFiles;
exports.getNearestFiles = getNearestFiles;
exports.getNearestAchefiles = getNearestAchefiles;
exports.getAchefileModules = getAchefileModules;
exports.getCwd = getCwd;
exports.acheCommand = acheCommand;

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _minimist = require('minimist');

var _minimist2 = _interopRequireDefault(_minimist);

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _decamelize = require('decamelize');

var _decamelize2 = _interopRequireDefault(_decamelize);

var _lodash = require('lodash');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fsPromise = require('fs-promise');

var _fsPromise2 = _interopRequireDefault(_fsPromise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var argv = (0, _minimist2.default)(process.argv.slice(2));
if (argv['ache-verbose']) _debug2.default.enable('ache');
var spawn = _child_process2.default.spawn;
var debug = (0, _debug2.default)('ache');

function requireDirectory(dirLocation) {
  var files, allExports;
  return _regenerator2.default.async(function requireDirectory$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return _regenerator2.default.awrap(_fsPromise2.default.readdir(dirLocation));

        case 2:
          files = _context.sent;
          allExports = {};

          files.forEach(function (file) {
            var val = require(_path2.default.join(dirLocation, file));
            (0, _lodash.assign)(allExports, val);
          });
          return _context.abrupt('return', allExports);

        case 6:
        case 'end':
          return _context.stop();
      }
    }
  }, null, this);
}

function getFlattenArrayOfObjects(arr) {
  return _lodash.extend.apply(null, [{}].concat(arr));
}

function getAbsolutePathDirContents(dirContents, location) {
  var result = dirContents.map(function (item) {
    return (0, _defineProperty3.default)({}, item, _path2.default.resolve(location, item));
  });
  return getFlattenArrayOfObjects(result);
}

function getMatchingFiles(dirContents, query) {
  var requestedFiles = (0, _lodash.keys)(query);
  return (0, _lodash.pickBy)(dirContents, function (path, name) {
    return (0, _lodash.includes)(requestedFiles, name);
  });
}

function getNearestFiles(startingLocation, query) {
  var dirContents, matching, requestedFiles, matchingFiles, oneDirUp;
  return _regenerator2.default.async(function getNearestFiles$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return _regenerator2.default.awrap(_fsPromise2.default.readdir(startingLocation));

        case 2:
          dirContents = _context2.sent;

          dirContents = getAbsolutePathDirContents(dirContents, startingLocation);
          matching = getMatchingFiles(dirContents, query);
          requestedFiles = (0, _lodash.keys)(query);
          matchingFiles = (0, _lodash.keys)(matching);

          if (!matchingFiles.length) {
            _context2.next = 9;
            break;
          }

          return _context2.abrupt('return', matching);

        case 9:
          oneDirUp = _path2.default.resolve(startingLocation, '..');

          if (!(oneDirUp == '/')) {
            _context2.next = 12;
            break;
          }

          return _context2.abrupt('return', []);

        case 12:
          return _context2.abrupt('return', getNearestFiles(oneDirUp, query));

        case 13:
        case 'end':
          return _context2.stop();
      }
    }
  }, null, this);
}

function getNearestAchefiles(cwd) {
  return _regenerator2.default.async(function getNearestAchefiles$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          return _context3.abrupt('return', getNearestFiles(cwd, {
            'achefiles': 'directory',
            'achefile.js': 'file'
          }));

        case 1:
        case 'end':
          return _context3.stop();
      }
    }
  }, null, this);
}

function getAchefileModules(cwd) {
  var achefiles, finalModules, dirModules;
  return _regenerator2.default.async(function getAchefileModules$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return _regenerator2.default.awrap(getNearestAchefiles(cwd));

        case 2:
          achefiles = _context4.sent;
          finalModules = {};

          if (!achefiles['achefiles']) {
            _context4.next = 9;
            break;
          }

          _context4.next = 7;
          return _regenerator2.default.awrap(requireDirectory(achefiles['achefiles']));

        case 7:
          dirModules = _context4.sent;

          (0, _lodash.assign)(finalModules, dirModules);

        case 9:
          if (achefiles['achefile.js']) {
            (0, _lodash.assign)(finalModules, require(achefiles['achefile.js']));
          }
          return _context4.abrupt('return', (0, _lodash.mapKeys)(finalModules, function (value, key) {
            return (0, _decamelize2.default)(key, '-');
          }));

        case 11:
        case 'end':
          return _context4.stop();
      }
    }
  }, null, this);
}

function getCwd(cwd, argvCwd) {
  if (argvCwd && _path2.default.isAbsolute(argvCwd)) return argvCwd;
  if (argvCwd) return _path2.default.join(cwd, argvCwd);
  return cwd;
}

function acheCommand() {
  var argv, cwd, acheTarget, acheScope, acheCwd, scripts, script, child;
  return _regenerator2.default.async(function acheCommand$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          argv = (0, _minimist2.default)(process.argv.slice(2));
          cwd = getCwd(process.cwd(), argv.C);
          acheTarget = argv._[0];

          debug('argv %s', (0, _stringify2.default)(argv));
          debug('cwd %s', cwd);
          acheScope = argv['ache-scope'] ? _path2.default.resolve(argv['ache-scope']) : cwd;
          acheCwd = argv['ache-cwd'] ? _path2.default.resolve(argv['ache-cwd']) : cwd;

          debug('ache scope %s', acheScope);
          debug('ache cwd %s', acheCwd);
          _context5.next = 11;
          return _regenerator2.default.awrap(getAchefileModules(acheScope));

        case 11:
          scripts = _context5.sent;

          debug('commands %s', (0, _lodash.keys)(scripts).join(', '));
          script = scripts[acheTarget];

          if ((0, _lodash.size)(scripts)) {
            _context5.next = 16;
            break;
          }

          throw new Error('no available commands');

        case 16:
          if (!argv['ache-list']) {
            _context5.next = 18;
            break;
          }

          return _context5.abrupt('return', console.log((0, _lodash.keys)(scripts).map(function (script) {
            return '  ' + script;
          }).join('\n')));

        case 18:
          if (script) {
            _context5.next = 20;
            break;
          }

          throw new Error('no command "' + acheTarget + '" found');

        case 20:
          if (!argv['ache-dry-run']) {
            _context5.next = 22;
            break;
          }

          return _context5.abrupt('return', console.log(script));

        case 22:
          child = spawn('/bin/sh', ['-c', script], {
            cwd: acheCwd,
            stdio: 'inherit',
            env: process.env
          });

        case 23:
        case 'end':
          return _context5.stop();
      }
    }
  }, null, this);
}

//
// console.log(child.stdout)
// console.log(child.stderr)
// console.log(child)
//
// child.stdout.on('data', function (data) {
//   console.log(data.toString('ascii'))
// });
//
// child.stderr.on('data', function (data) {
//   console.log(data.toString('ascii'))
// });
//
// child.on('close', (code) => {
//   debug('done')
// });

// console.log(process.env.DEBUG)
// console.log('meow')

// let child = exec(script, {
//   shell: true,
//   stdio: 'inherit',
//   env: process.env
// }, (err, value) => {
//   // if (err) return Promise.reject(err)
//   // return Promise.resolve(true)
// })
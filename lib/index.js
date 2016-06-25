'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

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
exports.runCommand = runCommand;
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

var execAsync = _bluebird2.default.promisify(_child_process2.default.exec);
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

function runCommand(cwd, acheTarget) {
  var targets, script, exec;
  return _regenerator2.default.async(function runCommand$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.next = 2;
          return _regenerator2.default.awrap(getAchefileModules(cwd));

        case 2:
          targets = _context5.sent;
          script = targets[acheTarget];

          if (script) {
            _context5.next = 7;
            break;
          }

          if ((0, _lodash.keys)(targets).length) {
            debug('avalable commands %s', (0, _lodash.keys)(targets).join(', '));
          } else {
            debug('no available commands');
          }
          throw new Error('no command "' + acheTarget + '" found');

        case 7:
          _context5.next = 9;
          return _regenerator2.default.awrap(execAsync(script));

        case 9:
          exec = _context5.sent;
          return _context5.abrupt('return', exec);

        case 11:
        case 'end':
          return _context5.stop();
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
  var argv, cwd;
  return _regenerator2.default.async(function acheCommand$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          argv = (0, _minimist2.default)(process.argv.slice(2));
          cwd = getCwd(process.cwd(), argv.C);

          debug(argv);
          debug(cwd);

          if (!(argv._[0] === 'list')) {
            _context6.next = 9;
            break;
          }

          _context6.next = 7;
          return _regenerator2.default.awrap(getAchefileModules(cwd));

        case 7:
          _context6.t0 = _context6.sent;
          return _context6.abrupt('return', (0, _lodash.keys)(_context6.t0));

        case 9:
          return _context6.abrupt('return', runCommand(cwd, argv._[0]));

        case 10:
        case 'end':
          return _context6.stop();
      }
    }
  }, null, this);
}
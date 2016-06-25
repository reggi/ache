import Debug from 'debug'
import minimist from 'minimist'
import child_process from 'child_process'
import Promise from 'bluebird'
import decamelize from 'decamelize'
import { assign, includes, keys, pickBy, extend, mapKeys } from 'lodash'
import path from 'path'
import fs from 'fs-promise'
const execAsync = Promise.promisify(child_process.exec)
const debug = Debug('ache')

export async function requireDirectory (dirLocation) {
  let files = await fs.readdir(dirLocation)
  let allExports = {}
  files.forEach(file => {
    let val = require(path.join(dirLocation, file))
    assign(allExports, val)
  })
  return allExports
}

export function getFlattenArrayOfObjects (arr) {
  return extend.apply(null, [{}].concat(arr));
}

export function getAbsolutePathDirContents (dirContents, location) {
  let result = dirContents.map(item => {
    return {
      [item]: path.resolve(location, item)
    }
  })
  return getFlattenArrayOfObjects(result)
}

export function getMatchingFiles (dirContents, query) {
  let requestedFiles = keys(query)
  return pickBy(dirContents, (path, name) => {
    return includes(requestedFiles, name)
  })
}

export async function getNearestFiles (startingLocation, query) {
  let dirContents = await fs.readdir(startingLocation)
  dirContents = getAbsolutePathDirContents(dirContents, startingLocation)
  let matching = getMatchingFiles(dirContents, query)
  let requestedFiles = keys(query)
  let matchingFiles = keys(matching)
  if (matchingFiles.length) return matching
  let oneDirUp = path.resolve(startingLocation, '..')
  if (oneDirUp == '/') return []
  return getNearestFiles(oneDirUp, query)
}

export async function getNearestAchefiles (cwd) {
  return getNearestFiles(cwd, {
    'achefiles': 'directory',
    'achefile.js': 'file'
  })
}

export async function getAchefileModules (cwd) {
  let achefiles = await getNearestAchefiles(cwd)
  let finalModules = {}
  if (achefiles['achefiles']) {
    let dirModules = await requireDirectory(achefiles['achefiles'])
    assign(finalModules, dirModules)
  }
  if (achefiles['achefile.js']) {
    assign(finalModules, require(achefiles['achefile.js']))
  }
  return mapKeys(finalModules, (value, key) => {
    return decamelize(key, '-');
  })
}

export async function runCommand (cwd, acheTarget) {
  let targets = await getAchefileModules(cwd)
  let script = targets[acheTarget]
  if (!script) {
    if (keys(targets).length) {
      debug('avalable commands %s', keys(targets).join(', '))
    } else {
      debug('no available commands')
    }
    throw new Error(`no command "${acheTarget}" found`)
  }
  let exec = await execAsync(script)
  return exec
}

export function getCwd (cwd, argvCwd) {
  if (argvCwd && path.isAbsolute(argvCwd)) return argvCwd
  if (argvCwd) return path.join(cwd, argvCwd)
  return cwd
}

export async function acheCommand () {
  const argv = minimist(process.argv.slice(2))
  const cwd = getCwd(process.cwd(), argv.C)
  debug(argv)
  debug(cwd)
  if (argv._[0] === 'list') return keys(await getAchefileModules(cwd))
  return runCommand(cwd, argv._[0])
}

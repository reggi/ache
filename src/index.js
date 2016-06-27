import Debug from 'debug'
import minimist from 'minimist'
import child_process from 'child_process'
import Promise from 'bluebird'
import decamelize from 'decamelize'
import { size, assign, includes, keys, pickBy, extend, mapKeys } from 'lodash'
import path from 'path'
import fs from 'fs-promise'
const argv = minimist(process.argv.slice(2))
if (argv['ache-verbose']) Debug.enable('ache')
const spawn = child_process.spawn
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

export function getCwd (cwd, argvCwd) {
  if (argvCwd && path.isAbsolute(argvCwd)) return argvCwd
  if (argvCwd) return path.join(cwd, argvCwd)
  return cwd
}

export async function acheCommand () {
  const argv = minimist(process.argv.slice(2))
  const cwd = getCwd(process.cwd(), argv.C)
  const acheTarget = argv._[0]
  debug('argv %s', JSON.stringify(argv))
  debug('cwd %s', cwd)
  const acheScope = (argv['ache-scope']) ? path.resolve(argv['ache-scope']) : cwd
  const acheCwd = (argv['ache-cwd']) ? path.resolve(argv['ache-cwd']) : cwd
  debug('ache scope %s', acheScope)
  debug('ache cwd %s', acheCwd)
  let scripts = await getAchefileModules(acheScope)
  debug('commands %s', keys(scripts).join(', '))
  let script = scripts[acheTarget]
  if (!size(scripts)) throw new Error('no available commands')
  if (argv['ache-list']) return console.log(keys(scripts).map(script => `  ${script}`).join('\n'))
  if (!script) throw new Error(`no command "${acheTarget}" found`)
  if (argv['ache-dry-run']) return console.log(script)
  const child = spawn('/bin/sh', [ '-c',  script], {
    cwd: acheCwd,
    stdio: 'inherit',
    env: process.env
  })
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

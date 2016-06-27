#!/usr/bin/env node
require('babel-register')
import Debug from 'debug'
import minimist from 'minimist'
import { acheCommand } from './index'
const debug = Debug('ache')
const argv = minimist(process.argv.slice(2))
if (argv['ache-verbose']) Debug.enable('ache')
if (argv['ache-verbose']) argv['ache-error'] = true
debug('starting')

acheCommand()
  .catch(e => {
    if (argv['ache-error']) {
      console.error(e)
    } else {
      console.log('error: %s', e.message)
    }
  })

#!/usr/bin/env node
require('babel-register')
import Debug from 'debug'
import { acheCommand } from './index'
const debug = Debug('ache')
debug('starting')

acheCommand()
  .then(console.log)
  .catch(e => debug('error: %s', e.message))

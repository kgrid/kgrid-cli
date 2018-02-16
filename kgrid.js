#!/usr/bin/env node
//var request = require('superagent')
//var co = require('co')
//var prompt = require('co-prompt')
var program = require('commander')
//var exec = require('child_process').exec
//var spawn = require('child_process').spawn
//var child=null

program
  .version('0.0.1')
  .command('package [options]','package the knowledge object')
  .command('init <template-name> <project-name> [object-name]','initialize the knowledge object from Github template')
  .command('run [options] [port]','start the activator')
  .command('login','log in to Kgrid library2')
  .command('install','install the needed kgrid components')
  .command('list','listing utility')
  .parse(process.argv)

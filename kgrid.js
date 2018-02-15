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
  .command('init <template-name> [project-name]','Run the knowledge objects in the activator')
  .command('run ["username"]','Run the knowledge objects in the activator')
  .command('login ["username","password"]','Log in to Kgrid library2')
  .parse(process.argv)
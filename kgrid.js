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
  .command('package','package the knowledge object and load onto the shelf in the activator')
  .command('init <template-name> [object-name]','Initialize the knowledge object from Github template and prepare the activator')
  .command('run ["username"]','Run the knowledge objects in the activator')
  .command('login ["username","password"]','Log in to Kgrid library2')
  .parse(process.argv)
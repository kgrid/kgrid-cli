#!/usr/bin/env node
const program = require('commander')

program
  .version('0.0.2')
  .name('kgrid')
  .command('package [options]','package the knowledge object')
  .command('init <template-name> <project-name> [object-name]','initialize the knowledge object from Github template')
  .command('run [options] [port]','start the activator')
  .command('login','log in to Kgrid library2')
  .command('install','install the needed kgrid components')
  .command('list','listing utility')
  .command('extract [filename]','extract the legacy KO ')
  .parse(process.argv)

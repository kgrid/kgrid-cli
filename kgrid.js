#!/usr/bin/env node
const program = require('commander')

program
  .version('0.0.3')
  .name('kgrid')
  .command('package [options]','package the knowledge object')
  .command('init <template-name> <project-name> [object-name]','initialize the knowledge object from Github template')
  .command('run [options] [port]','start the activator')
  .command('shelfup [options] [port]','start the shelf gateway')
  .command('getko <ko>','retrieve the specified knowledge object from the shelf')
  .command('putko <ko>','upload the specified knowledge object to the shelf')
  .command('login','log in to Kgrid library2')
  .command('install','install the needed kgrid components')
  .command('list','listing utility')
  .command('extract [filename]','extract the legacy KO ')
  .parse(process.argv)

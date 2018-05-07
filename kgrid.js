#!/usr/bin/env node
const program = require('commander')

program
  .version('0.0.5')
  .name('kgrid')
  .command('create', 'create the knowledge object from the template')
  .command('setup', 'set up development runtime for the knowledge object project')
  .command('install', 'install the needed kgrid components')
  .command('run [options] [port]', 'start the activator')
  .command('list [options]', 'listing utility')
  .command('package [options]', 'package the knowledge object')
  .command('putko <ko>','upload the specified knowledge object to the shelf')
  .command('extract [filename]', 'extract the legacy KO ')
  // .command('login','log in to Kgrid library2')
  .parse(process.argv)

#!/usr/bin/env node
const program = require('commander')
const _ = require('lodash')
const chalk = require('chalk')

program
  .version('0.1.0')
  .name('kgrid')
  .command('create', 'create the knowledge object from the template')
  .command('setup', 'set up development runtime for the knowledge object project')
  .command('update', 'update package.json for the knowledge object project, create is not existing')
  .command('install', 'install the needed kgrid runtime components')
  .command('run [options] [port]', 'start the activator')
  .command('list [options]', 'listing utility')
  .command('package [options]', 'package the knowledge object')
  .command('putko <ko>', 'upload the specified knowledge object to the shelf')
  .command('extract [filename]', 'extract the legacy KO ')
  // .command('login','log in to Kgrid library2')
  .parse(process.argv)

const subCmd = _.head(program.args)
const cmds = _.map(program.commands, '_name')

if (!_.includes(cmds, subCmd)) {
  console.log(chalk.white.inverse('Error') + ' Unkown Command: ' + subCmd)
  program.help()
}

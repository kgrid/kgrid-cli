#!/usr/bin/env node
const program = require('commander')
const _ = require('lodash')
const chalk = require('chalk')

program
  .version('0.2.0')
  .name('kgrid')
  .command('create', 'create the knowledge object from the template')
  .command('install', 'install the needed kgrid runtime components')
  .command('update', 'update package.json for the knowledge object project, create is not existing')
  .command('package [options]', 'package the knowledge object')
  // .command('login','log in to Kgrid library2')
  .parse(process.argv)

const subCmd = _.head(program.args)
const cmds = _.map(program.commands, '_name')

if (!_.includes(cmds, subCmd)) {
  console.log(chalk.white.inverse('Error') + ' Unkown Command: ' + subCmd)
  program.help()
}

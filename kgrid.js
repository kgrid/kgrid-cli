#!/usr/bin/env node
const program = require('commander')
const _ = require('lodash')
const chalk = require('chalk')

program
  .version('0.2.0')
  .name('kgrid')
  .command('create', 'create a KGrid project with a knowledge object from the template, or create a new knowledge object in a exisitng project.')
  .command('install', 'install the dependency components')
  .command('update', 'update package.json for the knowledge object project, create if not existing')
  // .command('package [options]', 'package the knowledge object')
  // .command('login','log in to Kgrid library2')
  .parse(process.argv)

const subCmd = _.head(program.args)
const cmds = _.map(program.commands, '_name')

if (!_.includes(cmds, subCmd)) {
  console.log(chalk.white.inverse('Error') + ' Unkown Command: ' + subCmd)
  program.help()
}

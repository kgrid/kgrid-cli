const {Command, flags} = require('@oclif/command')
const addImplementation = require('../add_implementation')

class InitCommand extends Command {
  async run() {
    const {flags} = this.parse(InitCommand)
    let version = flags.version || ''
    await addImplementation(version)
    this.log('The implementation of ' + version + ' has been added.')
  }
}

InitCommand.description = 'Add an implementation to the knowledge object.'

InitCommand.flags = {
  version: flags.string({char: 'v'}),
}

module.exports = InitCommand

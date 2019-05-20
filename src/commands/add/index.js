const {Command, flags} = require('@oclif/command')
const addImplementation = require('../../add_implementation')

class AddCommand extends Command {
  async run() {
    this.log('KGrid CLI v'+this.config.version+'\n')
    const {flags} = this.parse(AddCommand)
    let implementation = flags.implementation || ''
    addImplementation('',implementation,'simple')
  }
}

AddCommand.description = 'Add an implementation to the knowledge object.'

AddCommand.flags = {
  implementation: flags.string({char: 'i'}),
}

AddCommand.aliases = ['add:simple']

module.exports = AddCommand

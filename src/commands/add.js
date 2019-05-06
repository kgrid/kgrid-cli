const {Command, flags} = require('@oclif/command')
const addImplementation = require('../add_implementation')

class AddCommand extends Command {
  async run() {
    const {flags} = this.parse(AddCommand)
    let version = flags.version || ''
    await addImplementation(version)
  }
}

AddCommand.description = 'Add an implementation to the knowledge object.'

AddCommand.flags = {
  version: flags.string({char: 'v'}),
}

module.exports = AddCommand

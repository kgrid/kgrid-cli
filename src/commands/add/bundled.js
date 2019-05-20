const {Command, flags} = require('@oclif/command')
const addImplementation = require('../../add_implementation')

class BundledCommand extends Command {
  async run() {
    this.log('KGrid CLI v'+this.config.version+'\n')
    const {flags} = this.parse(BundledCommand)
    let implementation = flags.implementation || ''
    addImplementation('',implementation,'bundled')
  }
}

BundledCommand.description = 'Add an implementation to the knowledge object.'

BundledCommand.flags = {
  implementation: flags.string({char: 'i'}),
}

module.exports = BundledCommand

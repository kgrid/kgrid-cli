const {Command, flags} = require('@oclif/command')
const runKgrid = require('../../run_kgrid')

class ActivatorCommand extends Command {
  async run() {
    const {flags} = this.parse(ActivatorCommand)
    let shelf = flags.shelf || ''
    let port = flags.port || 8082
    let cmdObj = {component:'kgrid-activator.jar', shelf: shelf, port: port}
    runKgrid(cmdObj)
  }
}

ActivatorCommand.description = 'Start KGrid Activator'

ActivatorCommand.flags = {
  shelf: flags.string({char: 's'}),
  port: flags.string({char:'p'}),
}

module.exports = ActivatorCommand

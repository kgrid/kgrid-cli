const {Command, flags} = require('@oclif/command')
const runKgrid = require('../../run_kgrid')

class StartCommand extends Command {
  async run() {
    const {flags} = this.parse(StartCommand)
    let shelf = flags.shelf || ''
    let libraryObj = {component:'kgrid-library.jar', shelf: shelf, port: 8081}
    let activatorObj = {component:'kgrid-activator.jar', shelf: shelf, port: 8082}
    runKgrid(libraryObj)
    runKgrid(activatorObj)
  }
}

StartCommand.description = 'Start KGrid Component'

StartCommand.flags = {
  shelf: flags.string({char: 's'}),
}

module.exports = StartCommand

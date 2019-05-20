const {Command, flags} = require('@oclif/command')
const runKgrid = require('../../run_kgrid')

class StartCommand extends Command {
  async run() {
    const {flags} = this.parse(StartCommand)
    this.log('KGrid CLI v'+this.config.version+'\n')
    let shelf = flags.shelf || ''
    let libraryObj = {name:'library', component:'', shelf: shelf, port: 8081}
    let activatorObj = {name:'activator', component:'', shelf: shelf, port: 8082}
    runKgrid(libraryObj)
    runKgrid(activatorObj)
  }
}

StartCommand.description = 'Start KGrid'

StartCommand.flags = {
  shelf: flags.string({char: 's'}),
}

module.exports = StartCommand

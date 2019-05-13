const {Command, flags} = require('@oclif/command')
const runKgrid = require('../../run_kgrid')

class ActivatorCommand extends Command {
  async run() {
    const {args, flags} = this.parse(ActivatorCommand)
    let shelf = flags.shelf || ''
    let port = flags.port || 8082
    let jar = flags.jarfile || ''
    let cmdObj = {name:'activator',component: jar, shelf: shelf, port: port}
    runKgrid(cmdObj)
  }
}

ActivatorCommand.description = 'Start KGrid Activator'

ActivatorCommand.flags = {
  shelf: flags.string({char: 's'}),
  port: flags.string({char: 'p'}),
  jarfile: flags.string({char: 'j'}),
}

module.exports = ActivatorCommand

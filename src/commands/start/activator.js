const {Command, flags} = require('@oclif/command')
const runKgrid = require('../../run_kgrid')
const documentations = require('../../extradoc.json')

class ActivatorCommand extends Command {
  async run() {
    const {args, flags} = this.parse(ActivatorCommand)
    this.log('KGrid CLI v'+this.config.version+'\n')
    let shelf = flags.shelf || ''
    let port = flags.port || ''
    let jar = flags.jarfile || ''
    let cmdObj = {name:'activator',component: jar, shelf: shelf, port: port}
    runKgrid(cmdObj)
  }
}

ActivatorCommand.description = `Start KGrid Activator.
${documentations.startactivator}
`
ActivatorCommand.flags = {
  shelf: flags.string({char: 's'}),
  port: flags.string({char: 'p'}),
  jarfile: flags.string({char: 'j'}),
}

module.exports = ActivatorCommand

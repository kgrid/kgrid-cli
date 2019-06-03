const {Command, flags} = require('@oclif/command')
const runKgrid = require('../../run_kgrid')
const documentations = require('../../json/extradoc.json')

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

StartCommand.description = `Start Both KGrid Activator and KGrid Library.
${documentations.start}
`

StartCommand.flags = {
  shelf: flags.string({char: 's', description:'Specify an absolute path to use as the shelf containing KOs'}),
}

module.exports = StartCommand

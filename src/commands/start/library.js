const {Command, flags} = require('@oclif/command')
const runKgrid = require('../../run_kgrid')

class LibraryCommand extends Command {
  async run() {
    const {flags} = this.parse(LibraryCommand)
    this.log('KGrid CLI v'+this.config.version+'\n')
    let shelf = flags.shelf || ''
    let port = flags.port || ''
    let jar = flags.jarfile || ''
    let cmdObj = {name:'library',component: jar, shelf: shelf, port: port}
    runKgrid(cmdObj)
  }
}

LibraryCommand.description = 'Start KGrid Library'

LibraryCommand.flags = {
  shelf: flags.string({char: 's'}),
  port: flags.string({char:'p'}),
  jarfile: flags.string({char: 'j'})
}

module.exports = LibraryCommand

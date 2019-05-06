const {Command, flags} = require('@oclif/command')
const runKgrid = require('../../run_kgrid')

class LibraryCommand extends Command {
  async run() {
    const {flags} = this.parse(LibraryCommand)
    let shelf = flags.shelf || ''
    let port = flags.port || 8081
    let jar = flags.jarfile || 'kgrid-library.jar'
    let cmdObj = {component: jar, shelf: shelf, port: port}
    await runKgrid(cmdObj)
  }
}

LibraryCommand.description = 'Start KGrid Library'

LibraryCommand.flags = {
  shelf: flags.string({char: 's'}),
  port: flags.string({char:'p'}),
  jarfile: flags.string({char: 'j'})
}

module.exports = LibraryCommand
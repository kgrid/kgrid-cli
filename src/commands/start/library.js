const {Command, flags} = require('@oclif/command')
const runKgrid = require('../../run_kgrid')
const documentations = require('../../json/extradoc.json')

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

LibraryCommand.description = `Start KGrid Library.
${documentations.startlibrary}
`

LibraryCommand.flags = {
  shelf: flags.string({char: 's', description:'Specify an absolute path to use as the shelf containing KOs'}),
  port: flags.string({char:'p', description:'Specify the port for KGRID Library'}),
  jarfile: flags.string({char: 'j', description:'Specify the library JAR file to use other than the installed one'})
}

module.exports = LibraryCommand

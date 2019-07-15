const {Command, flags} = require('@oclif/command')
const fs = require('fs-extra')
const runKgrid = require('../../run_kgrid')
const documentations = require('../../json/extradoc.json')
const userConfig = require('../../user_config')
const kVersion = require('../../check_kgridversion')

class LibraryCommand extends Command {
  async run() {
    const {flags} = this.parse(LibraryCommand)
    const userConfigJson =  userConfig()
    let khome = await kVersion('library')
    let library_port = ''
    if(userConfigJson){
      if(userConfigJson.devDefault.library_port!=''){
        library_port  = userConfigJson.devDefault.library_port
      }
    }
    let shelf = flags.shelf || ''
    let port = flags.port || library_port
    let jar = flags.jarfile || ''
    let cmdObj = {name:'library',component: jar, shelf: shelf, port: port, khome:khome}
    if(fs.pathExistsSync(khome)){
      runKgrid(cmdObj)
    } else {
      console.log('KGRID components are not installed. Please run "kgrid setup".\n')
    }
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

const {Command, flags} = require('@oclif/command')
const fs = require('fs-extra')
const runKgrid = require('../../run_kgrid')
const documentations = require('../../json/extradoc.json')
const userConfig = require('../../user_config')
const kVersion = require('../../check_kgridversion')

class LibraryCommand extends Command {
  async run() {
    const {flags} = this.parse(LibraryCommand)
    let khome = await kVersion('library')
    if(fs.pathExistsSync(khome)){
      const userConfigJson =  userConfig()
      let library_port = ''
      if(userConfigJson){
        library_port  = userConfigJson.devDefault.library_port
      }
      let cmdObj = {
        name:'library',
        component: flags.jarfile || '',
        shelf: flags.shelf || '',
        port: flags.port || library_port,
        manifest:flags.manifest || '',
        khome:khome
      }
      runKgrid(cmdObj)
    }
  }
}

LibraryCommand.description = `Start KGrid Library.
${documentations.startlibrary}
`
LibraryCommand.flags = {
  shelf: flags.string({char: 's', description:'Specify an absolute path to use as the shelf containing KOs'}),
  port: flags.string({char:'p', description:'Specify the port for KGRID Library'}),
  jarfile: flags.string({char: 'j', description:'Specify the library JAR file to use other than the installed one'}),
  manifest: flags.string({char: 'm', description:'Specify a URI for the manifest file to retrieving the packaged KOs'})
}
module.exports = LibraryCommand

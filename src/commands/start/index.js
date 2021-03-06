const {Command, flags} = require('@oclif/command')
const fs = require('fs-extra')
const runKgrid = require('../../run_kgrid')
const documentations = require('../../json/extradoc.json')
const userConfig = require('../../user_config')
const kVersion = require('../../check_kgridversion')

class StartCommand extends Command {
  async run() {
    const {flags} = this.parse(StartCommand)
    let khome = await kVersion('')
    if(fs.pathExistsSync(khome)){
      const userConfigJson =  userConfig()
      let library_port = 8081
      let activator_port = ""
      if(userConfigJson){
        if(userConfigJson.devDefault.library_port!=''){
          library_port  = userConfigJson.devDefault.library_port
        }
        activator_port  = userConfigJson.devDefault.activator_port
      }

      let libraryObj = {name:'library', component:'', shelf: flags.shelf || '', manifest:flags.manifest || '', port: library_port, khome:khome}
      let activatorObj = {name:'activator', component:'', shelf: flags.shelf || '', manifest:flags.manifest || '', port: activator_port, khome:khome}
      runKgrid(libraryObj)
      runKgrid(activatorObj)
    }
  }
}

StartCommand.description = `Start Both KGrid Activator and KGrid Library.
${documentations.start}
`
StartCommand.flags = {
  shelf: flags.string({char: 's', description:'Specify an absolute path to use as the shelf containing KOs'}),
  manifest: flags.string({char: 'm', description:'Specify a URI for the manifest file to retrieving the packaged KOs'})
}
module.exports = StartCommand

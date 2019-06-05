const {Command, flags} = require('@oclif/command')
const runKgrid = require('../../run_kgrid')
const documentations = require('../../json/extradoc.json')
const userConfig = require('../../user_config')

class ActivatorCommand extends Command {
  async run() {
    const {args, flags} = this.parse(ActivatorCommand)
    this.log('KGrid CLI v'+this.config.version+'\n')
    const userConfigJson =  userConfig()
    let activator_port = ''
    if(userConfigJson){
      if(userConfigJson.devDefault.activator_port!=''){
        activator_port  = userConfigJson.devDefault.activator_port
      }
    }
    let shelf = flags.shelf || ''
    let port = flags.port || activator_port
    let jar = flags.jarfile || ''
    let cmdObj = {name:'activator',component: jar, shelf: shelf, port: port}
    runKgrid(cmdObj)
  }
}

ActivatorCommand.description = `Start KGrid Activator.
${documentations.startactivator}
`
ActivatorCommand.flags = {
  shelf: flags.string({char: 's', description:'Specify an absolute path to use as the shelf containing KOs'}),
  port: flags.string({char: 'p', description:'Specify the port for KGRID Activator'}),
  jarfile: flags.string({char: 'j', description:'Specify the activator JAR file to use other than the installed one'}),
}

module.exports = ActivatorCommand

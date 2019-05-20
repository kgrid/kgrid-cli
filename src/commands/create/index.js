const {Command, flags} = require('@oclif/command')
const inquirer = require('inquirer')
const path= require('path')
const fs = require('fs-extra')
const kometaObj = require('../../template/kometadata.json')
const createImplementation = require('../../create_implementation')

var topMeta = JSON.parse(JSON.stringify(kometaObj))

class CreateCommand extends Command {
  async run() {
    this.log('KGrid CLI v'+this.config.version+'\n')
    const {args, flags} = this.parse(CreateCommand)
    let ko = args.ko
    let implementation = flags.implementation || ''
    let template = flags.bundled ? 'bundled' : 'simple'
    topMeta.hasImplementation = []
    if (ko) {
      if (fs.pathExistsSync(path.join(ko,'metadata.json'))) {
        this.log('The Knowledge Object of '+ko+' exists. \n\nAn new implementation will be added to '+ko+'\n')
        this.log('==== Add an implementation ==== ')
      } else {
        this.log('==== Create the Knowledge Object ==== ')
        fs.ensureDirSync(ko)
        // Generate Top Level Metadata
        fs.writeJsonSync(ko+'/metadata.json', topMeta, {spaces: 4})
        this.log('==== Initialize the implementation ==== ')
      }
      await createImplementation(ko, implementation, template).then(()=>{
        console.log('Ready.')
      }).catch(e=>console.log(e.message))
    } else {
      this.log('Please provide a name for your knowledge object. \nUsage: \n    kgrid create <ko>')
    }
  }
}

CreateCommand.description = 'Create the knowledge object'

CreateCommand.flags = {
  implementation: flags.string({char: 'i'}),
  bundled: flags.boolean()
}

CreateCommand.args = [
  {name:'ko'},
]

CreateCommand.aliases = ['create:simple']

module.exports = CreateCommand

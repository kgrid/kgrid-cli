const {Command, flags} = require('@oclif/command')
const inquirer = require('inquirer')
const path= require('path')
const fs = require('fs-extra')
const kometaObj = require('../../template/kometadata.json')
const createImplementation = require('../../create_implementation')
const colors = require('colors/safe');

var topMeta = JSON.parse(JSON.stringify(kometaObj))

class CreateCommand extends Command {
  async run() {
    console.log(colors.blue('KGrid CLI v'+this.config.version+'\n'))
    const {args, flags} = this.parse(CreateCommand)
    let ko = args.ko
    let implementation = flags.implementation || ''
    let flat = flags.flat || false
    let implExists = false
    // let template = flags.bundled ? 'bundled' : 'simple'
    // topMeta.hasImplementation = []
    if (ko) {
      if (fs.pathExistsSync(path.join(ko,'metadata.json'))) {
        topMeta = fs.readJsonSync(path.join(ko,'metadata.json'))
        if(implementation!='' && topMeta.hasImplementation.length>0){
          topMeta.hasImplementation.forEach(function(e){
            implExists = implExists | e.includes(implementation)
          })
        }
        if(!implExists){
          this.log('The Knowledge Object of '+ko+' exists. \n\nAn new implementation will be added to '+ko+'\n')
          console.log(colors.green('==== Add an implementation ==== '))
        }
      } else {
        this.log('==== Create the Knowledge Object ==== ')
        fs.ensureDirSync(ko)
        // Generate Top Level Metadata
        fs.writeJsonSync(ko+'/metadata.json', topMeta, {spaces: 4})
        console.log(colors.green('==== Initialize the implementation ==== '))
      }
      if(!implExists){
        await createImplementation(ko, implementation, 'simple', flat).then(()=>{
           console.log('Ready.')
        }).catch(e=>console.log(e.message))
      } else {
        console.log(colors.yellow('Path existing. Please start over with a different name for the implementation.'))
      }
    } else {
      this.log('Please provide a name for your knowledge object. \nUsage: \n    kgrid create <ko>')
    }
  }
}

CreateCommand.description = 'Create the knowledge object'

CreateCommand.flags = {
  implementation: flags.string({char: 'i'}),
  // bundled: flags.boolean()
  flat:flags.boolean({})
}

CreateCommand.args = [
  {name:'ko'},
]

CreateCommand.aliases = ['create:simple']

module.exports = CreateCommand

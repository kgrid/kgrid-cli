const {Command, flags} = require('@oclif/command')
const inquirer = require('inquirer')
const fs = require('fs-extra')
const kometaObj = require('../../template/kometadata.json')
const createImplementation = require('../../create_implementation')

var topMeta = JSON.parse(JSON.stringify(kometaObj))

class BundledCommand extends Command {
  async run() {
    this.log('KGrid CLI v'+this.config.version+'\n')
    const {args, flags} = this.parse(BundledCommand)
    let ko = args.ko
    let implementation = flags.implementation || ''
    let ready = false
    topMeta.hasImplementation = []
    let title = topMeta.title
    if (ko) {
      if (fs.pathExistsSync(ko)) {
        // this.log('Path existing. \n\nTo create a new KO, please start over with a different KO name. \n\nTo add an implementation to this KO, please run\n    cd '+ko+'\n    kgrid add')
        this.log('==== Add an implementation ==== ')

      } else {
        this.log('==== Create the Knowledge Object ==== ')
        fs.ensureDirSync(ko)

        // Generate Top Level Metadata
        topMeta.title = title
        fs.writeJsonSync(ko+'/metadata.json', topMeta, {spaces: 4})
        this.log('==== Initialize the first implementation ==== ')

        // ready = true
      }
      // if(ready){

        // process.chdir(ko)
        await createImplementation(ko, implementation,'bundled').then(()=>{
          console.log('Ready.')
        }).catch(e=>console.log(e.message))
      // }
    } else {
      this.log('Please provide a name for your knowledge object. \nUsage: \n    kgrid create <ko>')
    }
  }
}

BundledCommand.description = 'Create the knowledge object'

BundledCommand.flags = {
  implementation: flags.string({char: 'i'}),
}

BundledCommand.args = [
  {name:'ko'},
]

module.exports = BundledCommand

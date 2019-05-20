const {Command, flags} = require('@oclif/command')
const inquirer = require('inquirer')
const fs = require('fs-extra')
const kometaObj = require('../../template/kometadata.json')
const addImplementation = require('../../add_implementation')

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
        this.log('Path existing. \n\nTo create a new KO, please start over with a different KO name. \n\nTo add an implementation to this KO, please run\n    cd '+ko+'\n    kgrid add')
      } else {
        ready = true
      }
      if(ready){
        this.log('==== Create the Knowledge Object ==== ')
        fs.ensureDirSync(ko)

        // Generate Top Level Metadata
        topMeta.title = title
        fs.writeJsonSync(ko+'/metadata.json', topMeta, {spaces: 4})

        // process.chdir(ko)
        this.log('==== Initialize the first implementation ==== ')
        await addImplementation(ko, implementation,'bundled').then(()=>{
          console.log('Ready.')
        }).catch(e=>console.log(e.message))
      }
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

const {Command, flags} = require('@oclif/command')
const inquirer = require('inquirer')
const path= require('path')
const fs = require('fs-extra')
const kometaObj = require('../template/kometadata.json')
const createImplementation = require('../create_implementation')
const checkKoiotype = require('../check_koiotype')
const colors = require('colors/safe');
const documentations = require('../extradoc.json')

var topMeta = JSON.parse(JSON.stringify(kometaObj))
// var documentation = '`'+documentations.create+'`'

class CreateCommand extends Command {
  async run() {
    console.log(colors.blue('KGrid CLI v'+this.config.version+'\n'))
    const {args, flags} = this.parse(CreateCommand)
    let cwdtype = checkKoiotype()
    let ko = args.ko
    let implementation = flags.implementation || ''
    let flat = flags.flat || false
    let implExists = false
    let template = flags.bundled ? 'bundled' : 'simple'

    if(cwdtype=='shelf'){
      if (ko) {
        if (fs.pathExistsSync(path.join(ko,'metadata.json'))) {  // KO Existing
          topMeta = fs.readJsonSync(path.join(ko,'metadata.json'))
          console.log('The Knowledge Object of '+ko+' exists. \n')
          console.log('An new implementation will be added to '+ko+'\n')
          console.log(colors.green('==== Add an implementation ==== '))
        } else {    // KO not existing; create folder and write metadata
          console.log(colors.green('==== Create the Knowledge Object ==== '))
          fs.ensureDirSync(ko)
          fs.writeJsonSync(ko+'/metadata.json', topMeta, {spaces: 4})
          console.log('The first implementation will be added to '+ko+'\n')
          console.log(colors.green('==== Initialize the implementation ==== '))
        }
        if(implementation==''){
          let responses = await inquirer.prompt([
            {
              type: 'input',
              name: 'implementation',
              message: 'Implementation: ',
              default: 'implementation',
              validate: function (input) {
                if(input==''){
                  return 'Invalid Input'
                } else {
                  return !fs.pathExistsSync(path.join(ko,input)) || 'Path existing. Please provide a different name for the implementation.'
                }
              },
            },
          ])
          implementation = responses.implementation
        }
        if(topMeta.hasImplementation.length>0){
          topMeta.hasImplementation.forEach(function(e){
            let imples = e.split('/')
            implExists = implExists | implementation == imples[imples.length-1]
          })
        }
        if(!implExists){
          await createImplementation(ko, implementation, template, flat).then(()=>{
             console.log('The knowledge object is Ready.')
          }).catch(e=>console.log(e.message))
        } else {
          console.log(colors.yellow('Path existing. Please start over with a different name for the implementation.'))
        }
      } else {
        this.log('Please provide a name for your knowledge object. \nUsage: \n    kgrid create <ko>')
      }
    } else {
      let l = cwdtype=='ko' ? 'KO Level' : 'Implementation Level'
      let action = cwdtype=='ko' ? 'cd ..' : 'cd ../..'
      console.log(colors.yellow('The current directory is at ' + l +'. Please return to the shelf level by `'+action+'`'))
    }
  }
}

CreateCommand.description = `Create Knowledge Object and initialize the implementation.
${documentations.create}
`
// `Create Knowledge Object and initialize the implementation.
// The create command requires a name for the knowledge object.
// It can only run at the shelf level.
//
// A folder for the knowledge object will be created.
// An implementation will be created and initialized in the folder of [ko].
//
// If the specified KO exists, an implementation will be added to the KO.
//
// IMPLEMENTATION NAME:
//   The user will be prompted to enter a name;
//   Or, the name can be specified on the command line using the falg -i.
//
// ARK ID:
//   A development ARK ID will be assigned {username}/{ko}/{implementation}.
//   The ARK ID is unique by having different implementation names in the same KO.
//
// IMPLEMENTATION TEMPLATE TYPE:
//   The implementation will be initialized using one of the templates.
//   The template can be specified using the flags:
//     --simple    for the template with simple JAVASCRIPT file as payload
//     --bundled   for the template with JAVASCRIPT file(s); the payload will require bundling
//   By default, the simple template will be used
//
// `

CreateCommand.flags = {
  implementation: flags.string({char: 'i', description:"the name for the implementation"}),
  simple: flags.boolean({default: true, exclusive:['bundled'], description:"Using the simple template"}),
  bundled: flags.boolean({default: false, exclusive:['simple'], description:"Using the template for bundled KO"})
  // , flat: flags.boolean({})
}

CreateCommand.args = [
  {name:'ko'},
]

module.exports = CreateCommand

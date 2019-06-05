const {Command, flags} = require('@oclif/command')
const inquirer = require('inquirer')
const path= require('path')
const fs = require('fs-extra')
const kometaObj = require('../template/kometadata.json')
const createImplementation = require('../create_implementation')
const checkKoiotype = require('../check_koiotype')
const colors = require('colors/safe');
const documentations = require('../json/extradoc.json')

var topMeta = JSON.parse(JSON.stringify(kometaObj))

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
    if(flags.executive) {
      template='executive'
    }
    if(cwdtype=='shelf'){
      if (ko) {
        if( ko.includes('-') | ko.includes('/') ){
          this.log('Please provide a valid name for your knowledge object. \n\nAlphanumeric characters only.')
        } else {
          if (fs.pathExistsSync(path.join(ko,'metadata.json'))) {  // KO Existing
            topMeta = fs.readJsonSync(path.join(ko,'metadata.json'))
            console.log('The Knowledge Object of '+colors.yellow.inverse(ko)+' exists. \n')
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
        }
      } else {
        this.log('Please provide a name for your knowledge object. \n\nUSAGE: \n  $ kgrid create [ko]')
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

CreateCommand.flags = {
  implementation: flags.string({char: 'i', description:"the name for the implementation"}),
  simple: flags.boolean({default: true, exclusive:['bundled', 'executive'], description:"Using the simple template"}),
  bundled: flags.boolean({default: false, exclusive:['simple', 'executive'], description:"Using the template for bundled KO"}),
  executive: flags.boolean({default: false, exclusive:['simple','bundled'], description:"Using the template for executive KO"}),
  help: flags.help({char:'h'})
  // , flat: flags.boolean({})
}

CreateCommand.args = [
  {name:'ko'},
]

module.exports = CreateCommand

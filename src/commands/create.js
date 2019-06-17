const {Command, flags} = require('@oclif/command')
const inquirer = require('inquirer')
const path= require('path')
const fs = require('fs-extra')
const kometaObj = require('../template/kometadata.json')
const createImplementation = require('../create_implementation')
const checkPathKoioType = require('../check_pathkoiotype')
const documentations = require('../json/extradoc.json')

var topMeta = JSON.parse(JSON.stringify(kometaObj))

class CreateCommand extends Command {
  async run() {
    const {args, flags} = this.parse(CreateCommand)
    let pathtype = checkPathKoioType()
    let shelfpath = pathtype.shelfpath
    let kopath = pathtype.kopath
    let implpath = pathtype.implpath
    let ko = args.ko
    let implementation = flags.implementation || ''
    let flat = flags.flat || false
    let implExists = false
    let template = flags.bundled ? 'bundled' : 'simple'
    if(flags.executive) {
      template='executive'
    }
    if(pathtype.type=='shelf'){
      if (ko) {
        if( ko.includes('-') | ko.includes('/') ){
          console.log('Please provide a valid name for your knowledge object. \n\nAlphanumeric characters only.')
          return 1
        }
      } else {
        console.log('Please provide a name for your knowledge object. \n\nUSAGE: \n  $ kgrid create [ko]')
        return 1
      }
    } else {
      if(pathtype.type=='ko'){
        if(ko){
          if(path.join(shelfpath,ko)!=kopath){
            console.log('Current directory is the knowledge object '+path.basename(kopath)+'.\n\nThe command line input of '+ko+' will be ignored.\n')
          }
        }
        ko =path.basename(kopath)
      } else {
        if(pathtype.type=='implementation'){
          console.log('Current directory is the implementation '+path.basename(implpath)+' of the knowledge object '+path.basename(kopath)+'.\n')
          console.log('If you intend to add an implementation to '+path.basename(kopath)+'\n\n    return to the ko level by  '+'cd ..'+' and run '+'kgrid create'+'.\n')
          console.log('If you like to create a new knowledge object,\n\n    return to the shelf level by  '+'cd ../..'+' and run '+'kgrid create [ko]'+'.')
          return 1
        }
      }
    }
    if (fs.pathExistsSync(path.join(shelfpath, ko,'metadata.json'))) {  // KO Existing
      topMeta = fs.readJsonSync(path.join(shelfpath, ko,'metadata.json'))
      if(pathtype.type=='shelf') {
        console.log('The Knowledge Object of '+ko+' exists. \n')
      }
      console.log('An new implementation will be added to '+ko+'\n')
      console.log('==== Add an implementation ==== ')
    } else {    // KO not existing; create folder and write metadata
      console.log('==== Create the Knowledge Object ==== ')
      fs.ensureDirSync(path.join(shelfpath, ko))
      fs.writeJsonSync(path.join(shelfpath, ko)+'/metadata.json', topMeta, {spaces: 4})
      console.log('The first implementation will be added to '+ko+'\n')
      console.log('==== Initialize the implementation ==== ')
    }
    if(implementation==''){
      let responses = await inquirer.prompt([
        {
          type: 'input',
          name: 'implementation',
          message: 'Implementation: ',
          default: 'one',
          validate: function (input) {
            if(input==''){
              return 'Invalid Input'
            } else {
              return !fs.pathExistsSync(path.join(shelfpath,ko,input)) || 'Path existing. Please provide a different name for the implementation.'
            }
          },
        },
      ])
      implementation = responses.implementation
    }

    let topMetaImplementations = topMeta.hasImplementation;
    let implementations = []
    if(!Array.isArray(topMetaImplementations)){
      implementations.push(topMetaImplementations)
    } else {
      implementations= JSON.parse(JSON.stringify(topMetaImplementations))
    }

    if(implementations.length>0){
      implementations.forEach(function(e){
        let imples = e.split('/')
        implExists = implExists | implementation == imples[imples.length-1]
      })
    }
    if(!implExists){
      await createImplementation(shelfpath, ko, implementation, template, flat).then(()=>{
         console.log('\nThe knowledge object is Ready.')
      }).catch(e=>console.log(e.message))
    } else {
      console.log('Path existing. Please start over with a different name for the implementation.')
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

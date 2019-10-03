const {Command, flags} = require('@oclif/command')
const inquirer = require('inquirer')
const path= require('path')
const fs = require('fs-extra')
const kometaObj = require('../template/kometadata.json')
const addKOContent = require('../add_kocontent')
const documentations = require('../json/extradoc.json')
const os = require('os')
const userConfig = require('../user_config')
const parseInput = require('../parse_input')

class CreateCommand extends Command {
  async run() {
    const {args, flags} = this.parse(CreateCommand)
    let template = flags.bundled ? 'bundled' : 'simple'
    template = flags.executive? 'executive' : template
    let inputPath = { ko : args.ko || '', xxx : ''}
    if(args.ko){
      if( args.ko.includes('-') | args.ko.includes('/') ){
        console.log('Please provide a valid name for your knowledge object. \n\nAlphanumeric characters only.')
        return 1
      }
    }
    var parsedInput = parseInput ('create', null, null, null, inputPath)
    if(parsedInput==1){
      return 1
    }
    if(parsedInput.koid.naan ==''){
      parsedInput.koid.naan  = os.userInfo().username
      const userConfigJson =  userConfig()
      if(userConfigJson){
        parsedInput.koid.naan  = userConfigJson.devDefault.naan
      }
    }

    var topMeta = JSON.parse(JSON.stringify(kometaObj))
    if(fs.pathExistsSync(parsedInput.fullpath)){
      console.log('Knowledge Object already exists. Please choose a different name for the new object. \n')
      return 1
    } else {
      console.log('Creating the Knowledge Object ... \n')
      fs.ensureDirSync(parsedInput.fullpath)
      topMeta.identifier = 'ark:/' + parsedInput.koid.naan + '/' + parsedInput.koid.name
      topMeta['@id'] = parsedInput.koid.naan  + '-' + parsedInput.koid.name
      fs.writeJsonSync(path.join(parsedInput.fullpath,'metadata.json'), topMeta, {spaces: 4})
    }
    var arkid = await addKOContent(parsedInput.fullpath, parsedInput.koid, template)
    console.log('\nThe knowledge object '+ arkid+' is ready.')
  }
}

CreateCommand.description = `Create Knowledge Object.
${documentations.create}
`
CreateCommand.flags = {
  simple: flags.boolean({default: true, exclusive:['bundled', 'executive'], description:"Using the simple template"}),
  bundled: flags.boolean({default: false, exclusive:['simple', 'executive'], description:"Using the template for bundled KO"}),
  executive: flags.boolean({default: false, exclusive:['simple','bundled'], description:"Using the template for executive KO"}),
  help: flags.help({char:'h'})
}
CreateCommand.args = [
  {name:'ko'}
]
module.exports = CreateCommand

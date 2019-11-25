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
    let template = 'simplejs'
    let runtime = 'Nashorn'
    let inputPath = { naan:'', name : args.ko || '', version : ''}
    const userConfigJson =  userConfig()
    if(inputPath.naan ==''){
      inputPath.naan  = os.userInfo().username
      if(userConfigJson){
        inputPath.naan  = userConfigJson.devDefault.naan
      }
    }
    if(args.ko){
      if( args.ko.includes('-') | args.ko.includes('/') ){
        console.log('Please provide a valid name for your knowledge object. \n\nAlphanumeric characters only.')
        return 1
      }
      var parsedInput = await parseInput ('create', null, null, null, inputPath)
      // console.log(parsedInput)
      if(parsedInput==1){
        return 1
      }
      var topMeta = JSON.parse(JSON.stringify(kometaObj))
      let responses
      if(userConfigJson){
        if(userConfigJson.multiRuntime){
          responses = await inquirer.prompt([
              {
                type: 'list',
                name: 'selectedRuntime',
                message: 'Please select the target runtime: ',
                default: 0,
                scroll: false,
                choices: ['Nashorn','GraalVM','NodeJS']
              }
            ])
          runtime = responses.selectedRuntime
          console.log()
        }
      }
      if(runtime=='Nashorn' | runtime=='GraalVM'){
        responses = await inquirer.prompt([
            {
              type: 'list',
              name: 'selectedTemplate',
              message: 'Please select the template type: ',
              default: 0,
              scroll: false,
              choices: ['Simple','Bundled','Executive']
            }
          ])
          switch(responses.selectedTemplate){
            case 'Simple':
              template = 'simplejs'
              break
            case 'Bundled':
              template = 'bundlejs'
              break
            case 'Executive':
              template = 'executive'
              break
          }
          console.log()
      } else {
        template = 'bundlejs'
      }
      process.stdout.write('Creating the Knowledge Object ...\r')
      fs.ensureDirSync(parsedInput.fullpath)
      topMeta.identifier = 'ark:/' + parsedInput.koid.naan + '/' + parsedInput.koid.name
      topMeta['@id'] = parsedInput.koid.naan  + '-' + parsedInput.koid.name
      fs.writeJsonSync(path.join(parsedInput.fullpath,'metadata.json'), topMeta, {spaces: 4})

      var arkid = await addKOContent(parsedInput.fullpath, parsedInput.koid, template, runtime)
      process.stdout.write('The knowledge object '+ arkid+' has been created.\n')
      if(template=='bundlejs'&&runtime!='NodeJS'){
        console.log('\nPlease go to the folder by `cd '+args.ko+ '`.\n\nRun `npm install` and `npm run build` before deploying to the activator.')
      }else {
        console.log('\nPlease go to the folder by `cd '+args.ko+ '`.\n\nRun `npm install` before deploying to the activator.')
      }
    } else {
      console.log('Please provide a valid name for the Knowledge Object\n\n  Example: kgrid create myko')
      return 1
    }
  }
}

CreateCommand.description = `Create Knowledge Object.
${documentations.create}
`
CreateCommand.flags = {
  help: flags.help({char:'h'})
}
CreateCommand.args = [
  {name:'ko'}
]
module.exports = CreateCommand

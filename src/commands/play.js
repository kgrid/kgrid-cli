const {Command, flags} = require('@oclif/command')
const inquirer = require('inquirer')
const path= require('path')
const fs = require('fs-extra')
const axios = require('axios')
const shelljs = require('shelljs')
const kometaObj = require('../template/kometadata.json')
const createImplementation = require('../create_implementation')
const checkPathKoioType = require('../check_pathkoiotype')
const colors = require('colors/safe');
const documentations = require('../json/extradoc.json')

var topMeta = JSON.parse(JSON.stringify(kometaObj))

class PlayCommand extends Command {
  async run() {
    const {args, flags} = this.parse(PlayCommand)
    let cust_port =flags.port
    let targeturl='https://editor.swagger.io/'

    let pathtype = checkPathKoioType()
    let shelfpath = pathtype.shelfpath
    let kopath = pathtype.kopath
    let implpath = pathtype.implpath
    let ko = args.ko
    let implementation = flags.implementation || ''

    if(pathtype.type=='shelf'){
      if (ko) {
        if (fs.pathExistsSync(path.join(shelfpath, ko,'metadata.json'))) {  // KO Existing
        //   topMeta = fs.readJsonSync(path.join(shelfpath, ko,'metadata.json'))
        } else {
          // not existing
        }
      }
    } else {
      if(pathtype.type=='ko'){
        if(ko){
          if(path.join(shelfpath,ko)!=kopath){
            console.log('Current directory is the knowledge object '+colors.yellow.inverse(path.basename(kopath))+'.\n\nThe command line input of '+colors.inverse(ko)+' will be ignored.\n')
          }
        }
        ko =path.basename(kopath)
      } else {
        if(pathtype.type=='implementation'){
          console.log('Current directory is the implementation '+colors.cyan.inverse(path.basename(implpath))+' of the knowledge object '+colors.yellow.inverse(path.basename(kopath))+'.\n')
          console.log('If you intend to add an implementation to '+colors.yellow.inverse(path.basename(kopath))+'\n\n    return to the ko level by  '+colors.inverse('cd ..')+' and run '+colors.inverse('kgrid create')+'.\n')
          console.log('If you like to create a new knowledge object,\n\n    return to the shelf level by  '+colors.inverse('cd ../..')+' and run '+colors.inverse('kgrid create [ko]')+'.')
          return 1
        }
      }
    }
    // determine the url for the running activator
    let userHome = process.env.HOME || process.env.USERPROFILE || process.env.HOMEPATH ;
    let configPath = path.join(userHome,'.config')
    let userConfigFile = path.join(configPath, 'kgrid-cli-config.json')
    let userConfig
    let activator_port = 8080
    if(fs.pathExistsSync(userConfigFile)){
      userConfig = fs.readJsonSync(userConfigFile)
      if(userConfig.devDefault.activator_port!=''){
        activator_port=userConfig.devDefault.activator_port
      }
    }
    if(cust_port){
      activator_port=cust_port
    }
    let url = 'http://localhost:'+activator_port+'/'
    // Retrieve the implementation list for the KOs on the activator shelf
    let imples = []
    let targetimple =''
    axios({
      method: 'get',
      url: url,
    })
      .then(async function (response) {
        Object.keys(response.data).forEach(function(e){
          let kometa = response.data[e]
          kometa.hasImplementation.forEach(function(ie){
            imples.push(ie.replace('-','/'))
          })
        })
        if(imples.length!=0){
          let responses = await inquirer.prompt([
              {
                type: 'list',
                name: 'implementation',
                message: 'Please select an implementation: ',
                default: 'first',
                choices: imples
              },
            ])
            targetimple = responses.implementation
            targeturl = `https://editor.swagger.io/?url=${url}${targetimple}/service.yaml`
            console.log('')
            console.log(colros.inverse(targeturl))
            console.log('will be opened in your default browser.')
            shelljs.exec('start '+targeturl)
          } else {
            console.log(colors.yellow('No implementation has been activated.'))
          }
      })
      .catch(function(error){
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log(colors.yellow('Cannot connect to the activator at: '+url+'\n\nPlease make sure the activator is running and the correct port is specified to connect.\n\nUSAGE:\n    $ kgrid play -p [port]'));
        }
        // console.log(error.config);
      });



    // if (fs.pathExistsSync(path.join(shelfpath, ko,'metadata.json'))) {  // KO Existing
    //   topMeta = fs.readJsonSync(path.join(shelfpath, ko,'metadata.json'))
    //   if(pathtype.type=='shelf') {
    //     console.log('The Knowledge Object of '+colors.yellow.inverse(ko)+' exists. \n')
    //   }
    //   console.log('An new implementation will be added to '+colors.yellow.inverse(ko)+'\n')
    //   console.log(colors.green('==== Add an implementation ==== '))
    // } else {    // KO not existing; create folder and write metadata
    //   console.log(colors.green('==== Create the Knowledge Object ==== '))
    //   fs.ensureDirSync(path.join(shelfpath, ko))
    //   fs.writeJsonSync(path.join(shelfpath, ko)+'/metadata.json', topMeta, {spaces: 4})
    //   console.log('The first implementation will be added to '+colors.yellow.inverse(ko)+'\n')
    //   console.log(colors.green('==== Initialize the implementation ==== '))
    // }
    // if(implementation==''){
    //   let responses = await inquirer.prompt([
    //     {
    //       type: 'input',
    //       name: 'implementation',
    //       message: 'Implementation: ',
    //       default: 'first',
    //       validate: function (input) {
    //         if(input==''){
    //           return 'Invalid Input'
    //         } else {
    //           return !fs.pathExistsSync(path.join(shelfpath,ko,input)) || 'Path existing. Please provide a different name for the implementation.'
    //         }
    //       },
    //     },
    //   ])
    //   implementation = responses.implementation
    // }
    //
    // let topMetaImplementations = topMeta.hasImplementation;
    // let implementations = []
    // if(!Array.isArray(topMetaImplementations)){
    //   implementations.push(topMetaImplementations)
    // } else {
    //   implementations= JSON.parse(JSON.stringify(topMetaImplementations))
    // }
    //
    // if(implementations.length>0){
    //   implementations.forEach(function(e){
    //     let imples = e.split('/')
    //     implExists = implExists | implementation == imples[imples.length-1]
    //   })
    // }
    // if(!implExists){
    //   await createImplementation(shelfpath, ko, implementation, template, flat).then(()=>{
    //      console.log('\nThe knowledge object is Ready.')
    //   }).catch(e=>console.log(e.message))
    // } else {
    //   console.log(colors.yellow('Path existing. Please start over with a different name for the implementation.'))
    // }
  }
}

PlayCommand.description = `Create Knowledge Object and initialize the implementation.
${documentations.create}
`

PlayCommand.flags = {
  port: flags.string({char: 'p', description:'Specify the port for KGRID Activator'}),
  help: flags.help({char:'h'})
  // , flat: flags.boolean({})
}

PlayCommand.args = [
  {name:'ko'},
]

module.exports = PlayCommand

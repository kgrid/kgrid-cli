const {Command, flags} = require('@oclif/command')
const inquirer = require('inquirer')
const os = require('os')
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
    try{
    const {args, flags} = this.parse(PlayCommand)
    let cust_port =flags.port
    let targeturl='https://editor.swagger.io/'
    let ko = args.ko
    let srcImplementation = flags.implementation
    let pathtype = checkPathKoioType()
    let shelfpath = pathtype.shelfpath
    let kopath = pathtype.kopath
    let implpath = pathtype.implpath

    let topMeta = {}
    let koid = {naan:'',name:'',imp:''}
    if(pathtype.type=='shelf'){
      if(ko){
        kopath=path.join(pathtype.shelfpath,ko)
        if(srcImplementation){
          implpath = path.join(kopath, srcImplementation)
        }
      }
    } else {
      if(pathtype.type=='ko'){
        if(ko){
          if(path.join(shelfpath,ko)!=kopath){
            console.log('Current directory is the knowledge object '+colors.yellow.inverse(path.basename(kopath))+'.\n\nThe command line input of '+colors.inverse(ko)+' will be ignored.\n')
          }
        }
        if(srcImplementation){
          implpath = path.join(kopath, srcImplementation)
        }
      } else {
        if(pathtype.type=='implementation'){
          if(ko){
            if(srcImplementation){
              if(path.join(shelfpath,ko,srcImplementation)!=implpath){
                console.log('Current directory is the implementation '+colors.cyan.inverse(path.basename(implpath))+' of the knowledge object '+colors.yellow.inverse(path.basename(kopath))+'.\n\nThe command line input of '+colors.inverse(ko)+' and '+colors.inverse(srcImplementation)+' will be ignored.\n')
              }
            } else {
              if(path.join(shelfpath,ko)!=kopath){
                console.log('Current directory is the implementation '+colors.cyan.inverse(path.basename(implpath))+' of the knowledge object '+colors.yellow.inverse(path.basename(kopath))+'.\n\nThe command line input of '+colors.inverse(ko)+' will be ignored.\n')
              }
            }
          }
        }
      }
    }

    if(kopath!='') {
      let koMetadataPath = path.join(kopath,'metadata.json');
      let arkId='';
      if (fs.pathExistsSync(koMetadataPath)) {
        topMeta = fs.readJsonSync(koMetadataPath);
        arkId = topMeta['@id']
        koid.naan=arkId.split('-')[0]
        koid.name=arkId.split('-')[1]
      } else {
        this.log("Cannot find metadata.json for " + colors.yellow.inverse(path.basename(kopath)));
        return 1; // Error
      }
    }
    if(implpath!=''){
      koid.imp=path.basename(implpath)
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
      url: url
    })
      .then(async function (response) {
        Object.keys(response.data).forEach(function(e){
          let kometa = response.data[e]
          kometa.hasImplementation.forEach(function(ie){
            if(koid.imp!=''){
              if(ie==(koid.naan+'-'+koid.name+'/'+koid.imp)){
                imples.push(ie.replace('-','/'))
              }
            } else {
              if(koid.name!=''){
                if(ie.includes(koid.naan+'-'+koid.name)){
                  imples.push(ie.replace('-','/'))
                }
              } else {
                imples.push(ie.replace('-','/'))
              }
            }
          })
        });
        if(imples.length!=0){
          if(koid.imp==''){
            let responses = await inquirer.prompt([
                {
                  type: 'list',
                  name: 'implementation',
                  message: 'Please select an implementation: ',
                  default: 0,
                  choices: imples
                }
              ])
            targetimple = responses.implementation
          } else {
            targetimple= koid.naan+'/'+koid.name+'/'+koid.imp
          }
          targeturl = `https://editor.swagger.io/?url=${url}${targetimple}/service.yaml`
          console.log(colors.inverse(targeturl))
          console.log('will be opened in your default browser.')
          if(os.platform()=='win32'){
            shelljs.exec('start '+targeturl, {async:true})
          } else {
            shelljs.exec('open '+targeturl, {async:true})
          }
          return 0
        } else {
          console.log(colors.yellow('No implementation has been activated.'))
        }

      })
      .catch(function(error){
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log(error)
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log(colors.yellow('Cannot connect to the activator at: '+url+'\n\nPlease make sure the activator is running and the correct port is specified to connect.\n\nUSAGE:\n    $ kgrid play -p [port]'));
        }
      });
    } catch (e) {
      console.log(e)
    }
  }
}

PlayCommand.description = `Create Knowledge Object and initialize the implementation.
${documentations.play}
`

PlayCommand.flags = {
  port: flags.string({char: 'p', description:'Specify the port for KGRID Activator'}),
  implementation: flags.string({char: 'i', description:"the name for the implementation"}),
  help: flags.help({char:'h'})
  // , flat: flags.boolean({})
}

PlayCommand.args = [
  {name:'ko'},
]

module.exports = PlayCommand

const {Command, flags} = require('@oclif/command')
const inquirer = require('inquirer')
const os = require('os')
const path= require('path')
const fs = require('fs-extra')
const axios = require('axios')
const shelljs = require('shelljs')
const checkPathKoioType = require('../check_pathkoiotype')
const documentations = require('../json/extradoc.json')
const userConfig = require('../user_config')

class PlayCommand extends Command {
  async run() {
    try{
      const {args, flags} = this.parse(PlayCommand)
      let cust_port =flags.port
      let targeturl='https://editor.swagger.io/'
      let ark = args.ark
      let pathtype = checkPathKoioType()
      let shelfpath = pathtype.shelfpath
      let kopath = pathtype.kopath
      let implpath = pathtype.implpath
      let metaJSON = {}
      let koid = {naan:'',name:'',imp:''}
      let arkid= []
      if(ark) {
        arkid = ark.split('/')
        if(arkid[0]==''){
          arkid.shift()
        }
        if(arkid.length<=1){
          console.log('Please provide a valid ark id for the implementation.\n')
          console.log('  Example: kgrid play hello/world/v1')
          return 1
        }
      }
      if(pathtype.type=='shelf'){
        if(ark){
          koid.naan=arkid[0] || ''
          koid.name=arkid[1] || ''
          koid.imp=arkid[2] || ''
        }
      } else {
        if(pathtype.type=='ko'){
          let koMetadataPath = path.join(kopath,'metadata.json');
          if (fs.pathExistsSync(koMetadataPath)) {
            metaJSON = fs.readJsonSync(koMetadataPath);
            koid.naan=metaJSON['@id'].split('-')[0]
            koid.name=metaJSON['@id'].split('-')[1]
          } else {
            this.log("Cannot find metadata.json for " +path.basename(kopath));
            return 1; // Error
          }
          if(ark){
            if(koid.naan==arkid[0]&&koid.name==arkid[1]){
              koid.imp=arkid[2] || ''
            }else {
              console.log('Current directory is the knowledge object of '+koid.naan+'/'+koid.name+'.\n\nThe command line input of '+ark+' will be ignored.\n')
            }
          }
        } else {
          if(pathtype.type=='implementation'){
            let impMetadataPath = path.join(implpath,'metadata.json');
            if (fs.pathExistsSync(impMetadataPath)) {
              metaJSON = fs.readJsonSync(impMetadataPath);
              koid.naan=metaJSON.identifier.split('/')[1]
              koid.name=metaJSON.identifier.split('/')[2]
              koid.imp=metaJSON.identifier.split('/')[3]
            } else {
              this.log("Cannot find metadata.json for " +path.basename(implpath));
              return 1; // Error
            }
            if(ark){
              if(koid.naan==arkid[0]&&koid.name==arkid[1]&&koid.imp==arkid[2]){

              }else {
                console.log('Current directory is the knowledge object of '+koid.naan+'/'+koid.name+'/'+koid.imp+'.\n\nThe command line input of '+ark+' will be ignored.\n')
              }
            }
          }
        }
      }
      // determine the url for the running activator
      const userConfigJson =  userConfig()
      let activator_port = 8080
      if(userConfigJson){
        if(userConfigJson.devDefault.activator_port!=''){
          activator_port  = userConfigJson.devDefault.activator_port
        }
      }
      if(cust_port){
        activator_port=cust_port
      }
      let url = 'http://localhost:'+activator_port+'/kos/'
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
          targeturl = `https://editor.swagger.io/?url=${url}${targetimple}/service`
          console.log(targeturl)
          console.log('will be opened in your default browser.')
          if(os.platform()=='win32'){
            shelljs.exec('start '+targeturl, {async:true})
          } else {
            shelljs.exec('open '+targeturl, {async:true})
          }
          return 0
        } else {
          console.log('No implementation with ark id of '+ koid.naan+'/'+koid.name+'/'+koid.imp+' has been activated.')
        }
      })
      .catch(function(error){
        if (error.response) {
          console.log(error)
        } else {
          console.log('Cannot connect to the activator at: '+url+'\n\nPlease make sure the activator is running and the correct port is specified to connect.\n\nUSAGE:\n    $ kgrid play -p [port]');
        }
      });
    } catch (e) {
      console.log(e)
    }
  }
}

PlayCommand.description = `Try out a Knowledge Object implementation using Swagger Editor.
${documentations.play}
`

PlayCommand.flags = {
  port: flags.string({char: 'p', description:'Specify the port for KGRID Activator'}),
  help: flags.help({char:'h'})
}

PlayCommand.args = [
  {name:'ark'}
]

module.exports = PlayCommand

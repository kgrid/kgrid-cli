const {Command, flags} = require('@oclif/command')
const inquirer = require('inquirer')
const os = require('os')
const axios = require('axios')
const shelljs = require('shelljs')
const documentations = require('../json/extradoc.json')
const userConfig = require('../user_config')

class PlayCommand extends Command {
  async run() {
      const {args, flags} = this.parse(PlayCommand)
      var localurl = flags.port ? 'http://localhost:'+flags.port : flags.port
      const userConfigJson =  userConfig()
      let activator_port = 8080
      if(userConfigJson){
        if(userConfigJson.devDefault.activator_port!=''){
          activator_port  = userConfigJson.devDefault.activator_port
        }
      }
      activator_port=flags.port || activator_port
      let url = flags.url || localurl  || 'http://localhost:'+activator_port
      let openurl = flags.open
      let targeturl='https://editor.swagger.io/'
      let arkid = []
      if(args.ark){
        arkid = args.ark.split('/')
        if(arkid[0]==''){
          arkid[0]='ark:'
        } else {
            if(arkid[0]!='ark:'){
              arkid.unshift('ark:')
            }
        }
      }
      let koid = {naan:'',name:'',version:''}
      koid.naan=arkid[1] ||  ''
      koid.name=arkid[2] ||  ''
      koid.version=arkid[3] || ''
      let activatedkos = []
      let targetko =''
      axios({
        method: 'get',
        url: url+'/kos/'
      })
      .then(async function (response) {
        activatedkos = []
        response.data.forEach(function(e){
          var entryIncluded = true
          if(koid.name!=''){
            if(koid.version==''){
              entryIncluded =entryIncluded && e.identifier.includes(koid.naan+'/'+koid.name)
            } else {
              entryIncluded =entryIncluded && e.identifier.includes(koid.naan+'/'+koid.name) && e.version==koid.version
            }
          }
          if(entryIncluded) {
            activatedkos.push(e.identifier+'/'+e.version)
          }
        });
        if(activatedkos.length!=0){
          if(activatedkos.length>1){
            let responses = await inquirer.prompt([
                {
                  type: 'list',
                  name: 'selectedko',
                  message: 'Please select an KO: ',
                  default: 0,
                  scroll: false,
                  choices: activatedkos,
                  pageSize: Math.min(15, activatedkos.length)
                }
              ])
            targetko = responses.selectedko.replace('ark:/','')
          } else {
            targetko= activatedkos[0].replace('ark:/','')
          }
          targeturl = `https://editor.swagger.io/?url=${url}/kos/${targetko}/service`
          console.log('\nOpen the URL in your browser:\n')
          console.log('    '+targeturl)
          if(openurl){
            if(os.platform()=='win32'){
              shelljs.exec('start '+targeturl, {async:true})
            } else {
              shelljs.exec('open '+targeturl, {async:true})
            }
          }
          return 0
        } else {
          var id = koid.version=='' ? koid.naan+'/'+koid.name : koid.naan+'/'+koid.name +'/'+koid.version
          console.log('No KO with ark id of ark:/'+ id+' has been activated.\n')
        }
      })
      .catch(function(error){
          console.log(error)
          console.log('Cannot connect to the activator at:  '+url+'\n\nPlease make sure the activator is running and the correct url and/or port is specified to connect.\n\n  Example:  kgrid play [ARK] -p [port]\n\nOr\n\n  Example:  kgrid play [ARK] -l [url]\n');
      });
  }
}

PlayCommand.description = `Try out a Knowledge Object using Swagger Editor.
${documentations.play}
`
PlayCommand.flags = {
  port: flags.string({char: 'p', description:'Specify the port for KGRID Activator', exclusive:['url']}),
  help: flags.help({char:'h'}),
  open: flags.boolean({char:'o', description:'Open the url in the default browser'}),
  url: flags.string({ char:'l',description:'The URL of the activator or library to upload the packaged KO', exclusive:['port']})
}
PlayCommand.args = [
  {name:'ark'}
]
module.exports = PlayCommand

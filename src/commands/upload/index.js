const {Command, flags} = require('@oclif/command')
const documentations = require('../../json/extradoc.json')
const uploadFile = require('../../upload_file')
const parseInput = require('../../parse_input')

class UploadCommand extends Command {
  async run() {
      const {args, flags} = this.parse(UploadCommand)
      var localurl = flags.port ? 'http://localhost:'+flags.port : flags.port
      var parsedinput = parseInput ('upload', args.ark, flags.file, null)
      if (parsedinput != 1){
        uploadFile('activator', parsedinput.koid, parsedinput.fullpath, flags.url || localurl )
      }
  }
}

UploadCommand.description = `Upload a packaged Knowledge Object to a KGRID activator or library.
${documentations.upload}
`
UploadCommand.flags = {
  port: flags.string({char: 'p', description:'Specify the port for KGRID Activator', exclusive:['url']}),
  file: flags.string({char: 'f', description:'The filename of the packaged KO to be uploaded',exclusive: ['ark']}),
  help: flags.help({char:'h'}),
  url: flags.string({ char:'l',description:'The URL of the activator or library to upload the packaged KO', exclusive:['port']})
}
UploadCommand.args = [
  {name:'ark'}
]
UploadCommand.aliases = [
  'upload:activator'
]
module.exports = UploadCommand

const {Command, flags} = require('@oclif/command')
const documentations = require('../json/extradoc.json')
const uploadFile = require('../upload_file')
const parseInput = require('../parse_input')

class UploadCommand extends Command {
  async run() {
      const {args, flags} = this.parse(UploadCommand)
      var localurl = flags.port ? 'http://localhost:'+flags.port : flags.port
      var parsedinput = await parseInput ('upload', args.ark, flags.file, null)
      if (parsedinput != 1){
        let targeturl= (flags.library) ?  flags.url || localurl || 'http://localhost:8081/' : flags.url || localurl || 'http://localhost:8080/'
        uploadFile(parsedinput.koid, parsedinput.fullpath, targeturl )
      }
  }
}

UploadCommand.description = `Upload a packaged Knowledge Object to a KGRID activator or library.
${documentations.upload}
`
UploadCommand.flags = {
  library:flags.boolean({ description:'Specify the library as the target for uploading, ', exclusive:['activator']}),
  activator:flags.boolean({ description:'Specify the activator as the target for uploading, ', exclusive:['library']}),
  port: flags.string({char: 'p', description:'Specify the port for KGRID Activator', exclusive:['url']}),
  file: flags.string({char: 'f', description:'The filename of the packaged KO to be uploaded',exclusive: ['ark']}),
  help: flags.help({char:'h'}),
  url: flags.string({ char:'l',description:'The URL of the activator or library to upload the packaged KO', exclusive:['port']})
}
UploadCommand.args = [
  {name:'ark'}
]
module.exports = UploadCommand

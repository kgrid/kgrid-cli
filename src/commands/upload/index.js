const {Command, flags} = require('@oclif/command')
const documentations = require('../../json/extradoc.json')
const uploadFile = require('../../upload_file')
const parseInput = require('../../parse_input')

class UploadCommand extends Command {
  async run() {
      const {args, flags} = this.parse(UploadCommand)
      let zip =flags.file
      let url = flags.url
      let ark = args.ark
      var parsedinput = parseInput ('upload',ark,zip,null)
      if(parsedinput ==1){
        return 1
      }else {
        uploadFile('activator', parsedinput.koid, parsedinput.filefullpath, url)
      }
  }
}

UploadCommand.description = `Upload a packaged Knowledge Object to a KGRID activator or library.
${documentations.upload}
`

UploadCommand.flags = {
  file: flags.string({char: 'f', description:'The filename of the packaged KO to be uploaded',exclusive: ['ark']}),
  help: flags.help({char:'h'}),
  url: flags.string({required: true, description:'The URL of the activator or library to upload the packaged KO'})
}

UploadCommand.args = [
  {name:'ark'}
]

UploadCommand.aliases = [
  'upload:activator'
]

module.exports = UploadCommand

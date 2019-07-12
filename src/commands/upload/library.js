const {Command, flags} = require('@oclif/command')
const documentations = require('../../json/extradoc.json')
const uploadFile = require('../../upload_file')
const parseInput = require('../../parse_input')

class LibraryCommand extends Command {
  async run() {
      const {args, flags} = this.parse(LibraryCommand)
      let zip =flags.file
      let url = flags.url
      let ark = args.ark
      var parsedinput = parseInput ('upload', ark,zip,null)
      if(parsedinput ==1){
        return 1
      }else {
        uploadFile('library', parsedinput.koid, parsedinput.filefullpath, url)
      }
  }
}

LibraryCommand.description = `Upload a packaged Knowledge Object to a KGRID library.
${documentations.uploadlibrary}
`

LibraryCommand.flags = {
  file: flags.string({char: 'f', description:'The filename of the packaged KO to be uploaded',exclusive: ['ark']}),
  help: flags.help({char:'h'}),
  url: flags.string({required: true, description:'The URL of the library tp upload the packaged KO'})
}

LibraryCommand.args = [
  {name:'ark'}
]

module.exports = LibraryCommand

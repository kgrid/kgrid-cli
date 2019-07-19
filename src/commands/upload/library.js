const {Command, flags} = require('@oclif/command')
const documentations = require('../../json/extradoc.json')
const uploadFile = require('../../upload_file')
const parseInput = require('../../parse_input')

class LibraryCommand extends Command {
  async run() {
      const {args, flags} = this.parse(LibraryCommand)
      var localurl = flags.port ? 'http://localhost:'+flags.port : flags.port
      var parsedinput = parseInput ('upload', args.ark, flags.file, null)
      if(parsedinput !=1){
        uploadFile('library', parsedinput.koid, parsedinput.fullpath, flags.url || localurl )
      }
  }
}

LibraryCommand.description = `Upload a packaged Knowledge Object to a KGRID library.
${documentations.uploadlibrary}
`
LibraryCommand.flags = {
  file: flags.string({char: 'f', description:'The filename of the packaged KO to be uploaded',exclusive: ['ark']}),
  help: flags.help({char:'h'}),
  port: flags.string({char: 'p', description:'Specify the port for KGRID Activator', exclusive:['url']}),
  url: flags.string({description:'The URL of the library tp upload the packaged KO', exclusive:['port']})
}
LibraryCommand.args = [
  {name:'ark'}
]
module.exports = LibraryCommand

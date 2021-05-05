const {Command, flags} = require('@oclif/command')
const documentations = require('../json/extradoc.json')
const parseInput = require('../parse_input')

class DownloadCommand extends Command {
  async run() {
      const {args, flags} = this.parse(DownloadCommand)
      // var localurl = flags.port ? 'http://localhost:'+flags.port : flags.port
      // var parsedinput = await parseInput ('upload', args.ark, flags.file, null)
      // if (parsedinput != 1){
      //   let targeturl= (flags.library) ?  flags.url || localurl || 'http://localhost:8081/' : flags.url || localurl || 'http://localhost:8080/'
      //   uploadFile(parsedinput.koid, parsedinput.fullpath, targeturl )
      // }
      this.error("Under developement...", {
            // code: "OCLIF_ERR",
            ref: "https://kgrid.org/kgrid-cli/#kgrid-download-manifest",
            suggestions: ["Please try this command later"],
          })
  }
}

DownloadCommand.description = `Download a collection of Knowledge Object to the current directory.
${documentations.download}
`
DownloadCommand.flags = {
  file: flags.string({char: 'f', description:'The filename of the packaged KO to be downloaded',exclusive: ['manifest']}),
  list: flags.string({char: 'l', description:'The list of the manifest files to be downloaded',exclusive: ['manifest']}),
  help: flags.help({char:'h'}),
  destination: flags.string({ char:'d',description:'The directory to store the downloaded KO(s)'})
}
DownloadCommand.args = [
  {name:'manifest'}
]
module.exports = DownloadCommand

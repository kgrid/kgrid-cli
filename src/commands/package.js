const {Command, flags} = require('@oclif/command');
const archiver = require('archiver');
const yaml = require('js-yaml');
const jp = require('jsonpath');
const fs = require('fs-extra');
const path = require('path');
const documentations = require('../json/extradoc.json')
const parseInput = require('../parse_input')
const packageKO = require('../package_ko');

class PackageCommand extends Command {
  async run() {
    const {args, flags} = this.parse(PackageCommand);
    let ko = flags.source
    let ark =  args.ark;
    let dest = flags.destination;
    var parsedInput = await parseInput ('package', args.ark, null, flags.source, null)
    if(parsedInput==1){
      return 1
    }
    packageKO(parsedInput.fullpath, dest, true);
  }
}

PackageCommand.description = `Package the knowledge object.
${documentations.package}
`
PackageCommand.flags = {
  help: flags.help({char:'h'}),
  source: flags.string({char:'s', description:'The folder holding the ko as the source directory'}),
  destination: flags.string({char:'d', description:"the directory for the packaged file"})
}

PackageCommand.args = [
  {name:'ark'}
];


module.exports = PackageCommand;

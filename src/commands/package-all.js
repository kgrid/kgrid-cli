const {Command, flags} = require('@oclif/command');
const inquirer = require('inquirer');
const packageKO = require('../package_ko');
const documentations = require('../json/extradoc.json');
const getall = require('../getall');

class PackageallCommand extends Command {
  async run() {
    const {args, flags} = this.parse(PackageallCommand);
    let sourceDir = flags.source || process.cwd();
    let destDir = flags.destination || process.cwd();
    let verbose = flags.verbose;
    let kos = getall(sourceDir);

    console.log("Packaging kos in folder " + sourceDir + " and depositing in " + destDir);
    this.packageAllKO(kos, sourceDir, destDir, verbose);
  }

packageAllKO(kos, sourceDir, destDir, verbose) {

  kos.forEach((koMetadata) => {
    try {
      let koPath = sourceDir + koMetadata.path;
      console.log("Packaging " + koMetadata.id + "-" + koMetadata.version + " at path " + koPath);
      packageKO(koPath, destDir || koPath.substring(0, koPath.lastIndexOf(path.delimiter)), verbose);

      } catch (e) {
        console.log("Couldn't package " + koMetadata.id + "-" + koMetadata.version + " ");
      }
    });
  }
}

PackageallCommand.description = `Package all the knowledge objects in the specified directory.
${documentations.packageall}
`;

PackageallCommand.flags = {
  help: flags.help({char:'h'}),
  source: flags.string({char:'s', description:'The folder holding the kos as the source directory'}),
  destination: flags.string({char:'d', description:"The directory for the packaged files"}),
  verbose: flags.boolean({char:'v', description:"Display the packaged files while added to the package"})
};

module.exports = PackageallCommand;

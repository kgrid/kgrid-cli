const {Command, flags} = require('@oclif/command');
const inquirer = require('inquirer');
const packageKO = require('../package_ko');
const documentations = require('../json/extradoc.json');
const getall = require('../getall');
const {promptAndCreateManifest} = require('./create-manifest');

class PackageallCommand extends Command {
  async run() {
    const {args, flags} = this.parse(PackageallCommand);
    let sourceDir = flags.source || process.cwd();
    let destDir = flags.destination || process.cwd();
    let generateManifest = flags.manifest;
    let manifestName = flags.manname || "manifest.json";
    let forceDefaults = flags.force;
    console.log("Packaging kos in folder " + sourceDir + " and depositing in " + destDir);
    let kos = getall(sourceDir);

    this.packageAllKO(kos, sourceDir, destDir);

    if(generateManifest) {
      promptAndCreateManifest(destDir, manifestName, forceDefaults);
    }

  }

packageAllKO(kos, sourceDir, destDir) {

  kos.forEach((koMetadata) => {
    try {
      let koPath = sourceDir + koMetadata.path;
      console.log("Packaging " + koMetadata.id + "-" + koMetadata.version + " at path " + koPath);
      packageKO(koPath, destDir || koPath.substring(0, koPath.lastIndexOf(path.delimiter)));

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
  manifest: flags.boolean({char:'m',  default: false, description:"Generate a manifest after packaging"}),
  manname: flags.string({char:'n',
    description:"The name of the manifest file, if the manifest flag is used", dependsOn: ["manifest"]}),
  force: flags.boolean({char:'f',  default: false, description:"Use default values for all prompted choices"})
};

module.exports = PackageallCommand;

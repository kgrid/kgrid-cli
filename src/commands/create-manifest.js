const {Command, flags} = require('@oclif/command');
const documentations = require('../json/extradoc.json');
const klawSync = require('klaw-sync');
const fs = require('fs-extra');
const path = require('path');
const inquirer = require('inquirer');

class GenerateManifest extends Command {
  async run() {
    const {args, flags} = this.parse(GenerateManifest);
    const sourceDir = flags.source || process.cwd();
    const manifestName = flags.name || "manifest.json";
    const forceDefaults = flags.force;

    promptAndCreateManifest(sourceDir, manifestName, forceDefaults);
  }
}

GenerateManifest.description = `Generates a manifest for all the objects in the current or given directory
${documentations.generatemanifest}
`;

GenerateManifest.flags = {
  help: flags.help({char:'h'}),
  source: flags.string({char:'s', description:'The folder holding the kos as the source directory'}),
  name: flags.string({char:'n', description:'The name of the manifest file'}),
  force: flags.boolean({char:'f',  default: false, description:"Use default values for all prompted choices"})
};

function promptAndCreateManifest(sourceDir, manifestName, force) {
  const manifestLoc = path.join(sourceDir, manifestName);

  if (fs.pathExistsSync(manifestLoc) && force === false) {
    inquirer.prompt([{
      type: 'confirm',
      name: 'replace',
      message: 'Manifest already exists, do you want to replace it?',

    }]).then((answers) => {
      if (answers.replace) {
        writeManifest(sourceDir, manifestName);
      }
    })
  } else {
    writeManifest(sourceDir, manifestName);
  }
}

function writeManifest(sourceDir, manifestName) {
  const manifestLoc = path.join(sourceDir, manifestName);
  console.log("Creating manifest for zipped kos in folder " + sourceDir + " and writing to " + manifestName);

  let koZips = klawSync(sourceDir, {nodir:true, depthLimit: 0});
  let manifest = {
    manifest: []
  };
  koZips.forEach((koZip, index) => {
    if(koZip.path.endsWith(".zip")) {
      manifest.manifest.push(koZip.path.substring(sourceDir.length + 1));
    }
  });

  fs.writeJsonSync(manifestLoc, manifest, {spaces: 2});
}

module.exports = GenerateManifest;

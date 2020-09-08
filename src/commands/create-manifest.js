const {Command, flags} = require('@oclif/command');
const documentations = require('../json/extradoc.json');
const klawSync = require('klaw-sync');
const fs = require('fs-extra');
const path = require('path');
const inquirer = require('inquirer');
const currentDirectory = process.cwd();
let manifestLocation;
class GenerateManifest extends Command {
  async run() {
    const {args, flags} = this.parse(GenerateManifest);
    const sourceDir = flags.source || currentDirectory;
    const manifestName = flags.name || "manifest.json";
    const forceDefaults = flags.force;

    promptAndCreateManifest(sourceDir, manifestName, forceDefaults);
  }
}

GenerateManifest.description = `Generates a manifest for all the objects in the current or given directory
${documentations.generatemanifest}
`;

GenerateManifest.flags = {
  help: flags.help({char: 'h'}),
  source: flags.string({char: 's', description: 'The folder holding the kos as the source directory'}),
  name: flags.string({char: 'n', description: 'The name of the manifest file'}),
  force: flags.boolean({char: 'f', default: false, description: "Use default values for all prompted choices"})
};

function promptAndCreateManifest(sourceDir, manifestName, force) {
  manifestLocation = path.join(currentDirectory, manifestName);

  if (fs.pathExistsSync(manifestLocation) && force === false) {
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
  console.log("Creating manifest for zipped kos in folder " + sourceDir + " and writing to " + manifestName);

  let koZips = klawSync(sourceDir, {nodir: true, depthLimit: 0});
  let topLevelNode = {
    manifest: []
  };
  koZips.forEach((koZip) => {
    const pathToWrite = getPathForManifestEntry(sourceDir, koZip);
    if (pathToWrite.endsWith(".zip")) {
      topLevelNode.manifest.push(pathToWrite);
    }
  });

  fs.writeJsonSync(manifestLocation, topLevelNode, {spaces: 2});
}

function getPathForManifestEntry(sourceDir, zip) {
  if (sourceDir !== currentDirectory) {
    return path.join(sourceDir, getFilenameFromZip(zip));
  } else {
    return zip.path.substring(sourceDir.length + 1)
  }
}

function getFilenameFromZip(zip) {
  let lastSlash = zip.path.lastIndexOf('/');
  return zip.path.substring(lastSlash);
}

module.exports = GenerateManifest;

const {Command, flags} = require('@oclif/command');
const documentations = require('../json/extradoc.json');
const klawSync = require('klaw-sync');
const fs = require('fs-extra');
const path = require('path');
const inquirer = require('inquirer');
const currentDirectory = process.cwd();
let manifestDestination;

class GenerateManifest extends Command {
  async run() {
    const {args, flags} = this.parse(GenerateManifest);
    const sourceDirectory = flags.source || currentDirectory;
    const targetDirectory = flags.target || "manifest.json";
    const forceDefaults = flags.force;

    promptAndCreateManifest(sourceDirectory, targetDirectory, forceDefaults);
  }
}

GenerateManifest.description = `Generates a manifest for all the objects in the current or given directory
${documentations.generatemanifest}
`;

GenerateManifest.flags = {
  help: flags.help({char: 'h'}),
  source: flags.string({char: 's', description: 'The folder holding the kos as the source directory'}),
  target: flags.string({char: 't', description: 'The target path and name of the manifest file'}),
  force: flags.boolean({char: 'f', default: false, description: "Use default values for all prompted choices"})
};

function promptAndCreateManifest(sourceDirectory, targetDirectory, force) {
  manifestDestination = path.join(currentDirectory, targetDirectory);

  if (fs.pathExistsSync(manifestDestination) && force === false) {
    inquirer.prompt([{
      type: 'confirm',
      name: 'replace',
      message: 'Manifest already exists, do you want to replace it?',

    }]).then((answers) => {
      if (answers.replace) {
        writeManifest(sourceDirectory, targetDirectory);
      }
    })
  } else {
    writeManifest(sourceDirectory, targetDirectory);
  }
}

function writeManifest(sourceDirectory, targetDirectory) {
  console.log("Creating manifest for zipped kos in folder " + sourceDirectory + " and writing to " + targetDirectory);

  let koZips = klawSync(sourceDirectory, {nodir: true, depthLimit: 0});
  let topLevelNode = {
    manifest: []
  };
  koZips.forEach((koZip) => {
    if (koZip.path.endsWith(".zip")) {
      let pathToWrite = getPathForManifestEntry(sourceDirectory, targetDirectory, koZip);
      pathToWrite = pathToWrite.replace(/\\/g, "/");
      topLevelNode.manifest.push(pathToWrite);
    }
  });
console.log("**********************************WRITING STUFF TO: " + manifestDestination)
  fs.writeJsonSync(manifestDestination, topLevelNode, {spaces: 2});
}

function getPathForManifestEntry(sourceDirectory, targetDirectory, zip) {
  let manifestDirectory = targetDirectory.substring(0, targetDirectory.lastIndexOf("/"));
  return path.join(path.relative(manifestDirectory, sourceDirectory), getFilenameFromZip(zip));
}

function getFilenameFromZip(zip) {
  let lastSlash = zip.path.lastIndexOf(path.sep);
  let filePath = zip.path.substring(lastSlash + 1);
  return filePath;
}

module.exports = GenerateManifest;

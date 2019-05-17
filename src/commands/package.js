const {Command, flags} = require('@oclif/command');
const archiver = require('archiver');
const yaml = require('js-yaml');
const jp = require('jsonpath');
const fs = require('fs-extra');
const path = require('path');

class CreateCommand extends Command {
  async run() {
    const {args, flags} = this.parse(CreateCommand);
    let ko = args.ko;
    let dest = args.dest;
    console.log("Packaging " + ko);

    if (ko) {

      // Zip ko and only put in the artifacts needed for activation by looking
      // for links to files in the implementation metadata
      let koMetadataPath = path.join(ko,'metadata.json');
      let topMeta;
      if (fs.pathExistsSync(koMetadataPath)) {
        topMeta = fs.readJsonSync(koMetadataPath);
      } else {
        this.log("Cannot find metadata.json for " + ko);
        return 1; // Error
      }
      let destinationName;
      if(dest) {
        if(dest.endsWith(".zip")) {
          destinationName = dest;
        } else {
          destinationName = dest + ".zip";
        }
      } else {
        destinationName = ko + ".zip";
      }
      let output = fs.createWriteStream(destinationName);
      // Zip handling
      let archive = archiver('zip', {zlib: {level: 9}});
      output.on('close', () => {
        console.log(
          'Created package with ' + archive.pointer() + ' total bytes');
      });
      archive.pipe(output);
      archive.on('warning', function(err) {
        if (err.code === 'ENOENT') {
          console.log(err);
        } else {
          // throw error
          throw err;
        }
      });
      archive.on('error', function(err) {
        throw err;
      });

      let versions = topMeta.hasImplementation;
      if (versions) {
        console.log("Found versions " + JSON.stringify(versions));
        versions.forEach(version => {
          let versionMetadataPath = path.join(version, 'metadata.json');
          if (fs.pathExistsSync) {
            let versionMetadata = fs.readJsonSync(versionMetadataPath);
            let specPath = path.join(ko, versionMetadata.hasServiceSpecification);

            if (fs.pathExistsSync(specPath)) {
              console.log("Copying " + specPath);
              archive.append(fs.createReadStream(specPath), {name: specPath});
            } else {
              console.log("Cannot find service specification at " + specPath);
            }
            let serviceSpec = yaml.safeLoad(fs.readFileSync(specPath));
            let endpoints = serviceSpec.paths;
            Object.keys(endpoints).forEach(endpoint => {
              let payloadPaths = jp.query(endpoints[endpoint], "$.*['x-kgrid-activation'].artifact");
              payloadPaths.forEach(methodPath => {
                let payloadPath =path.join(version, methodPath)
                if (fs.pathExistsSync(payloadPath)) {
                  console.log("Copying " + payloadPath);
                  archive.append(fs.createReadStream(payloadPath),
                    {name: payloadPath});
                } else {
                  console.log("Cannot find payload at " + payloadPath);
                }
              });
            });
            if (fs.pathExistsSync(versionMetadataPath)) {
              console.log("Copying " + versionMetadataPath);
              archive.append(fs.createReadStream(versionMetadataPath),
                {name: versionMetadataPath});
            } else {
              console.log(
                "Cannot find version metadata at " + versionMetadataPath);
            }
          }
        });
        console.log("Copying " + koMetadataPath);
        archive.append(fs.createReadStream(koMetadataPath), { name: koMetadataPath });
        archive.finalize();
      } else {
        // No versions

      }
    }
  }
}

CreateCommand.description = 'Package the knowledge object';

CreateCommand.flags = {
  version: flags.string({char: 'v'}),
  includeSource: flags.string({char: 's'}),
  includeTests: flags.string({char: 't'})
};

CreateCommand.args = [
  {name:'ko'},
  {name: 'dest'}
];

module.exports = CreateCommand;

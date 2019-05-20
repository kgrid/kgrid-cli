const {Command, flags} = require('@oclif/command');
const archiver = require('archiver');
const yaml = require('js-yaml');
const jp = require('jsonpath');
const fs = require('fs-extra');
const path = require('path');

class CreateCommand extends Command {
  async run() {
    this.log('KGrid CLI v'+this.config.version+'\n')

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

      let implementations = topMeta.hasImplementation;
      if (implementations) {
        console.log("Found implementations " + JSON.stringify(implementations));
        implementations.forEach(implementation => {
          let implementationMetadataPath = path.join(implementation, 'metadata.json');
          if (fs.pathExistsSync) {
            let implementationMetadata = fs.readJsonSync(implementationMetadataPath);
            let specPath = path.join(ko, implementationMetadata.hasServiceSpecification);

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
                let payloadPath = path.join(implementation, methodPath);
                if (fs.pathExistsSync(payloadPath)) {
                  console.log("Copying " + payloadPath);
                  archive.append(fs.createReadStream(payloadPath),
                    {name: payloadPath});
                } else {
                  console.log("Cannot find payload at " + payloadPath);
                }
              });
            });
            if (fs.pathExistsSync(implementationMetadataPath)) {
              console.log("Copying " + implementationMetadataPath);
              archive.append(fs.createReadStream(implementationMetadataPath),
                {name: implementationMetadataPath});
            } else {
              console.log(
                "Cannot find implementation metadata at " + implementationMetadataPath);
            }
          }
        });
        console.log("Copying " + koMetadataPath);
        archive.append(fs.createReadStream(koMetadataPath), { name: koMetadataPath });
        archive.finalize();
      } else {
        // No implementations

      }
    }
  }
}

CreateCommand.description = 'Package the knowledge object';

CreateCommand.flags = {
  implementation: flags.string({char: 'i'}),
  includeSource: flags.string({char: 's'}), // Future option
  includeTests: flags.string({char: 't'}) // Future option
};

CreateCommand.args = [
  {name:'ko'},
  {name: 'dest'}
];

module.exports = CreateCommand;

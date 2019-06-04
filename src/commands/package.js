const {Command, flags} = require('@oclif/command');
const archiver = require('archiver');
const yaml = require('js-yaml');
const jp = require('jsonpath');
const fs = require('fs-extra');
const path = require('path');
const documentations = require('../json/extradoc.json')

class PackageCommand extends Command {
  async run() {
    this.log('KGrid CLI v'+this.config.version+'\n')

    const {args} = this.parse(PackageCommand);
    let ko = args.ko;
    let dest = args.destination;
    let checkSpec = false;
    if (!ko) {
      ko = path.basename(process.cwd());
      process.chdir("..");
    }
    console.log("Packaging " + ko);

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
    let arkId = topMeta["@id"];
    if (implementations) {
      console.log("Found implementations " + JSON.stringify(implementations));
      implementations.forEach(implementation => {
        implementation = implementation.replace(arkId, ko);
        let implementationMetadataPath = path.join(implementation, 'metadata.json');

        if (fs.pathExistsSync(implementationMetadataPath)) {
          let implementationMetadata = fs.readJsonSync(implementationMetadataPath);

          if(implementationMetadata.hasDeploymentSpecification &&
            fs.pathExistsSync(path.join(ko, implementationMetadata.hasDeploymentSpecification))) {
            let deploymentSpecPath = path.join(ko, implementationMetadata.hasDeploymentSpecification);
            archiveFileFromLocation(archive, deploymentSpecPath);
            let deploymentSpec = yaml.safeLoad(fs.readFileSync(deploymentSpecPath));
            let endpoints = deploymentSpec.endpoints;

            if(endpoints) {
              Object.keys(endpoints).forEach(endpoint => {
                console.log("endpoint: " + JSON.stringify(endpoints[endpoint]));
                let payloadPath = path.join(implementation, endpoints[endpoint].artifact);
                archiveFileFromLocation(archive, payloadPath);
              });
            } else {
              // Has deployment spec but no endpoints
              checkSpec = true;
            }
          } else {
            // Doesn't have deployment spec
            checkSpec = true;
          }

          let specPath = path.join(ko, implementationMetadata.hasServiceSpecification);
          archiveFileFromLocation(archive, specPath);

          if(checkSpec) {
            let serviceSpec = yaml.safeLoad(fs.readFileSync(specPath));
            let endpoints = serviceSpec.paths;
            Object.keys(endpoints).forEach(endpoint => {
              let payloadPaths = jp.query(endpoints[endpoint],
                "$.*['x-kgrid-activation'].artifact");
              payloadPaths.forEach(methodPath => {
                let payloadPath = path.join(implementation, methodPath);
                archiveFileFromLocation(archive, payloadPath);
              });
            });
          }
          archiveFileFromLocation(archive, implementationMetadataPath);
        } else {
          console.log("Cannot find implementation folder " + implementation);
        }
      });
      archiveFileFromLocation(archive, koMetadataPath);
      archive.finalize();
    }
  }
}

function archiveFileFromLocation (archive, location) {
  if (fs.pathExistsSync(location)) {
    console.log("Copying " + location);
    archive.append(fs.createReadStream(location),
      {name: location});
  } else {
    console.log("Cannot find file at " + location);
  }
}

PackageCommand.description = `Package the knowledge object.
${documentations.package}
`

PackageCommand.flags = {
  implementation: flags.string({char: 'i', description:"the name for the implementation"}),
  help: flags.help({char:'h'})
}

PackageCommand.args = [
  {name:'ko'},
  {name: 'destination'}
];

module.exports = PackageCommand;

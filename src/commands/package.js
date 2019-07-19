const {Command, flags} = require('@oclif/command');
const archiver = require('archiver');
const yaml = require('js-yaml');
const jp = require('jsonpath');
const fs = require('fs-extra');
const path = require('path');
const documentations = require('../json/extradoc.json')
const parseInput = require('../parse_input')

class PackageCommand extends Command {
  async run() {
    const {args, flags} = this.parse(PackageCommand);
    let ko = flags.source
    let ark =  args.ark;
    let dest = flags.destination;
    var parsedInput = parseInput ('package', args.ark, null, flags.source, null)
    if(parsedInput==1){
      return 1
    }
    // console.log(parsedInput)
    // return 0
    let checkSpec = false;
    let topMeta = fs.readJsonSync(path.join(parsedInput.fullpath,'metadata.json'));
    let arkId = topMeta["@id"];
    let destinationName = arkId + ".zip";
    let tmpko = path.join(path.dirname(parsedInput.fullpath), 'tmp',arkId)
    fs.ensureDirSync(tmpko)
    if(dest) {
      fs.ensureDirSync(dest)
      destinationName=path.join(dest, destinationName)
    } else {
      destinationName=path.join(path.dirname(parsedInput.fullpath), destinationName)
    }
    let topMetaImplementations = topMeta.hasImplementation;
    topMeta.hasImplementation =[]
    let implementations = []
    if (topMetaImplementations) {
      if(!Array.isArray(topMetaImplementations)){
        implementations.push(topMetaImplementations)
      } else {
        implementations= JSON.parse(JSON.stringify(topMetaImplementations))
      }
      try{
        implementations.forEach(implementation => {
          let imp = implementation.replace(arkId+'/', '');
          let impIncluded = false
          if(parsedInput.koid.imp==''){
            impIncluded = true
          } else {
            if(path.basename(parsedInput.koid.imp)==imp) {
              impIncluded=true
            }
          }
          if(impIncluded){
            topMeta.hasImplementation.push(implementation)
            implementation = implementation.replace(arkId, path.basename(parsedInput.koid.imp));
            let implementationMetadataPath = path.join(parsedInput.fullpath, imp, 'metadata.json');
            if (fs.pathExistsSync(implementationMetadataPath)) {
              let implementationMetadata = fs.readJsonSync(implementationMetadataPath);
              if(implementationMetadata.hasDeploymentSpecification &&
                fs.pathExistsSync(path.join(parsedInput.fullpath, implementationMetadata.hasDeploymentSpecification))) {
                let deploymentSpecPath = path.join(parsedInput.fullpath, implementationMetadata.hasDeploymentSpecification);
                console.log('Adding '+deploymentSpecPath+' ...')
                fs.copySync(deploymentSpecPath, path.join(tmpko, implementationMetadata.hasDeploymentSpecification))
                let deploymentSpec = yaml.safeLoad(fs.readFileSync(deploymentSpecPath));
                let endpoints = deploymentSpec.endpoints;
                if(endpoints) {
                  Object.keys(endpoints).forEach(endpoint => {
                    let payloadPath = path.join(parsedInput.fullpath, imp,  endpoints[endpoint].artifact);
                    if(!fs.pathExistsSync(path.join(tmpko, imp, endpoints[endpoint].artifact))){
                      console.log('Adding '+payloadPath+' ...')
                      fs.copySync(payloadPath, path.join(tmpko, imp, endpoints[endpoint].artifact))
                    }
                  });
                } else {
                  checkSpec = true;  // Has deployment spec but no endpoints
                }
              } else {
                checkSpec = true;   // Doesn't have deployment spec
              }
              let specPath = path.join(parsedInput.fullpath, implementationMetadata.hasServiceSpecification);
              console.log('Adding '+specPath+' ...')
              fs.copySync(specPath, path.join(tmpko, implementationMetadata.hasServiceSpecification))
              if(checkSpec) {
                let serviceSpec = yaml.safeLoad(fs.readFileSync(specPath));
                let endpoints = serviceSpec.paths;
                Object.keys(endpoints).forEach(endpoint => {
                  let payloadPaths = jp.query(endpoints[endpoint],
                    "$.*['x-kgrid-activation'].artifact");
                  payloadPaths.forEach(methodPath => {
                    let payloadPath = path.join(parsedInput.fullpath, imp,  methodPath);
                    if(!fs.pathExistsSync(path.join(tmpko, imp, methodPath))){
                      console.log('Adding '+payloadPath+' ...')
                      fs.copySync(payloadPath, path.join(tmpko, imp, methodPath))
                    }
                  });
                });
              }
              console.log('Adding '+implementationMetadataPath+' ...')
              fs.copySync(implementationMetadataPath, path.join(tmpko, imp, 'metadata.json'))
            } else {
              console.log("Cannot find implementation folder " + implementation);
            }
          }
        });
        if(topMeta.hasImplementation.length>0){
          console.log('Adding '+path.join(parsedInput.fullpath,'metadata.json')+' ...')
          fs.writeJsonSync(path.join(tmpko,'metadata.json'), topMeta, {spaces: 4})
          let output = fs.createWriteStream(destinationName);
          let archive = archiver('zip', {zlib: {level: 9}});
          output.on('close', () => {
            fs.removeSync(path.join(path.dirname(parsedInput.fullpath),'tmp'))
            console.log('\nCreated package:  \n\n    '  + destinationName +'      (Total bytes: '+ archive.pointer()+')');
          });
          archive.pipe(output);
          archive.on('warning', function(err) {
            if (err.code === 'ENOENT') {
              console.log(err);
            } else {
              throw err;
            }
          });
          archive.on('error', function(err) {
            throw err;
          });
          archive.directory(tmpko, path.basename(tmpko))
          archive.finalize();
        } else {
          fs.removeSync(path.join(path.dirname(parsedInput.fullpath),'tmp'))
          console.log('No matching implementation found.')
        }
      }catch(e){
        fs.removeSync(path.join(path.dirname(parsedInput.fullpath),'tmp'))
        console.log(e.message)
      }
    }
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

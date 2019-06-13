const {Command, flags} = require('@oclif/command');
const archiver = require('archiver');
const yaml = require('js-yaml');
const jp = require('jsonpath');
const fs = require('fs-extra');
const path = require('path');
const colors = require('colors/safe');
const checkPathKoioType = require('../check_pathkoiotype')
const documentations = require('../json/extradoc.json')

class PackageCommand extends Command {
  async run() {
    const {args, flags} = this.parse(PackageCommand);
    let ko = args.ko;
    let dest = args.destination;
    let srcImplementation = flags.implementation
    let pathtype = checkPathKoioType()
    let shelfpath = pathtype.shelfpath
    let kopath = pathtype.kopath
    let implpath = pathtype.implpath
    if(pathtype.type=='shelf'){
      if(ko){
        kopath=path.join(pathtype.shelfpath,ko)
        if(srcImplementation){
          implpath = path.join(kopath, srcImplementation)
        }
      }else {
        console.log(colors.yellow("Please provide the name of the knowledge object you'd like to package. \n\nUSAGE: \n  $ kgrid package [ko]"))
        return 1
      }
    } else {
      if(pathtype.type=='ko'){
        if(ko){
          if(path.join(shelfpath,ko)!=kopath){
            console.log('Current directory is the knowledge object '+colors.yellow(path.basename(kopath))+'.\n\nThe command line input of '+colors.yellow(ko)+' will be ignored.\n')
          }
        }
        if(srcImplementation){
          implpath = path.join(kopath, srcImplementation)
        }
      }else {
        if(pathtype.type=='implementation'){
          if(ko){
            if(srcImplementation){
              if(path.join(shelfpath,ko,srcImplementation)!=implpath){
                console.log('Current directory is the implementation '+colors.cyan(path.basename(implpath))+' of the knowledge object '+colors.yellow(path.basename(kopath))+'.\n\nThe command line input of '+colors.yellow(ko)+' and '+colors.cyan(srcImplementation)+' will be ignored.\n')
              }
            } else {
              if(path.join(shelfpath,ko)!=kopath){
                console.log('Current directory is the implementation '+colors.cyan(path.basename(implpath))+' of the knowledge object '+colors.yellow(path.basename(kopath))+'.\n\nThe command line input of '+colors.yellow(ko)+' will be ignored.\n')
              }
            }
          }
        }
      }
    }

    let checkSpec = false;
    let koMetadataPath = path.join(kopath,'metadata.json');
    let topMeta;
    if (fs.pathExistsSync(koMetadataPath)) {
      topMeta = fs.readJsonSync(koMetadataPath);
    } else {
      this.log("Cannot find metadata.json for " + colors.yellow(path.basename(kopath)));
      return 1; // Error
    }
    let arkId = topMeta["@id"];
    let destinationName = arkId + ".zip";
    let tmpko = path.join(shelfpath, 'tmp',arkId)
    fs.ensureDirSync(tmpko)
    if(dest) {
      if(fs.pathExistsSync(dest)){
        destinationName=path.join(dest, destinationName)
      } else {
        console.log(colors.yellow('Please provide a valid directory as the destination for the packaged file.'))
        return 1
      }
    } else {
      destinationName=path.join(shelfpath, destinationName)
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
          if(implpath==''){
            impIncluded = true
          } else {
            if(path.basename(implpath)==imp) {
              impIncluded=true
            }
          }
          if(impIncluded){
            topMeta.hasImplementation.push(implementation)
            implementation = implementation.replace(arkId, path.basename(implpath));
            let implementationMetadataPath = path.join(kopath, imp, 'metadata.json');
            if (fs.pathExistsSync(implementationMetadataPath)) {
              let implementationMetadata = fs.readJsonSync(implementationMetadataPath);
              if(implementationMetadata.hasDeploymentSpecification &&
                fs.pathExistsSync(path.join(kopath, implementationMetadata.hasDeploymentSpecification))) {
                let deploymentSpecPath = path.join(kopath, implementationMetadata.hasDeploymentSpecification);
                console.log('Adding '+deploymentSpecPath+' ...')
                fs.copySync(deploymentSpecPath, path.join(tmpko, implementationMetadata.hasDeploymentSpecification))
                let deploymentSpec = yaml.safeLoad(fs.readFileSync(deploymentSpecPath));
                let endpoints = deploymentSpec.endpoints;
                if(endpoints) {
                  Object.keys(endpoints).forEach(endpoint => {
                    let payloadPath = path.join(kopath, imp,  endpoints[endpoint].artifact);
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
              let specPath = path.join(kopath, implementationMetadata.hasServiceSpecification);
              console.log('Adding '+specPath+' ...')
              fs.copySync(specPath, path.join(tmpko, implementationMetadata.hasServiceSpecification))
              if(checkSpec) {
                let serviceSpec = yaml.safeLoad(fs.readFileSync(specPath));
                let endpoints = serviceSpec.paths;
                Object.keys(endpoints).forEach(endpoint => {
                  let payloadPaths = jp.query(endpoints[endpoint],
                    "$.*['x-kgrid-activation'].artifact");
                  payloadPaths.forEach(methodPath => {
                    let payloadPath = path.join(kopath, imp,  methodPath);
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
        console.log('Adding '+path.join(kopath,'metadata.json')+' ...')
        fs.writeJsonSync(path.join(tmpko,'metadata.json'), topMeta, {spaces: 4})
        if(topMeta.hasImplementation.length>0){
          let output = fs.createWriteStream(destinationName);
          let archive = archiver('zip', {zlib: {level: 9}});
          output.on('close', () => {
            fs.removeSync(path.join(shelfpath,'tmp'))
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
          fs.removeSync(path.join(shelfpath,'tmp'))
          console.log('No matching implementation found.')
        }
      }catch(e){
        fs.removeSync(path.join(shelfpath,'tmp'))
        console.log(colors.yellow(e.message))
      }
    }
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

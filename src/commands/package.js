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
    var parsedInput = await parseInput ('package', args.ark, null, flags.source, null)
    if(parsedInput==1){
      return 1
    }
    let checkSpec = false;
    let topMeta = fs.readJsonSync(path.join(parsedInput.fullpath,'metadata.json'));
    let arkId = topMeta["@id"];
    let ver = topMeta.version
    let destinationName = parsedInput.koid.naan + '-'+ parsedInput.koid.name+ '-'+ver+'.zip'
    let tmpko = path.join(path.dirname(parsedInput.fullpath), 'tmp',parsedInput.koid.naan + '-'+ parsedInput.koid.name+ '-'+ver)
    fs.ensureDirSync(tmpko)
    if(dest) {
      fs.ensureDirSync(dest)
      destinationName=path.join(dest, destinationName)
    } else {
      destinationName=path.join(path.dirname(parsedInput.fullpath), destinationName)
    }
    try{
      let koMetadataPath = path.join(parsedInput.fullpath, 'metadata.json');
      if (fs.pathExistsSync(koMetadataPath)) {
        let koMetadata = fs.readJsonSync(koMetadataPath);
        let specPath = path.join(parsedInput.fullpath, koMetadata.hasServiceSpecification);
        console.log('Adding '+specPath+' ...')
        fs.copySync(specPath, path.join(tmpko, koMetadata.hasServiceSpecification))
        let serviceSpec = yaml.safeLoad(fs.readFileSync(specPath));
        if(koMetadata.hasDeploymentSpecification){
          let deployspecPath = path.join(parsedInput.fullpath, koMetadata.hasDeploymentSpecification);
          if(!fs.pathExistsSync(path.join(tmpko, koMetadata.hasDeploymentSpecification))){
            console.log('Adding '+deployspecPath+' ...')
            fs.copySync(deployspecPath, path.join(tmpko, koMetadata.hasDeploymentSpecification))
          }
          serviceSpec = yaml.safeLoad(fs.readFileSync(deployspecPath))
        }
        let endpoints = serviceSpec.paths;
        if(endpoints==null){
          endpoints = serviceSpec.endpoints
        }
        Object.keys(endpoints).forEach(endpoint => {
          let payloadPaths = jp.query(endpoints[endpoint],"$..artifact");
          payloadPaths.forEach(mPath => {
            let methodPath = path.dirname(mPath)
            if(methodPath=='.'){
              methodPath=mPath
            }
            let payloadPath = path.join(parsedInput.fullpath, methodPath);
            if(!fs.pathExistsSync(path.join(tmpko, methodPath))){
              console.log('Adding '+payloadPath+' ...')
              fs.copySync(payloadPath, path.join(tmpko, methodPath))
            }
          });
        });
        console.log('Adding '+koMetadataPath+' ...')
        fs.copySync(koMetadataPath, path.join(tmpko, 'metadata.json'))
      } else {
        console.log("Cannot find the folder for" + arkId);
      }

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
    }catch(e){
      fs.removeSync(path.join(path.dirname(parsedInput.fullpath),'tmp'))
      console.log(e.message)
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

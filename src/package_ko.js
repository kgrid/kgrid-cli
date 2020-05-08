const archiver = require('archiver');
const yaml = require('js-yaml');
const jp = require('jsonpath');
const fs = require('fs-extra');
const path = require('path');

async function packageko(source, dest) {

  let topMeta = fs.readJsonSync(path.join(source, 'metadata.json'));
  let arkId = topMeta["@id"];
  let ver = topMeta.version;
  let arkParts =  arkId.split("-");
  let naan = arkParts[0];
  let name = arkParts[1];
  let tempName = "tmp-" + naan + name + ver;
  let destinationName = naan + '-'+ name+ '-'+ver+'.zip';
  let tmpko = path.join(path.dirname(source), tempName, naan + '-'+ name + '-'+ver);
  fs.ensureDirSync(tmpko);
  if(dest) {
    fs.ensureDirSync(dest);
    destinationName=path.join(dest, destinationName)
  } else {
    destinationName=path.join(path.dirname(source), destinationName)
  }
  try{
    let koMetadataPath = path.join(source, 'metadata.json');
    if (fs.pathExistsSync(koMetadataPath)) {
      let koMetadata = fs.readJsonSync(koMetadataPath);
      let specPath = path.join(source, koMetadata.hasServiceSpecification);
      console.log('Adding '+specPath+' ...');
      fs.copySync(specPath, path.join(tmpko, koMetadata.hasServiceSpecification));
      let serviceSpec = yaml.safeLoad(fs.readFileSync(specPath));
      if(koMetadata.hasDeploymentSpecification){
        let deployspecPath = path.join(source, koMetadata.hasDeploymentSpecification);
        if(!fs.pathExistsSync(path.join(tmpko, koMetadata.hasDeploymentSpecification))){
          console.log('Adding '+deployspecPath+' ...');
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
          let methodPath = path.dirname(mPath);
          if(methodPath=='.'){
            methodPath=mPath
          }
          let payloadPath = path.join(source, methodPath);
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
      fs.removeSync(path.join(path.dirname(source),tempName))
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
    fs.removeSync(path.join(path.dirname(source),tempName))
    console.log("Can't package ko with ark " + arkId + "-" + ver + " error: " + e.message);
  }

}

module.exports = packageko;

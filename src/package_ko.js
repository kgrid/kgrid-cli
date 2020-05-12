const archiver = require('archiver');
const yaml = require('js-yaml');
const jp = require('jsonpath');
const fs = require('fs-extra');
const path = require('path');

async function packageko(source, destination) {

  let topMeta = fs.readJsonSync(path.join(source, 'metadata.json'));
  let arkId = topMeta["@id"];
  let version = topMeta.version;
  let arkParts = arkId.split("-");
  let naan = arkParts[0];
  let name = arkParts[1];
  let tempName = "tmp-" + naan + name + version;
  let destinationName = naan + '-' + name + '-' + version + '.zip';
  let temporaryFolder = path.join(path.dirname(source), tempName, naan + '-' + name + '-' + version);
  fs.ensureDirSync(temporaryFolder);
  if (destination) {
    fs.ensureDirSync(destination);
    destinationName = path.join(destination, destinationName)
  } else {
    destinationName = path.join(path.dirname(source), destinationName)
  }
  try {
    let koMetadataPath = path.join(source, 'metadata.json');
    if (fs.pathExistsSync(koMetadataPath)) {
      let koMetadata = fs.readJsonSync(koMetadataPath);
      const serviceSpecName = koMetadata.hasDeploymentSpecification;
      const deploymentSpecName = koMetadata.hasDeploymentSpecification;

      const serviceSpec = copyAndLoadYamlFile(serviceSpecName);
      const deploymentSpec = copyAndLoadYamlFile(deploymentSpecName)
      copyPayloads(serviceSpec, deploymentSpec);
      copyFile('metadata.json')

    } else {
      console.log(`Cannot find the folder for ${arkId}`);
    }

    writePackageToZip();

  } catch (e) {
    console.log(`Can't package ko with ark ${arkId}-${version} error: ${e.message}`);
    fs.removeSync(path.join(path.dirname(source), tempName))
  }

  function writePackageToZip() {
    let output = fs.createWriteStream(destinationName);
    let archive = archiver('zip', { zlib: { level: 9 } });
    output.on('close', () => {
      console.log(`\nCreated package:\n\n${destinationName}      (Total bytes: ${archive.pointer()})`);
      fs.removeSync(path.join(path.dirname(source), tempName));
    });
    archive.pipe(output);
    archive.on('warning', function (err) {
      if (err.code === 'ENOENT') {
        console.log(err);
      }
      else {
        throw err;
      }
    });
    archive.on('error', function (err) {
      throw err;
    });
    archive.directory(temporaryFolder, path.basename(temporaryFolder));
    archive.finalize();
  }

  function copyPayloads(serviceSpec, deploymentSpec) {
    try {
      let endpointObjects = serviceSpec.paths;
      if (endpointObjects == null) {
        endpointObjects = deploymentSpec.endpoints;
      }
      Object.keys(endpointObjects).forEach(eo => {
        let payloadPaths = jp.query(endpointObjects[eo], "$..artifact")[0];
        if (typeof (payloadPaths) === 'String') {
          copyFile(payloadPaths);
        } else {
          payloadPaths.forEach(payloadPath => {
            copyFile(payloadPath);
          });
        }
      });
    } catch (e) {
      console.log(`Could not copy package artifacts, check that service.yaml is correct.`)
    }
  }

  function copyAndLoadYamlFile(filename) {
    if (filename) {
      let specPath = copyFile(filename);
      return yaml.safeLoad(fs.readFileSync(specPath));
    }
    else {
      console.log(`${filename} does not exist. Cannot package KO.`)
    }
  }

  function copyFile(filename) {
    const sourceFile = path.join(source, filename);
    const destinationFile = path.join(temporaryFolder, filename);
    console.log(`Adding ${sourceFile} to package...`);
    fs.copySync(sourceFile, destinationFile);
    return sourceFile;
  }
}

module.exports = packageko;

const archiver = require('archiver');
const yaml = require('js-yaml');
const jp = require('jsonpath');
const fs = require('fs-extra');
const path = require('path');

async function packageko(source, destination, verbose) {

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
      const serviceSpecName = koMetadata.hasServiceSpecification;
      const deploymentSpecName = koMetadata.hasDeploymentSpecification;

      const serviceSpec = copyAndLoadYamlFile(serviceSpecName, verbose);
      const deploymentSpec = copyAndLoadYamlFile(deploymentSpecName, verbose)
      copyPayloads(serviceSpec, deploymentSpec, verbose);
      copyFile('metadata.json', verbose)

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
    let archive = archiver('zip', {zlib: {level: 9}});
    output.on('close', () => {
      console.log(`\nCreated package:\n\n${destinationName}      (Total bytes: ${archive.pointer()})`);
      fs.removeSync(path.join(path.dirname(source), tempName));
    });
    archive.pipe(output);
    archive.on('warning', function (err) {
      if (err.code === 'ENOENT') {
        console.log(err);
      } else {
        throw err;
      }
    });
    archive.on('error', function (err) {
      throw err;
    });
    archive.directory(temporaryFolder, path.basename(temporaryFolder));
    archive.finalize();
  }

  function copyPayloads(serviceSpec, deploymentSpec, verbose) {
    try {
      let endpointObjects = serviceSpec.paths;
      let artifactQuery = "$..artifact";
      if (!endpointObjects || jp.query(endpointObjects, "$..*..['x-kgrid-activation']").length < 1) {
        endpointObjects = deploymentSpec.endpoints;
        artifactQuery = "$.artifact";
      }
      Object.keys(endpointObjects).forEach(eo => {
        let payloadPaths = jp.query(endpointObjects[eo], artifactQuery)[0];
        if (typeof (payloadPaths) === 'string') {
          copyFile(payloadPaths, verbose);
        } else {
          payloadPaths.forEach(payloadPath => {
            copyFile(payloadPath, verbose);
          });
        }
      });
    } catch (e) {
      console.log(`Could not copy package artifacts, check that service.yaml is correct.`, e.message)
    }
  }

  function copyAndLoadYamlFile(filename, verbose) {
    if (filename) {
      let specPath = copyFile(filename, verbose);
      return yaml.safeLoad(fs.readFileSync(specPath));
    } else {
      console.log(`${filename} does not exist. Cannot package KO.`)
    }
  }

  function copyFile(filename, verbose) {
    const sourceFile = path.join(source, filename);
    const destinationFile = path.join(temporaryFolder, filename);
    if (verbose) {
      console.log(`Adding ${sourceFile} to package...`);
    }
    fs.copySync(sourceFile, destinationFile);
    return sourceFile;
  }
}

module.exports = packageko;

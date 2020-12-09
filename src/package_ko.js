const archiver = require('archiver');
const yaml = require('js-yaml');
const jp = require('jsonpath');
const fs = require('fs-extra');
const path = require('path');
const {hashElement} = require('folder-hash');

async function packageKo(source, destination, verbose) {

  let topMeta = fs.readJsonSync(path.join(source, 'metadata.json'));
  let arkId = topMeta["identifier"];
  let arkParts = arkId.split("/");
  let naan = arkParts[1];
  let name = arkParts[2];
  let version = topMeta.version;
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

      const deploymentSpec = yaml.safeLoad(fs.readFileSync(path.join(source, deploymentSpecName)));
      copyPayloads(deploymentSpec, verbose);
      hashElement(temporaryFolder, {exclude: '.*'}).then(hash => {
        console.log("Writing hash " + hash.hash + " to deployment spec for object " + arkId);
        Object.keys(deploymentSpec).forEach(endpoint => {
          Object.values(deploymentSpec[endpoint]).forEach(methodType => {
            methodType.checksum = hash.hash
          });
        });
        fs.writeFileSync(path.join(temporaryFolder, deploymentSpecName), yaml.safeDump(deploymentSpec));
        copyAndLoadYamlFile(serviceSpecName, verbose);
        copyFile('metadata.json', verbose)
        writePackageToZip();
      }).catch(error => {
        console.log("Hashing object " + arkId + " failed: " + error);
      });
    } else {
      console.log(`Cannot find the folder for ${arkId}`);
    }

  } catch (e) {
    console.log(`Can't package ko with ark ${arkId} error: ${e.message}`);
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

  function copyPayloads(deploymentSpec, verbose) {
    try {
      let artifactQuery = "$..artifact";
      Object.keys(deploymentSpec).forEach(eo => {
        let payloadPaths = jp.query(deploymentSpec[eo], artifactQuery)[0];
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

module.exports = packageKo;

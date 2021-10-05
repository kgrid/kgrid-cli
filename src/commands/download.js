const {Command, flags} = require('@oclif/command');
const documentations = require('../json/extradoc.json');
const fs = require('fs-extra');
const path = require('path');
const download = require('download');
const URI = require('uri-js');
const url = require('url');
const AdmZip = require('adm-zip');
const {readManifest, createManifest} = require("../../lib/manifestUtilities");
const axios = require("axios");

class DownloadCommand extends Command {
  async run() {
    const {args, flags} = this.parse(DownloadCommand)
    let manifest = flags.manifest
    let file = flags.file
    let extract = flags.extract || false
    let destination = flags.destination || process.cwd()
    let koList = {"remoteList": [], "localList": []}
    if (manifest == null && file == null) {
      console.log("Please specify the file or the manifest for downloading.\n")
      console.log("See more help with --help")
      return 1
    } else {

      fs.ensureDirSync(destination)
      console.log("The downloaded KOs will be stored in " + destination + ".\n");

      // "-f" Specified file
      if (file != null) {
        let fileList = file.split(',')
        fileList.forEach(koUri => {
          if (fileIsRemote(koUri)) {
            koList.remoteList.push(koUri)
          } else if (koUri.startsWith('file://')) {
            koList.localList.push(koUri)
          } else {
            const baseUri = new URL(`file://${koUri}`);
            let uriCheck = URI.resolve(baseUri.href, koUri)
            let filePath = url.fileURLToPath(uriCheck);
            if (fs.existsSync(filePath)) {
              koList.localList.push(uriCheck)
            } else {
              console.log(`Could not resolve file: ${koUri}`)
            }
          }
        })
      }

      // "-m" Specified manifest file(s)
      if (manifest) {
        let manifestList = manifest.split(',')
        let requests = [];
        manifestList.forEach(e => {
          requests.push(processManifestPromise(e));
        })
        Promise.allSettled(requests)
          .then(values => {
            values.forEach(m => {
              m.value.forEach(ko => {
                if (fileIsRemote(ko)) {
                  koList.remoteList.push(ko)
                } else {
                  koList.localList.push(ko)
                }
              })
            })

            if (process.env.DEBUG) {
              console.log('Kos to be loaded\n====================')
              console.log(koList.remoteList.concat(koList.localList))
            }
          })
          .finally(() => {
            downloadRemoteKos(koList.remoteList, destination, extract)
              .then(remoteManifest => {
                let localManifest = copyLocalKos(koList.localList, destination, extract)
                let finalManifest = localManifest.concat(remoteManifest)
                cleanupAndCreateManifest(finalManifest, destination)
              })
          });
      }
    }
  }
}


function processManifestPromise(manifest) {
  return new Promise((resolve, reject) => {
    if (fileIsRemote(manifest)) {
      axios.get(manifest)
        .then((response) => {
          resolve(readManifest(response.data, manifest));
        })
        .catch(() => {
          reject(manifest);
        });
    } else {
      try {
        resolve(readLocalManifest(manifest))
      } catch (error) {
        reject(error.message)
      }
    }
  })
}

function readLocalManifest(manifest) {
  let kos = []
  let manifestPath = manifest
  if (manifest.startsWith('file://')) {
    manifestPath = url.fileURLToPath(manifest)
  }
  let manifestUri = new URL(`file://${manifestPath}`)
  if (fs.existsSync(manifestPath)) {
    console.log(`Reading Manifest from ${manifestPath}\n`)
    let manifestJson = fs.readJsonSync(manifestPath)
    readManifest(manifestJson, manifestUri.href)
      .map(koUri => {
        kos.push(koUri);
      })
  } else {
    console.log(`File not found: ${manifestPath}`)
  }
  return kos
}

function copyLocalKos(localKoUris, destination, extract) {
  let copiedKos = []
  localKoUris.forEach(uri => {
    let ko = url.fileURLToPath(uri)
    if (fs.pathExistsSync(ko)) {
      if (extract) {
        try {
          let zip = new AdmZip(ko)
          zip.extractAllTo(destination, true)
        } catch (err) {
          console.log(`Extraction of ${ko} error`)
        }
      } else {
        fs.copySync(ko, path.join(destination, path.basename(ko)))
      }
      copiedKos.push(uri)
      console.log(`Retrieving ${ko} ...... fulfilled`)
    } else {
      console.log(`Retrieving ${ko} ...... failed`)
    }
  })
  return copiedKos
}


function downloadRemoteKos(koList, destination, extract) {
  return new Promise((resolve, reject) =>{
    let downloadedKoList = [];
    downloadAssets(koList, destination, extract)
      .then(values => {
        values.forEach(v => {
          console.log(`Downloading ${v.value || v.reason} ...... ${v.status}`)
          if (v.value) {
            downloadedKoList.push(v.value)
          }
        })
        resolve(downloadedKoList)
      })
      .catch(error => {
        if (process.env.DEBUG) console.log(error.message);
        reject(error)
      })
  });

}

function downloadAssets(manifest, destination, extract) {
  let downloadPromises = [];
  manifest.forEach(zippedKo => {
    downloadPromises.push(downloadPromise(zippedKo, destination, extract));
  })
  return Promise.allSettled(downloadPromises)
}

function downloadPromise(asset, destination, extract) {
  return new Promise((resolve, reject) => {
    download(asset, path.join(destination), {
      extract: extract,
      headers: {accept: ['application/zip', 'application/octet-stream']}
    })
      .then(() => {
        resolve(asset);
      })
      .catch(() => {
        reject(asset);
      });
  })
}

function cleanupAndCreateManifest(copiedKoUris, destination) {
  if (process.env.DEBUG) console.log(copiedKoUris)
  fs.writeJsonSync(path.join(destination, 'manifest.json'), createManifest(copiedKoUris), {spaces: 4})
}

function fileIsRemote(file) {
  return file.startsWith('http');
}

DownloadCommand.description = `Download a collection of Knowledge Object to the current directory.
${documentations.download}
`

DownloadCommand.flags = {
  file: flags.string({
    char: 'f',
    description: 'The filename of the packaged KO to be downloaded',
    exclusive: ['manifest']
  }),
  manifest: flags.string({char: 'm', description: 'The manifest file listing the KOs to be downloaded'}),
  extract: flags.boolean({char: 'e', description: 'Extract the entries from the zip file'}),
  help: flags.help({char: 'h'}),
  destination: flags.string({char: 'd', description: 'The directory to store the downloaded KO(s)'})
}

DownloadCommand.args = []

module.exports = DownloadCommand

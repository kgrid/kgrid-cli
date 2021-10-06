const {Command, flags} = require('@oclif/command');
const documentations = require('../json/extradoc.json');
const fs = require('fs-extra');
const path = require('path');
const download = require('download');
const url = require('url');
const AdmZip = require('adm-zip');
const {readManifest, createManifest} = require("../../lib/manifestUtilities");
const {createUri, uriToString, getFilename} = require("../../lib/uriUtilities");
const axios = require("axios");

function retrieveAllKos(koList, destination, extract) {
  downloadRemoteKos(koList.remoteList, destination, extract)
    .then(remoteManifest => {
      let localManifest = copyLocalKos(koList.localList, destination, extract)
      let finalManifest = localManifest.concat(remoteManifest)
      cleanupAndCreateManifest(finalManifest, destination)
    })
}

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
        fileList.map(koUri => {
          let uri = createUri(koUri);
          if (fileIsRemote(uri)) {
            koList.remoteList.push(uri)
          } else {
            koList.localList.push(uri)
          }
        })
      }

      // "-m" Specified manifest file(s)
      if (manifest) {
        let manifestList = manifest.split(',')
        let requests = [];
        manifestList.forEach(manifestLocation => {
          requests.push(
            processManifestPromise(
              createUri(manifestLocation)));
        })
        Promise.allSettled(requests)
          .then(promises => {
            promises.map((promise) => {
              promise.value.map((uri) => {
                if (fileIsRemote(uri)) {
                  koList.remoteList.push(uri)
                } else {
                  koList.localList.push(uri)
                }
              })
            })

            if (process.env.DEBUG) {
              console.log('Kos to be loaded\n====================')
              console.log(koList.remoteList.concat(koList.localList))
            }
          })
          .finally(() => {
            retrieveAllKos(koList, destination, extract);
          });
      }
      retrieveAllKos(koList, destination, extract);
    }
  }
}


function processManifestPromise(manifestUri) {
  return new Promise((resolve, reject) => {
    if (fileIsRemote(manifestUri)) {
      axios.get(uriToString(manifestUri))
        .then((response) => {
          resolve(readManifest(response.data, manifestUri));
        })
        .catch(() => {
          reject(manifestUri);
        });
    } else {
      try {
        resolve(readLocalManifest(manifestUri))
      } catch (error) {
        reject(error.message)
      }
    }
  })
}

function readLocalManifest(uri) {
  let kos = []
  let manifestJson = fs.readJsonSync(uri.path)
  readManifest(manifestJson, uri)
    .map(koUri => {
      kos.push(koUri);
    })
  return kos
}

function copyLocalKos(localKoUris, destination, extract) {
  let copiedKos = []
  localKoUris.forEach(uri => {
    let uriAsString = uriToString(uri);
    if (fs.pathExistsSync(uri.path)) {
      if (extract) {
        try {
          let zip = new AdmZip(uri)
          zip.extractAllTo(destination, true)
        } catch (err) {
          console.log(`Extraction of ${uriAsString} error`)
        }
      } else {
        fs.copySync(uri.path, path.join(destination, getFilename(uri)))
      }
      copiedKos.push(uri)
      console.log(`Retrieving ${uriAsString} ...... fulfilled`)
    } else {
      console.log(`Retrieving ${uriAsString} ...... failed`)
    }
  })
  return copiedKos
}


function downloadRemoteKos(koList, destination, extract) {
  return new Promise((resolve, reject) => {
    let downloadedKoList = [];
    downloadAssets(koList, destination, extract)
      .then(promises => {
        promises.forEach(promise => {
          console.log(`Downloading ${uriToString(promise.value) || promise.reason} ...... ${promise.status}`)
          if (promise.value) {
            downloadedKoList.push(promise.value)
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

function fileIsRemote(uri) {
  return uri.scheme.startsWith('http');
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

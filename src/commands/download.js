const {Command, flags} = require('@oclif/command');
const documentations = require('../json/extradoc.json');
const fs = require('fs-extra');
const path = require('path');
const download = require('download');
const AdmZip = require('adm-zip');
const {readManifestFromUri, createManifest} = require("../../lib/manifestUtilities");
const {createUri, uriToString, getFilename} = require("../../lib/uriUtilities");


class DownloadCommand extends Command {
  async run() {
    const {args, flags} = this.parse(DownloadCommand)
    let manifest = flags.manifest
    let file = flags.file
    let extract = flags.extract || false
    let destination = flags.destination || process.cwd()
    let koUris = {"remote": [], "local": []}
    if (manifest == null && file == null) {
      console.log("Please specify the file or the manifest for downloading.\n")
      console.log("See more help with --help")
      return 1
    } else {

      fs.ensureDirSync(destination)
      console.log("The downloaded KOs will be stored in " + destination + ".\n");

      // "-f" Specified file
      if (file != null) {
        let paths = file.split(',')
        paths.map(path => {
          let uri = createUri(path);
          pushUriToList(uri, koUris)
        })
      }

      // "-m" Specified manifest file(s)
      if (manifest) {
        let manifestList = manifest.split(',')
        let requests = [];
        manifestList.forEach(manifestLocation => {
          requests.push(
            readManifestFromUri(
              createUri(manifestLocation)));
        })
        Promise.allSettled(requests)
          .then(promises => {
            promises.map((promise) => {
              promise.value.map((uri) => {
                pushUriToList(uri, koUris);
              })
            })
          })
          .finally(() => {
            retrieveAllKos(koUris, destination, extract);
          });
      }
      retrieveAllKos(koUris, destination, extract);
    }
  }
}


function retrieveAllKos(koUris, destination, extract) {
  if (process.env.DEBUG) {
    console.log('Kos to be loaded\n====================')
    console.log(koUris.remote.concat(koUris.local))
  }
  downloadRemoteKos(koUris.remote, destination, extract)
    .then(remoteManifest => {
      let localManifest = copyLocalKos(koUris.local, destination, extract)
      let finalManifest = localManifest.concat(remoteManifest)
      cleanupAndCreateManifest(finalManifest, destination)
    })
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


function downloadRemoteKos(uris, destination, extract) {
  return new Promise((resolve, reject) => {
    let downloadedKoList = [];
    downloadRemoteZips(uris, destination, extract)
      .then(promises => {
        promises.forEach(promise => {
          if (promise.value) {
            console.log(`Downloading ${uriToString(promise.value)} ${promise.status}`)
            downloadedKoList.push(promise.value)
          } else {
            console.log(`Downloading ${uriToString(promise.reason)} ${promise.status}`)
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

function downloadRemoteZips(uris, destination, extract) {
  let downloadPromises = [];
  uris.forEach(uri => {
    downloadPromises.push(downloadRemoteZip(uri, destination, extract));
  })
  return Promise.allSettled(downloadPromises)
}

function downloadRemoteZip(uri, destination, extract) {
  return new Promise((resolve, reject) => {
    download(uri, path.join(destination), {
      extract: extract,
      headers: {accept: ['application/zip', 'application/octet-stream']}
    })
      .then(() => {
        resolve(uri);
      })
      .catch(() => {
        reject(uri);
      });
  })
}

function cleanupAndCreateManifest(copiedKoUris, destination) {
  if (process.env.DEBUG) console.log(copiedKoUris)
  fs.writeJsonSync(path.join(destination, 'manifest.json'), createManifest(copiedKoUris), {spaces: 4})
}

function pushUriToList(uri, koUris) {
  if (fileIsRemote(uri)) {
    koUris.remote.push(uri)
  } else {
    koUris.local.push(uri)
  }
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

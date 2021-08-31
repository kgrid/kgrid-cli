const {Command, flags} = require('@oclif/command')
const documentations = require('../json/extradoc.json')
const fs = require('fs-extra')
const path = require('path')
const download = require('download');
const URI = require('uri-js');
const url = require('url');
const AdmZip = require('adm-zip');
const tmpDir = "tmp"

class DownloadCommand extends Command {
  async run() {
    const {args, flags} = this.parse(DownloadCommand)
    let manifest = flags.manifest
    let file = flags.file
    let extract = flags.extract || false
    let destination = flags.destination || process.cwd()
    let tmp = path.join(destination, tmpDir)
    let koList = {"remoteList": [], "localList": []}
    let finalManifest = []
    if (manifest == null && file == null) {
      console.log("Please specify the file or the manifest for downloading.\n")
      console.log("See more help with --help")
      return 1
    } else {

      fs.ensureDirSync(destination)
      fs.ensureDirSync(tmp)
      console.log("The downloaded KOs will be stored in " + destination + ".\n");

      // "-f" Specified file
      if (file != null) {
        let l = []
        let fileList = file.split(',')
        fileList.forEach(e => {
          if (fileIsRemote(e)) {
            koList.remoteList.push(e)
          } else if (e.startsWith('file://')) {
            koList.localList.push(e)
          } else {
            const baseUri = new URL(`file://${tmp}`);
            console.log(baseUri)
            let uriCheck = URI.resolve(baseUri.href, e)
            console.log(uriCheck)
            if (fs.existsSync(url.fileURLToPath(uriCheck))) {
              koList.localList.push(uriCheck)
            }
          }
        })
        if (koList.localList.length > 0) {
          l = extractAssets(koList.localList, destination, extract)
          l.forEach(e => {
            finalManifest.push(e)
          })
        }
        if (koList.remoteList.length > 0) {
          downloadAssets(koList.remoteList, destination, extract)
            .then(values => {
              values.forEach(v => {
                console.log(`Downloading ${v.value || v.reason} ...... ${v.status}`)
                if (v.value) {
                  finalManifest.push(v.value)
                }
              })
            })
            .catch(error => {
              if (process.env.DEBUG) console.log(error.message);
            });
        }
      }

      // "-m" Specified manifest file(s)
      if (manifest) {
        let manifestList = manifest.split(',')
        let requests = [];
        manifestList.forEach(e => {
          requests.push(processManifestPromise(e, tmp));
        })
        Promise.all(requests)
          .then(values => {
            values.forEach(m => {
              m.forEach(ko => {
                if (ko.startsWith('https://') || ko.startsWith('http://')) {
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
            let l = []
            // Extract KOs from the list of local KOs
            if (koList.localList.length > 0) {
              l = extractAssets(koList.localList, destination, extract)
              l.forEach(e => {
                finalManifest.push(e)
              })
            }
            //Download and extract from the list of remote KOs
            if (koList.remoteList.length > 0) {
              downloadAssets(koList.remoteList, destination, extract)
                .then(values => {
                  values.forEach(v => {
                    if (v.status !== 'rejected') {
                      finalManifest.push(v.value)
                    }
                    console.log(`Downloading ${v.value || v.reason} ...... ${v.status}`)
                  })
                })
            }
          })
          .finally(() => {
            cleanupAndCreateManifest(finalManifest, destination, tmp)
        });
      }
    }
  }
}


function processManifestPromise(manifest, tmp) {
  return new Promise((resolve, reject) => {
    let kos = []
    if (fileIsRemote(manifest)) {
      download(manifest, tmp)
        .then(() => {
          kos = readRemoteManifest(manifest, tmp)
          resolve(kos);
        })
        .catch(() => {
          reject(manifest);
        });
    } else {
      try {
        kos = readLocalManifest(manifest)
        resolve(kos)
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
    if (manifestJson.manifest) {
      manifestJson = manifestJson.manifest
    }
    if (process.env.DEBUG) {
      console.log(`From ${manifest}:\n `)
      console.log(manifestJson)
    }
    manifestJson.forEach(ko => {
      kos.push(
        ko['@id']
          ? URI.resolve(manifestUri.href, ko['@id'])
          : kos.push(URI.resolve(manifestUri.href, ko)))
    })
  } else {
    console.log(`File not found: ${manifestPath}`)
  }
  return kos
}

function readRemoteManifest(manifest, tmp) {
  let kos = []
  console.log(`Reading Manifest from ${manifest}\n`)
  let manifestStringArray = manifest.split('/')
  let manifestName = manifestStringArray[manifestStringArray.length - 1]
  try {
    let manifestJson = fs.readJsonSync(path.join(tmp, manifestName))
    if (manifestJson.manifest) {
      manifestJson = manifestJson.manifest
    }
    if (process.env.DEBUG) {
      console.log(`From ${manifest}:\n `)
      console.log(manifestJson)
    }
    manifestJson.forEach(ko => {
      kos.push(
        ko['@id']
          ? URI.resolve(manifest, ko['@id'])
          : kos.push(URI.resolve(manifest, ko)))
    })
  } catch (error) {
    console.log(error.message)
    console.log()
  }
  return kos
}

function extractAssets(manifest, targetDir, extract) {
  let downloadedKoList = []
  if (manifest.length > 0) {
    manifest.forEach(uri => {
      let ko = url.fileURLToPath(uri)
      if (fs.pathExistsSync(ko)) {
        if (extract) {
          try {
            let zip = new AdmZip(ko)
            zip.extractAllTo(targetDir, true)
          } catch (err) {
            console.log(`Extraction of ${ko} error`)
          }
        } else {
          fs.copySync(ko, path.join(targetDir, path.basename(ko)))
        }
        downloadedKoList.push(uri)
        console.log(`Retrieving ${ko} ...... fulfilled`)
      } else {
        console.log(`Retrieving ${ko} ...... failed`)
      }
    })
  }
  return downloadedKoList
}

function downloadAssets(manifest, targetDir, extract) {
  let requests = [];
  manifest.forEach(zippedKo => {
    requests.push(downloadPromise(zippedKo, targetDir, extract));
  })
  return Promise.allSettled(requests)
}

function downloadPromise(asset, basePath, extract) {
  return new Promise((resolve, reject) => {
    download(asset, path.join(basePath), {'extract': extract})
      .then(() => {
        resolve(asset);
      })
      .catch(() => {
        reject(asset);
      });
  })
}

function cleanupAndCreateManifest(finalManifest, destination, tmp) {
  let manifestJSON = []
  if (process.env.DEBUG) console.log(finalManifest)
  if (finalManifest.length > 0) {
    finalManifest.forEach(e => {
      let id;
      if (fileIsRemote(e)) {
        id = path.basename(url.parse(e).pathname)
      } else if (e.startsWith('file://')) {
        id = path.basename(url.fileURLToPath(e))
      } else {
        id = e
      }
      manifestJSON.push(
        {
          "@id": id,
          "@type": "koio:KnowledgeObject"
        }
      )
    })
    fs.writeJsonSync(path.join(destination, 'manifest.json'), manifestJSON, {spaces: 4})
  }
  fs.rmdirSync(tmp, {recursive: true})
}

function fileIsRemote(file) {
  return file.startsWith('https://') || file.startsWith('http://');
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

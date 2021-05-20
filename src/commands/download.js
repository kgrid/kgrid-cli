const {Command, flags} = require('@oclif/command')
const {cli} = require('cli-ux');
const documentations = require('../json/extradoc.json')
const fs = require('fs-extra')
const path = require('path')
const os = require('os')
const download = require('download');
const URI=require('uri-js');
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
      let koList ={"remoteList":[],"localList":[]}
      let finalManifest = {manifest:[]}
      if(manifest==null && file==null){
        console.log("Please specify the file or the manifest for downloading.\n")
        console.log("See more help with --help")
        return 1
      } else {

        fs.ensureDirSync(destination)
        fs.ensureDirSync(tmp)
        console.log("The downloaded KOs will be stored in "+destination+".\n");

        // "-f" Specified file
        if(file!=null){
          let l = []
          let fileList = file.split(',')
          // console.log(fileList)
          fileList.forEach(e=>{
            if(e.startsWith('https://') | e.startsWith('http://')){
              koList.remoteList.push(e)
            }else if(e.startsWith('file://')) {
              koList.localList.push(e)
            }else {
              const baseUri = new URL(`file://${tmp}`);
                console.log(baseUri)
              let uriCheck = URI.resolve(baseUri.href,e)
              console.log(uriCheck)
              if(fs.existsSync(url.fileURLToPath(uriCheck))) {
                koList.localList.push(uriCheck)
              }
            }
          })
          if(koList.localList.length>0){
            l = extractAssets(koList.localList, destination, extract)
            l.forEach(e=>{
              finalManifest.manifest.push(e)
            })
            if(koList.remoteList.length==0) {
              cleanup(finalManifest, destination, tmp)
            }
          }
          if(koList.remoteList.length>0){
            downloadAssets(koList.remoteList, destination, extract)
            .then(values => {
                values.forEach(v=>{
                  console.log(`Downloading ${v.value||v.reason} ...... ${v.status}`)
                  if(v.value){
                    finalManifest.manifest.push(v.value)
                  }
                })
                cleanup(finalManifest, destination, tmp)
              })
              .catch(error => {
                if(process.env.DEBUG) console.log(error.message);
              });
          }
        }

        // "-m" Specified mainfest file(s)
        if(manifest){

          let manifestList=manifest.split(',')
          let requests = [];
          manifestList.forEach(e=>{
            let entry=e.trim()
            requests.push(processManifestPromise(e,tmp));
          })
          Promise.allSettled(requests).then(values => {
            // console.log(values)
            values.forEach(m=>{
              m.value.forEach(ko=>{
                if(ko.startsWith('https://') | ko.startsWith('http://')){
                  koList.remoteList.push(ko)
                }
                else {
                 koList.localList.push(ko)
                }
              })
            })

            if(process.env.DEBUG){
              console.log('Kos to be loaded\n====================')
              console.log(koList.remoteList.concat(koList.localList))
            }
            let l = []
            // Extract KOs from the list of local KOs
            if(koList.localList.length>0){
              l = extractAssets(koList.localList, destination, extract)
              l.forEach(e=>{
                finalManifest.manifest.push(e)
              })
              if(koList.remoteList.length==0) {
                cleanup(finalManifest, destination, tmp)
              }
            }
            //Download and extract from the list of remote KOs
            if(koList.remoteList.length>0){
              downloadAssets(koList.remoteList, destination, extract)
              .then(values => {
                  values.forEach(v=>{
                    if(v.status!=='rejected'){
                      finalManifest.manifest.push(v.value)
                    }
                    console.log(`Downloading ${v.value||v.reason} ...... ${v.status}`)
                  })
                })
                .finally(()=>{
                  cleanup(finalManifest, destination, tmp)
                });
            }
          }).finally(()=>{
            fs.rmdirSync(tmp, { recursive: true })
          });
        }
    }
  }
}

DownloadCommand.description = `Download a collection of Knowledge Object to the current directory.
${documentations.download}
`

DownloadCommand.flags = {
  file: flags.string({char: 'f', description:'The filename of the packaged KO to be downloaded',exclusive: ['manifest']}),
  manifest: flags.string({char: 'm', description:'The manifest file listing the KOs to be downloaded'}),
  extract: flags.boolean({char:'e', description:'Extract the entries from the zip file'}),
  help: flags.help({char:'h'}),
  destination: flags.string({ char:'d',description:'The directory to store the downloaded KO(s)'})
}

DownloadCommand.args = []

function cleanup(finalManifest, destination, tmp) {
  let manifestJSON = { manifest:[] }
  if(process.env.DEBUG) console.log(finalManifest)
  if(finalManifest.manifest.length>0){
    finalManifest.manifest.forEach(e=>{
      if (e.startsWith('https://') | e.startsWith('http://')) {
        manifestJSON.manifest.push(path.basename(url.parse(e).pathname))
      } else if(e.startsWith('file://')) {
          manifestJSON.manifest.push(path.basename(url.fileURLToPath(e)))
      } else {
          manifestJSON.manifest.push(e)
      }
    })
    fs.writeJsonSync(path.join(destination, 'manifest.json'), manifestJSON, {spaces: 4})
  }
  fs.rmdirSync(tmp, { recursive: true })
}
function processManifestPromise(manifest, tmp){
  return new Promise((resolve, reject) => {
    let kos=[]
    let manifestStringArray = manifest.split('/')
    let manifestName = manifestStringArray[manifestStringArray.length-1]
    if(manifest.startsWith('https://') | manifest.startsWith('http://')){
      download(manifest, tmp)
      .then(() => {
        kos = readRemoteManifest(manifest, tmp)
        resolve(kos);
      })
      .catch(()=>{
        reject(manifest);
      });
    } else {
      try{
        kos = readLocalManifest(manifest)
        resolve(kos)
      }catch(error){
        reject(error.message)
      }
    }
  })
}

function readLocalManifest(manifest){
  let kos = []
  let manifestPath=manifest
  if(manifest.startsWith('file://')){
    manifestPath=url.fileURLToPath(manifest)
  }
  let manifestUri = new URL(`file://${manifestPath}`)
  if(fs.existsSync(manifestPath)) {
    console.log(`Reading Manifest from ${manifestPath}\n`)
    let manifestJson = fs.readJsonSync(manifestPath)
    if(process.env.DEBUG) {
      console.log(`From ${manifest}:\n `)
      console.log(manifestJson.manifest)
    }
    manifestJson.manifest.forEach(ko=>{
      kos.push(URI.resolve(manifestUri.href, ko))
    })
  } else {
    console.log(`File nout found: ${manifestPath}`)
  }
  return kos
}

function readRemoteManifest(manifest, tmp){
  let kos = []
  console.log(`Reading Manifest from ${manifest}\n`)
  let manifestStringArray = manifest.split('/')
  let manifestName = manifestStringArray[manifestStringArray.length-1]
  try {
    let manifestJson = fs.readJsonSync(path.join(tmp,manifestName))
    if(process.env.DEBUG) {
      console.log(`From ${manifest}:\n `)
      console.log(manifestJson.manifest)
    }
    manifestJson.manifest.forEach(ko=>{
      kos.push(URI.resolve(manifest, ko))
    })
  } catch(error) {
    console.log(error.message)
    console.log()
  }
  return kos
}

function extractAssets(manifest, targetDir, extract){
  let downloadedKoList = []
  if(manifest.length>0){
    manifest.forEach(uri=>{
      let ko = url.fileURLToPath(uri)
      if(fs.pathExistsSync(ko)){
        if(extract){
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

function downloadAssets (manifest, targetDir, extract) {
  let requests = [];
  let downloadedKoList = []
  manifest.forEach(zippedKo=> {
    requests.push(downloadPromise(zippedKo,targetDir, extract));
  })
  return Promise.allSettled(requests)
}

function downloadPromise (asset, basePath, extract) {
  return new Promise((resolve, reject) => {
    download(asset, path.join(basePath), {'extract':extract})
      .then(() => {
          resolve(asset);
        })
      .catch(()=>{
          reject(asset);
        });
    })
}

module.exports = DownloadCommand

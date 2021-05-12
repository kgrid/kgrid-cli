const {Command, flags} = require('@oclif/command')
const {cli} = require('cli-ux');
const documentations = require('../json/extradoc.json')
const fs = require('fs-extra')
const path = require('path')
const os = require('os')
const download = require('download');
const AdmZip = require('adm-zip');

class DownloadCommand extends Command {
  async run() {
      const {args, flags} = this.parse(DownloadCommand)
      var manifest = flags.manifest
      var file = flags.file
      var destination = flags.destination || process.cwd()
      var tmp = path.join(destination, 'tmp')
      var koList ={"remoteList":[],"localList":[]}
      let success = false
      fs.ensureDirSync(destination)
      fs.ensureDirSync(tmp)
      console.log("The downloaded KOs will be stored in "+destination+".\n");

      // "-f" Specified file
      if(file!=null){
        if(file.startsWith('https://') | file.startsWith('http://')){
          koList.remoteList.push(file)
          downloadAssets(koList.remoteList, destination)
        } else {
          koList.localList.push(file)
          extractAssets(koList.localList, destination)
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
        Promise.all(requests).then(values => {
          values.forEach(m=>{
            m.forEach(ko=>{
              if(ko.startsWith('https://') | ko.startsWith('http://')){
                koList.remoteList.push(ko)
              }
              else {
               koList.localList.push(ko)
              }
            })
          })

          if(process.env.DEBUG){
            console.log('Kos to be downloaded\n====================')
            console.log(koList.remoteList.concat(koList.localList))
          }
          // Extract KOs from the list of local KOs
          if(koList.localList.length>0){
            extractAssets(koList.localList, destination)
          }
          //Download and extract from the list of remote KOs
          if(koList.remoteList.length>0){
            downloadAssets(koList.remoteList, destination)
          }
        })
        .catch(reject => {
          console.error(reject+'\n');
        }).finally(()=>{
          fs.rmdirSync(tmp, { recursive: true })
        });
      }
  }
}

DownloadCommand.description = `Download a collection of Knowledge Object to the current directory.
${documentations.download}
`

DownloadCommand.flags = {
  file: flags.string({char: 'f', description:'The filename of the packaged KO to be downloaded',exclusive: ['manifest']}),
  manifest: flags.string({char: 'm', description:'The manifest file listing the KOs to be downloaded'}),
  help: flags.help({char:'h'}),
  destination: flags.string({ char:'d',description:'The directory to store the downloaded KO(s)'})
}

DownloadCommand.args = []

function processManifestPromise(manifest, tmp){
  return new Promise((resolve, reject) => {
    let kos=[]
    if(manifest.startsWith('https://') | manifest.startsWith('http://')){
      download(manifest, path.join(tmp), {'extract':true})
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
  console.log(`Reading Manifest from ${manifest}\n`)
  let sourcePath = path.dirname(manifest) || process.cwd()
  let manifestJson = fs.readJsonSync(manifest)
  if(process.env.DEBUG) {
    console.log(`From ${manifest}:\n `)
    console.log(manifestJson.manifest)
  }
  manifestJson.manifest.forEach(ko=>{
    kos.push(path.join(sourcePath, ko))
  })
  return kos
}

function readRemoteManifest(manifest, tmp){
  let kos = []
  console.log(`Reading Manifest from ${manifest}\n`)
  let manifestStringArray = manifest.split('/')
  let manifestName = manifestStringArray[manifestStringArray.length-1]
  let baseUrl = manifest.replace(manifestName, '')
  let manifestJson = fs.readJsonSync(path.join(tmp,manifestName))
  if(process.env.DEBUG) {
    console.log(`From ${manifest}:\n `)
    console.log(manifestJson.manifest)
  }
  manifestJson.manifest.forEach(ko=>{
    kos.push(baseUrl+ko)
  })
  return kos
}

function extractAssets(manifest, targetDir){
  if(manifest.length>0){
    manifest.forEach(ko=>{
      if(fs.pathExistsSync(ko)){
        try {
          let zip = new AdmZip(ko)
          zip.extractAllTo(targetDir)
        } catch (err) {
          console.log(`Extraction of ${ko} error`)
        }
      } else {
        console.log(`File not found: ${ko}`);
      }
    })
  }
}

function downloadAssets (manifest, targetDir) {
  let requests = [];
  manifest.forEach(zippedKo=> {
    requests.push(downloadPromise(zippedKo,targetDir));
  })
  cli.action.start('Downloading KO ...');
  Promise.all(requests).then(values => {
    cli.action.stop('done');
  })
  .catch(error => {
    console.log(error.message);
  });
}

function downloadPromise (asset, basePath) {
  return new Promise((resolve, reject) => {
    download(asset, path.join(basePath), {'extract':true})
      .then(() => {
          if(process.env.DEBUG) console.log(`Downloading ${asset} .... completed`)
          resolve(asset);
        })
      .catch(()=>{
          reject(asset);
        });
    })
}

module.exports = DownloadCommand

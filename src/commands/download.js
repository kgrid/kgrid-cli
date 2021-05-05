const {Command, flags} = require('@oclif/command')
const documentations = require('../json/extradoc.json')
const parseInput = require('../parse_input')
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
      var list = flags.list
      var destination = flags.destination || process.cwd()

      var koList ={"remoteList":[],"localList":[]}
      let success = false
      console.log("The downloaded KOs will be stored in "+destination+".\n");

      // "-m" Specified mainfest
      if (manifest!=null) {
          let processedManifest = processManifest(manifest)
          processedManifest.remoteList.forEach(e=>{koList.remoteList.push(e)})
          processedManifest.localList.forEach(e=>{koList.localList.push(e)})
      }

      // "-f" Specified file
      if(file!=null){
        if(file.startsWith('https://') | file.startsWith('http://')){
          console.log("Under development. Will download the zip file ... ")
        } else {
          koList.localList.push(file)
        }
      }

      // "-l" Specified a list of manifest files
      if(list){
        let manifestList=list.split(',')
        manifestList.forEach(e=>{
          let entry=e.trim()
          let processedManifest = processManifest(entry)
          processedManifest.remoteList.forEach(e=>{koList.remoteList.push(e)})
          processedManifest.localList.forEach(e=>{koList.localList.push(e)})
        })
      }

      //Download and extract from the list of remote KOs

      // Extract KOs from the list of local KOs
      if(process.env.DEBUG) console.log(localKoList)
      koList.localList.forEach(ko=>{
        if(fs.pathExistsSync(ko)){
          try {
            let zip = new AdmZip(ko)
            zip.extractAllTo(destination)
            if(process.env.DEBUG) console.log(`Extraction of ${ko} completed`)
            success = true
          } catch (err) {
            console.log(`Extraction of ${ko} error`)
          }
        } else {
          console.log(`File not found: ${ko}`);
        }
      })
      if(success) console.log("KOs extracted to "+destination);
      // this.error("Under developement...", {
      //       // code: "OCLIF_ERR",
      //       ref: "https://kgrid.org/kgrid-cli/#kgrid-download-manifest",
      //       suggestions: ["Please try this command later"],
      //     })
  }
}

DownloadCommand.description = `Download a collection of Knowledge Object to the current directory.
${documentations.download}
`

DownloadCommand.flags = {
  file: flags.string({char: 'f', description:'The filename of the packaged KO to be downloaded',exclusive: ['manifest']}),
  list: flags.string({char: 'l', description:'The list of the manifest files listing KOs to be downloaded',exclusive: ['manifest']}),
  manifest: flags.string({char: 'm', description:'The manifest file listing the KOs to be downloaded'}),
  help: flags.help({char:'h'}),
  destination: flags.string({ char:'d',description:'The directory to store the downloaded KO(s)'})
}

DownloadCommand.args = []

function processManifest(manifest){
  let list = {"remoteList":[],"localList":[]}
  if(manifest.startsWith('https://') | manifest.startsWith('http://')){
    console.log(`Under development. Will download the manifest file: ${manifest}\n`)
  } else {
    try {
      let kos = readlocalmanifest(manifest)
      kos.forEach(ko => { list.localList.push(ko) })
    } catch {
      console.log(`Error reading ${manifest}`)
    }
  }
  return list
}

function readlocalmanifest(manifest){
  let kos = []
  console.log(`Reading Manifest from ${manifest}\n`)
  let sourcePath = path.dirname(manifest) || process.cwd()
  let manifestJson = fs.readJsonSync(manifest)
  if(process.env.DEBUG) console.log(manifestJson)
  manifestJson.manifest.forEach(ko=>{
    kos.push(path.join(sourcePath, ko))
  })
  return kos
}


function downloadAssets (manifest, targetDir) {
  let requests = [];
  manifest.forEach(zippedKo=> {
    requests.push(downloadPromise(zippedKo,targetDir));
  })
  cli.action.start('Downloading KO ...');
  Promise.all(requests).then(function (artifacts) {

  }).then(values => {
    cli.action.stop('done');
    console.log('KOs downloaded');
  })
  .catch(error => {
    console.log(error.message);
  });
}

function downloadPromise (asset, basePath) {
  return new Promise((resolve, reject) => {
    download(asset, path.join(basePath), "{'extract':true}")
      .then(() => {
          resolve(asset);
        })
      .catch(()=>{
          reject(asset);
        });
    })
}

module.exports = DownloadCommand

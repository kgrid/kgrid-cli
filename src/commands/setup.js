const {Command, flags} = require('@oclif/command');
const {cli} = require('cli-ux');
const fs = require('fs-extra')
const path = require('path')
const request = require('request');
const download = require('download');
const kgridmanifest = 'https://demo.kgrid.org/kgrid/manifest.json'
var manifest = {}
var kgridHome = ''

class SetupCommand extends Command {
  async run() {
    const {flags} = this.parse(SetupCommand)
    let userHome =  process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
    kgridHome = path.join(process.cwd(), '.kgrid')
    if(flags.global){
      kgridHome =  process.env.KGRID_HOME || path.join(userHome, '.kgrid');
    }
    this.log("setting up kgrid at", kgridHome);
    fs.ensureDirSync(kgridHome)
    let manifestFile = path.join(kgridHome, 'manifest.json');
    if(fs.pathExistsSync(manifestFile) && !flags.update){
      console.log("Using existing manifest")
      downloadAssets(manifestFile)
    }else {
      download(kgridmanifest, kgridHome, "{'extract':true}").then(() => {
        console.log("Using downloaded manifest")
        downloadAssets(manifestFile)
      })
    }
  }
}

SetupCommand.description = 'Setup KGrid Component'

SetupCommand.flags = {
  global: flags.boolean({char:'g'}),
  update: flags.boolean({char:'u'})
}

function downloadAssets (manifestFile) {
  console.log(kgridHome)
  manifest = fs.readJsonSync(manifestFile)
  let requests = [];
  for (let key in manifest.kitAssets) {
    let asset = JSON.parse(JSON.stringify(manifest.kitAssets[key]));
    asset.name = key;
    requests.push(downloadPromise(asset,kgridHome));
  }
  cli.action.start('Downloading kgrid components');
  Promise.all(requests).then(function (artifacts) {
    artifacts.forEach(function (e) {
      manifest.kitAssets[e.name].installed = e.tag_name;
      manifest.kitAssets[e.name].filename = e.filename;
    })
    fs.writeJsonSync(manifestFile, manifest, {spaces: 4});
  }).then(values => {
    cli.action.stop('done');
    console.log('kgrid setup complete');
  })
  .catch(error => {
    console.log(error.message);
  });
}

function downloadPromise (asset, basePath) {
  return new Promise((resolve, reject) => {
    let download_url = asset.url
    fs.pathExists(path.join(basePath, asset.filename)).then(exists =>{
      if(exists) {
        resolve(asset);
      } else {
        download(download_url, path.join(basePath), "{'extract':true}").then(() => {
          resolve(asset);
        });
      }
    })
  })
}

module.exports = SetupCommand;

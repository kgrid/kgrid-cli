const {Command, flags} = require('@oclif/command');
const {cli} = require('cli-ux');
const fs = require('fs-extra')
const path = require('path')
const os = require('os')
const download = require('download');
const kgridmanifest = 'https://demo.kgrid.org/kgrid/manifest.json'
const documentations = require('../json/extradoc.json')
var userConfig = require('../json/config.json')
const list = require('../getall')
var manifest = {}
var kgridHome = ''

class SetupCommand extends Command {
  async run() {
    var kolist = list(process.cwd())
    if(kolist!=null){
      const {flags} = this.parse(SetupCommand)
      let userHome = process.env.USERPROFILE || process.env.HOME || process.env.HOMEPATH ;
      kgridHome = path.join(process.cwd(), '.kgrid')
      if(flags.global){
        kgridHome =  process.env.KGRID_HOME || path.join(userHome, '.kgrid');
      }
      // Write user config
      let configPath = path.join(userHome,'.config')
      fs.ensureDirSync(configPath)
      let userConfigFile = path.join(configPath, 'kgrid-cli-config.json')
      if(!fs.pathExistsSync(userConfigFile)){
        userConfig.devDefault.naan=os.userInfo().username;
        fs.writeJsonSync(userConfigFile, userConfig, {spaces: 4})
      }
      console.log("Setting up kgrid at", kgridHome);
      fs.ensureDirSync(kgridHome)
      let manifestFile = path.join(kgridHome, 'manifest.json');
      if(fs.pathExistsSync(manifestFile) && !flags.update){
        downloadAssets(manifestFile)
      }else {
        download(kgridmanifest, kgridHome, "{'extract':true}").then(() => {
          downloadAssets(manifestFile)
        })
      }
    }
  }
}

SetupCommand.description = `Install KGrid Components and set up kgrid environment.
${documentations.setup}
`
SetupCommand.flags = {
  global: flags.boolean({char:'g',description:'Install at a globally accessible location'}),
  update: flags.boolean({char:'u', description:'Update the KGrid components to the latest release'})
}

function downloadAssets (manifestFile) {
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

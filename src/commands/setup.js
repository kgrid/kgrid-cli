const {Command, flags} = require('@oclif/command');
const {cli} = require('cli-ux');
const fs = require('fs-extra')
const path = require('path')
const jp = require('jsonpath');
const request = require('request');
const download = require('download');
let manifest = require('../template/manifest.json');
const filter = 'browser_download_url';

class SetupCommand extends Command {
  async run() {
    const {flags} = this.parse(SetupCommand)
    let userHome =  process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
    let kgridHome = flags.home || process.env.KGRID_HOME || path.join(userHome, '.kgrid');

    this.log("setting up kgrid at", kgridHome);

    fs.ensureDirSync(kgridHome)
    let manifestFile = path.join(kgridHome, 'manifest.json');
    if (fs.pathExistsSync(manifestFile)) {
      manifest = fs.readJsonSync(manifestFile)
    } else {
      fs.writeJsonSync(manifestFile, manifest, {spaces: 4})
    }

    let requests = [];
    for (let key in manifest.kitAssets) {
      let asset = JSON.parse(JSON.stringify(manifest.kitAssets[key]));
      asset.name = key;
      requests.push(downloadAssets(asset,kgridHome));

    }
    cli.action.start('downloading kgrid components');
    fs.ensureDirSync(path.join(kgridHome, 'shelf'))
    await Promise.all(requests).then(function (artifacts) {

      artifacts.forEach(function (e) {
        manifest.kitAssets[e.name].installed = e.tag_name;
        manifest.kitAssets[e.name].filename = e.filename;
      })
      // console.log(artifacts)
      fs.writeJsonSync(manifestFile, manifest, {spaces: 4});
      cli.action.stop('done');
    }).then(values => {
      this.log('kgrid setup complete');
    })
    .catch(error => {
      this.log(error.message);
    });

  }
}

SetupCommand.description = 'Setup KGrid Component'

SetupCommand.flags = {
  home: flags.string({}),
}

function downloadAssets (asset, basePath) {
  let url;
  // If no tag is specified get the latest
  if(asset.tag_name && asset.tag_name!='') {
    url = asset.url + "/releases/tags/" + asset.tag_name;
  } else {
    url = asset.url + "/releases/latest";
  }
  let options = {
    url: url,
    headers: {
      "user-agent": "request"
    }
  };

  return new Promise((resolve, reject) => {
    request(options, function (error, response, body) {
      if (error) {
        reject(error);
      } else {
        let resp = JSON.parse(body);
        let assets = resp.assets;
        let filteredasset = assets.filter(function (e) {
          return (e.name == asset.filename) || (asset.filename == '');
        });
        let download_url = filteredasset[0][filter];
        let tag_name = jp.value(JSON.parse(body), '$.tag_name');
        let artifact = {};
        let filename = download_url.substring(download_url.lastIndexOf('/') + 1);
        artifact.name = asset.name;
        artifact.filename = filename;
        artifact.tag_name = tag_name;
        fs.pathExists(path.join(basePath, filename)).then(exists =>{
          if(exists) {
            resolve(artifact);
          } else {
            download(download_url, path.join(basePath,asset.destination), "{'extract':true}").then(() => {
              resolve(artifact);
            });
          }
        })
      }
    })
  });
}

module.exports = SetupCommand;

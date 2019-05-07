const {Command, flags} = require('@oclif/command')
const {cli} = require('cli-ux');
// const inquirer = require('inquirer')
const fs = require('fs-extra')
const path = require('path')
const shelljs = require('shelljs')
const jp = require('jsonpath');
const request = require('request');
const download = require('download');
var manifest = require('../template/manifest.json');

// const {spawnSync} = require("child_process")

const filter = 'browser_download_url';

class SetupCommand extends Command {
  async run() {
    // this.log(process.platform)
    const {flags} = this.parse(SetupCommand)
    let userHome = '';
    if (process.platform == 'win32'){
      userHome = process.env.USERPROFILE
    } else {
      userHome = process.env.HOME || process.env.HOMEPATH
    }
    let home = flags.home || userHome;
    let kgridHome = path.join(home, '.kgrid');

    // Set Environment Variable KGRID_HOME if not existing
    let khome = process.env.KGRID_HOME;
    if (!khome) {
      shelljs.env['KGRID_HOME']=kgridHome
      khome = process.env.KGRID_HOME;
    }
    this.log("looking for kgrid home at " + khome);
    fs.ensureDirSync(khome)
    process.chdir(khome)
    this.log('Found KGRID_HOME at: ' + process.cwd());

    // Download and Install KGRID Components
    let requests = [];
    for(var key in manifest.kitAssets) {
      var asset = JSON.parse(JSON.stringify(manifest.kitAssets[key]));
      if(asset.length != undefined){
        asset.forEach(function(e, index){
          var el = JSON.parse(JSON.stringify(e));
          el.name = key + '-' + index;
          el.destination = 'temp';
          requests.push(downloadAssets(asset))
        })
      } else {
        asset.name=key;
        requests.push(downloadAssets(asset));
      }
    }
    Promise.all(requests);
    fs.ensureDirSync( path.join(kgridHome, 'shelf') )


    if (process.platform == 'win32'){
      this.log('Please open a new terminal window for your next step to use the setting.')
    }
  }
}

SetupCommand.description = 'Setup KGrid Component'

SetupCommand.flags = {
  home: flags.string({}),
}

function downloadAssets (asset) {
  var options = {
    url: asset.url + "/releases/tags/" + asset.tag_name,
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
        var artifact = {};
        let filename = download_url.substring(download_url.lastIndexOf('/') + 1);
        artifact.name = asset.name;
        artifact.filename = filename;
        artifact.tag_name = tag_name;
        fs.pathExists(path.join(asset.destination, filename)).then(exists =>{
          if(exists) {
            console.log("Already have " + filename);
            resolve(artifact);
          } else {
            cli.action.start('downloading ' + asset.name);
            download(download_url, asset.destination, "{'extract':true}").then(() => {
              console.log(filename + " downloaded to "+ asset.destination);
              resolve(artifact);
            }).then(() => {
              cli.action.stop('done');
            });
          }
        })

      }

    })
  });
}

module.exports = SetupCommand

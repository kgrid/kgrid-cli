const {Command, flags} = require('@oclif/command')
const fs = require('fs-extra')
const path = require('path')
const jp = require('jsonpath');
const request = require('request');
const download = require('download');
const Listr = require('listr')
var manifest = require('../template/manifest.json');
var khome = process.env.KGRID_HOME;
const filter = 'browser_download_url';

class SetupCommand extends Command {
  async run() {
    const {flags} = this.parse(SetupCommand)
    let userHome = '';
    if (process.platform == 'win32'){
      userHome = process.env.USERPROFILE
    } else {
      userHome = process.env.HOME || process.env.HOMEPATH
    }
    let home = flags.home
    let kgridHome = path.join(userHome, '.kgrid');

    if(home){
      // if specifying home with flag
      kgridHome = home
      khome = home
      this.log('KGrid will be set up at: '+home)
    } else {
      // if home not specified
      if (!khome) {
        this.log('KGRID_HOME not found. Default location will be used at: '+kgridHome)
        khome = kgridHome;
      }else {
        this.log('Found KGRID_HOME. KGRID will be set up at: '+khome)
      }
    }

    fs.ensureDirSync(khome)
    let manifestFile = path.join(khome,'manifest.json')
    if(fs.pathExistsSync(manifestFile)){
      manifest = fs.readJsonSync(manifestFile)
    } else {
      fs.writeJsonSync(manifestFile, manifest, {spaces: 4})
    }
    // Download and Install KGRID Components
    let taskArray =[]
    for(let key in manifest.kitAssets) {
      let asset = JSON.parse(JSON.stringify(manifest.kitAssets[key]));
      if(asset.length != undefined){
        asset.forEach(function(e, index){
          var el = JSON.parse(JSON.stringify(e));
          el.name = key + '-' + index;
          el.destination = 'temp';
          // requests.push(downloadAssets(asset))
        })
      } else {
        asset.name=key;
        let obj = {
      		title: key,
      		task: ()=> downloadAssets(asset)
      	}
        taskArray.push(obj)
      }
    }
    let tasks = new Listr(taskArray)

    tasks.run()
    .catch(err => {
    	console.error(err);
    });
    // Promise.all(requests).then(function(artifacts){
    //   artifacts.forEach(function(e){
    //     manifest.kitAssets[e.name].installed = e.tag_name
    //     manifest.kitAssets[e.name].filename = e.filename
    //   })
    //   // console.log(artifacts)
    //   fs.writeJsonSync(manifestFile, manifest, {spaces: 4})
    // });

  }
}

SetupCommand.description = 'Setup KGrid Component'

SetupCommand.flags = {
  home: flags.string({}),
}

function downloadAssets (asset) {
  let url;
  // If no tag is specified get the latest
  if(asset.tag_name && asset.tag_name!='') {
    url = asset.url + "/releases/tags/" + asset.tag_name;
  } else {
    url = asset.url + "/releases/latest"
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
        fs.pathExists(path.join(khome, filename)).then(exists =>{
          if(exists) {
            resolve(artifact);
          } else {
            download(download_url, path.join(khome,asset.destination), "{'extract':true}").then(() => {
              resolve(artifact);
            });
          }
        })

      }

    })
  });

}

module.exports = SetupCommand

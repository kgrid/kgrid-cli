const {Command, flags} = require('@oclif/command')
const fs = require('fs-extra')
const path = require('path')
const shelljs = require('shelljs')
const download = require('download');
const kgridmanifest = 'https://demo.kgrid.org/kgrid/manifest.json'
const kHome = require('./kgridhome')
function runKgrid(cmd) {
  let shelf = cmd.shelf
  let kgridcomponent = cmd.component
  let port = cmd.port
  let cmdstring ='java -jar '
  let khome = kHome()

  if(fs.pathExistsSync(khome)){
    let manifest = fs.readJsonSync(path.join(khome, 'manifest.json'))
    let key = cmd.name
    if (kgridcomponent == '') {
      kgridcomponent = manifest.kitAssets[key].filename
    }
    cmdstring = cmdstring + path.join(khome, kgridcomponent)
    if(shelf == ''){
      shelf = process.cwd()
    }
    if(shelf!=''){
      cmdstring = cmdstring + ' --kgrid.shelf.cdostore.url=filesystem:file:///' + shelf.split(path.sep).join('/')
    }
    if(port!=''){
      cmdstring = cmdstring + ' --server.port='+port
    }
    console.log(cmdstring)
    download(kgridmanifest).then(data => {
      kgridAssets = JSON.parse(data).kitAssets[key]
      if(manifest.kitAssets[key].installed==kgridAssets.tag_name){
        console.log(key+": You have the latest version.")
      } else {
        if(manifest.kitAssets[key].installed<kgridAssets.tag_name){
          console.log(key+": A new version is available. Please run `kgrid setup -u` to update.")
        } else {
          console.log(key+": You are running a development version.")
        }
      }
      console.log("Starting KGrid "+cmd.name+"...")
      shelljs.exec(cmdstring, {async:true})
    })
  } else {
    console.log('Could not find the directory with the required KGRID component. Please run "kgrid setup".')
  }
}

module.exports = runKgrid

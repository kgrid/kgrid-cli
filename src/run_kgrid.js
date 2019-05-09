const {Command, flags} = require('@oclif/command')
const fs = require('fs-extra')
const path = require('path')
const shelljs = require('shelljs')

function runKgrid(cmd) {
  let shelf = cmd.shelf
  let kgridcomponent = cmd.component
  let port = cmd.port
  let cmdstring ='start java -jar '

  let userHome = '';
  if (process.platform == 'win32'){
    userHome = process.env.USERPROFILE
  } else {
    userHome = process.env.HOME || process.env.HOMEPATH
  }
  let khome = process.env.KGRID_HOME;
  let kgridHome = path.join(userHome, '.kgrid');

  if (!khome) {
    khome = kgridHome;
  }
  if(fs.pathExistsSync(khome)){
    let manifest = fs.readJsonSync(path.join(khome, 'manifest.json'))
    let key = cmd.name
    if (kgridcomponent == '') {
      kgridcomponent = manifest.kitAssets[key].filename
    }
    if(shelf == ''){
      // Use Current Directory as shelf
      shelf = process.cwd()
    }
    cmdstring = cmdstring + path.join(khome, kgridcomponent) + ' --server.port='+port+' --kgrid.shelf.cdostore.url=filesystem:file:///' + shelf.split(path.sep).join('/')
    console.log(cmdstring)
    shelljs.exec(cmdstring, {async:true})
  } else {
    console.log('Could not find the directory set as KGRID_HOME. Please run "kgrid setup".')
  }
}

module.exports = runKgrid

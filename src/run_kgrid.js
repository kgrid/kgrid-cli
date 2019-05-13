const {Command, flags} = require('@oclif/command')
const fs = require('fs-extra')
const path = require('path')
const shelljs = require('shelljs')

function runKgrid(cmd) {
  let shelf = cmd.shelf
  let kgridcomponent = cmd.component
  let port = cmd.port
  let cmdstring ='java -jar '

  let userHome = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE
  let khome = process.env.KGRID_HOME;
  let kgridHome = path.join(userHome, '.kgrid');
  let currentHome = path.join(process.cwd(), '.kgrid');

  if (!khome) {
    khome = currentHome
    if(!fs.pathExistsSync(khome)){
      console.log("Could not find the required KGRID Component in current directory. \nWill look for the component in the default kgrid directory ...")
      khome = kgridHome;
    }
  }

  if(fs.pathExistsSync(khome)){
    console.log("Starting KGrid "+cmd.name+"...")
    let manifest = fs.readJsonSync(path.join(khome, 'manifest.json'))
    let key = cmd.name
    if (kgridcomponent == '') {
      kgridcomponent = manifest.kitAssets[key].filename
    }
    if(shelf == ''){
      shelf = process.cwd()
    }
    cmdstring = cmdstring + path.join(khome, kgridcomponent) + ' --server.port='+port+' --kgrid.shelf.cdostore.url=filesystem:file:///' + shelf.split(path.sep).join('/')
    shelljs.exec(cmdstring, {async:true})
  } else {
    console.log('Could not find the directory with the required KGRID component. Please run "kgrid setup".')
  }
}

module.exports = runKgrid

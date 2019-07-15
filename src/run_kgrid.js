const fs = require('fs-extra')
const path = require('path')
const shelljs = require('shelljs')

function runKgrid(cmd) {
  let shelf = cmd.shelf
  let kgridcomponent = cmd.component
  let port = cmd.port
  let cmdstring ='java -jar '
  let manifest = fs.readJsonSync(path.join(cmd.khome, 'manifest.json'))
  let key = cmd.name
  if (kgridcomponent == '') {
    kgridcomponent = manifest.kitAssets[key].filename
  }
  cmdstring = cmdstring + path.join(cmd.khome, kgridcomponent)
  if(shelf == ''){
    shelf = process.cwd()
  }
  cmdstring = cmdstring + ' --kgrid.shelf.cdostore.url=filesystem:file:///' + shelf.split(path.sep).join('/')
  if(port!=''){
    cmdstring = cmdstring + ' --server.port='+port
  }
  console.log(cmdstring)
  console.log("Starting KGrid "+cmd.name+"...")
  shelljs.exec(cmdstring, {async:true})
}

module.exports = runKgrid

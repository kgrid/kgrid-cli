const fs = require('fs-extra')
const path = require('path')
const shelljs = require('shelljs')

function runKgrid(cmd) {
  let shelf = cmd.shelf
  let kgridcomponent = cmd.component
  let port = cmd.port
  let komanifest = cmd.manifest
  let cmdstring ='java -jar '
  let manifest = fs.readJsonSync(path.join(cmd.khome, 'manifest.json'))
  let key = cmd.name
  if (kgridcomponent == '') {
    kgridcomponent = manifest.kitAssets[key].filename
  }
  cmdstring = cmdstring + path.join(cmd.khome, kgridcomponent)
  var basePath = process.cwd()
  cmdstring = cmdstring + ' --kgrid.shelf.cdostore.url=filesystem:file:///' + path.resolve(basePath, shelf).split(path.sep).join('/')
  if(port!=''){
    cmdstring = cmdstring + ' --server.port='+port
  }
  if(komanifest!=""){
    cmdstring = cmdstring + ' --kgrid.shelf.manifest='+komanifest
  }
  console.log(cmdstring+"\n\nStarting KGrid "+cmd.name+"...")
  shelljs.exec(cmdstring, {async:true})
}

module.exports = runKgrid

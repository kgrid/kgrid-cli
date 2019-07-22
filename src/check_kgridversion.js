const colors = require('colors/safe');
const fs = require('fs-extra')
const path = require('path')
const kHome = require('./kgridhome')
const download = require('download')

async function checkKgridVersion(component) {
    let khome = kHome()
    console.log(colors.green('Checking KGrid Components Version ...'))
    if(fs.pathExistsSync(khome)){
      console.log('KGRID Components are installed at: '+khome+'\n')
      let manifest = fs.readJsonSync(path.join(khome, 'manifest.json'))
      await download('https://demo.kgrid.org/kgrid/manifest.json')
      .then(data => {
        let kgridAssets = JSON.parse(data).kitAssets
        let promptUpdate = false
        if(component!='activator'){
          let libraryStatus = 'Development Version'
          if(manifest.kitAssets.library.installed==kgridAssets.library.tag_name){
            libraryStatus = 'Latest Version'
          } else {
            promptUpdate = true
            if(manifest.kitAssets.library.installed<kgridAssets.library.tag_name){
              libraryStatus = '\n      A new version ('+kgridAssets.library.tag_name+') is available.'
            }
          }
          console.log('  KGRID Library:   version '+manifest.kitAssets.library.installed + '    '+libraryStatus+'\n')
        }
        if(component!='library'){
          let activatorStatus = 'Development Version'
          if(manifest.kitAssets.activator.installed==kgridAssets.activator.tag_name){
            activatorStatus = 'Latest Version'
          } else {
            promptUpdate = true
            if(manifest.kitAssets.activator.installed<kgridAssets.activator.tag_name){
              activatorStatus = '\n      A new version ('+kgridAssets.activator.tag_name+') is available.'
            }
          }
          console.log('  KGRID Activator: version '+manifest.kitAssets.activator.installed+'    '+activatorStatus+'\n')
        }
        if(promptUpdate) {
          console.log('To install the latest release version, run `kgrid setup -u` to update.\n')
        }
      })
      .catch(error=>{
        console.log(error)
      })
    } else {
      console.log('KGRID components are not installed. Please run "kgrid setup".')
    }
    return khome
}

module.exports=checkKgridVersion

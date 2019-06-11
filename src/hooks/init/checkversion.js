const colors = require('colors/safe');
const shelljs = require('shelljs');
const fs = require('fs-extra')
const path = require('path')
const kHome = require('../../kgridhome')
module.exports = async function () {
    let cmd = process.argv[2]
    if(cmd=='version'|cmd=='-v'|cmd=='--version') {
      console.log(colors.inverse('Checking JAVA Version ...'))
      shelljs.exec('java -version')
      console.log('')
      console.log(colors.inverse('Checking Node Version ...'))
      shelljs.exec('node --version')
      console.log('')
      let khome = kHome()
      console.log(colors.inverse('Checking KGrid Components Version ...'))
      if(fs.pathExistsSync(khome)){
        console.log('KGRID Components are installed at: '+khome)
        let manifest = fs.readJsonSync(path.join(khome, 'manifest.json'))
        let key = 'library'
        console.log('  KGRID Library:   version '+manifest.kitAssets.library.installed)
        console.log('  KGRID Activator: version '+manifest.kitAssets.activator.installed+'\n')
      } else {
        console.log('KGRID components are not installed. Please run "kgrid setup".\n')
      }
      console.log('=========================================================')
    } else {
      console.log(colors.blue('KGrid CLI v'+this.config.version+'\n'))
    }
}

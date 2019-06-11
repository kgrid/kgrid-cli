const colors = require('colors/safe');
const shelljs = require('shelljs');
const fs = require('fs-extra')
const path = require('path')
const kHome = require('../../kgridhome')
module.exports = async function () {
    let cmd = process.argv[2]
    if(cmd=='version'|cmd=='-v'|cmd=='--version') {
      shelljs.exec('java -version')
      console.log('')
      let khome = kHome()

      if(fs.pathExistsSync(khome)){
        console.log('KGRID Components are installed at: '+khome+'\n')
        let manifest = fs.readJsonSync(path.join(khome, 'manifest.json'))
        let key = 'library'
        console.log('    KGRID Library: version '+manifest.kitAssets.library.installed+'\n')
        console.log('    KGRID Activator: version '+manifest.kitAssets.activator.installed+'\n')
      } else {
        console.log('KGRID components are not installed. Please run "kgrid setup".\n')
      }
    } else {
      console.log(colors.blue('KGrid CLI v'+this.config.version+'\n'))
    }
}

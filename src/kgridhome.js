const fs = require('fs-extra')
const path = require('path')

function kgridhome() {
  let userHome = process.env.HOME || process.env.USERPROFILE || process.env.HOMEPATH
  let khome = process.env.KGRID_HOME;
  if (!khome) {
    khome = path.join(process.cwd(), '.kgrid')
    if(!fs.pathExistsSync(khome)){
      khome = path.join(userHome, '.kgrid');
    }
  }
  return khome
}

module.exports = kgridhome

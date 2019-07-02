const fs = require('fs-extra')
const path = require('path')

function kgridhome() {
  let userHome = process.env.HOME || process.env.USERPROFILE || process.env.HOMEPATH
  let khome = process.env.KGRID_HOME;
  let kgridHome = path.join(userHome, '.kgrid');
  let currentHome = path.join(process.cwd(), '.kgrid');
  let kgridAssets = {}
  if (!khome) {
    khome = currentHome
    if(!fs.pathExistsSync(khome)){
      khome = kgridHome;
    }
  }
  return khome
}

module.exports = kgridhome

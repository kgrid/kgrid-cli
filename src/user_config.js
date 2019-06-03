const fs = require('fs-extra')
const path = require('path')

function userConfig() {
  let userHome =  process.env.HOME || process.env.USERPROFILE || process.env.HOMEPATH;
  let configPath = path.join(userHome,'.config')
  let userConfigFile = path.join(configPath, 'kgrid-cli-config.json')

  if(fs.pathExistsSync(userConfigFile)){
    const userConfigJson = fs.readJsonSync(userConfigFile)
    return userConfigJson
  } else {
    return null
  }
}

module.exports = userConfig;

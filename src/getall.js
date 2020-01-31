const path = require('path')
const fs = require('fs-extra')
const klawSync = require('klaw-sync')
const filterFn = item => {
  const basename = path.basename(item.path)
  return basename === '.' || ( basename[0] !== '.' && basename !='node_modules' )
}

function getall(shelf){
  var kolist = []
  try {
    const paths = klawSync(shelf, {nofile: true, depthLimit: 1, filter: filterFn})
    paths.forEach(function(p){
      if(fs.pathExistsSync(path.join(p.path,'metadata.json'))) {
        var meta = fs.readJsonSync(path.join(p.path,'metadata.json'))
        if((!meta['@type'])||(meta['@type'].includes('koio'))) {
          var obj={
            id : meta.identifier,
            version: meta.version,
            path : p.path.replace(shelf,''),
            type : meta['@type']
          }
          kolist.push(obj)
        }
      }
    })
  } catch (error) {
    console.log(error)
    return null
  }
  return kolist
}

module.exports = getall

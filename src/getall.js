const path = require('path')
const fs = require('fs-extra')
const klawSync = require('klaw-sync')
const filterFn = item => {
  const basename = path.basename(item.path)
  return basename === '.' || ( basename[0] !== '.' && basename !='node_modules' )
}

function getall(shelf){
    var kolist = []
    const paths = klawSync(shelf, {nofile: true, depthLimit: 2, filter: filterFn})
    paths.forEach(function(p){
      if(fs.pathExistsSync(path.join(p.path,'metadata.json'))) {
        var meta = fs.readJsonSync(path.join(p.path,'metadata.json'))
        if((!meta['@type'])||(meta['@type'].includes('koio'))) {
          var obj={
            id : meta.identifier,
            path : p.path.replace(shelf,''),
            type : meta['@type']
          }
          kolist.push(obj)
        }
      }
    })
    return kolist
}

module.exports = getall

const path = require('path')
const fs = require('fs-extra')
const klawSync = require('klaw-sync')
const filterFn = item => {
  const basename = path.basename(item.path)
  return basename === '.' || basename[0] !== '.'
}

function getall(shelf){
    var kolist = []
    const files = klawSync(shelf, {nodir: true, depthLimit: 2, filter: filterFn})
    files.forEach(function(file){
      if(path.basename(file.path)=='metadata.json'){
        var meta = fs.readJsonSync(file.path)
        var obj={
          id : meta.identifier,
          path : path.dirname(file.path).replace(shelf,''),
          type : meta['@type']
        }
        kolist.push(obj)
      }
    })
    return kolist
}

module.exports = getall

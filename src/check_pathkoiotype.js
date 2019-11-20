const fs = require('fs-extra')
const path =require('path')

function checkPathKoioType () {
  var pathtype = {
    type: 'shelf',
    shelfpath: process.cwd(),
    kopath: '',
    arkid: ''
  }
  if (fs.existsSync('metadata.json')) {
    let meta = fs.readJsonSync('metadata.json')
    if(meta['@type']){
      if(meta['@type'].replace('koio:','').toLowerCase()=='knowledgeobject') {
        pathtype.kopath = process.cwd()
        pathtype.shelfpath = path.dirname(pathtype.kopath)
        pathtype.type = 'ko'
      }
    }
    pathtype.arkid = meta.identifier+'/'+meta.version
  }
  return pathtype
}

module.exports=checkPathKoioType

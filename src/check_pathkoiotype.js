const fs = require('fs-extra')
const path =require('path')

function checkPathKoioType () {
  var pathtype = {
    type: '',
    shelfpath: '',
    kopath: '',
    arkid: ''
  }
  let koiotype = ''
  if (fs.existsSync('metadata.json')) {
    let meta = fs.readJsonSync('metadata.json')
    if(meta['@type']){
      koiotype = meta['@type'].replace('koio:','').toLowerCase()
    }
    pathtype.arkid = meta.identifier
  }
  if(koiotype=='knowledgeobject') {
      pathtype.kopath = process.cwd()
      pathtype.shelfpath = path.dirname(pathtype.kopath)
      pathtype.type = 'ko'
    } else {
      pathtype.shelfpath = process.cwd()
      pathtype.type = 'shelf'
    }
  return pathtype
}

module.exports=checkPathKoioType

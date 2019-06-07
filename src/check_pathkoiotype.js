const fs = require('fs-extra')
const path =require('path')
const os = require('os')

var pathtype = {
  type: '',
  shelfpath: '',
  kopath: '',
  implpath: ''
}

function checkPathKoioType () {
  let koiotype = ''
  if (fs.existsSync('metadata.json')) {
    let meta = fs.readJsonSync('metadata.json')
    koiotype = meta['@type'].replace('koio:','').toLowerCase()
  }
  switch(koiotype){
    case 'implementation':
      pathtype.implpath = process.cwd()
      pathtype.kopath = path.dirname(pathtype.implpath)
      pathtype.shelfpath = path.dirname(pathtype.kopath)
      pathtype.type = 'implementation'
      break;
    case 'knowledgeobject':
      pathtype.kopath = process.cwd()
      pathtype.shelfpath = path.dirname(pathtype.kopath)
      pathtype.type = 'ko'
      break;
    default:
      pathtype.shelfpath = process.cwd()
      pathtype.type = 'shelf'
      break;
  }
  return pathtype
}

module.exports=checkPathKoioType

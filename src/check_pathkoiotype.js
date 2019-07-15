const fs = require('fs-extra')
const path =require('path')

function checkPathKoioType () {
  var pathtype = {
    type: '',
    shelfpath: '',
    kopath: '',
    implpath: ''
  }
  let koiotype = ''
  if (fs.existsSync('metadata.json')) {
    let meta = fs.readJsonSync('metadata.json')
    if(meta['@type']){
      koiotype = meta['@type'].replace('koio:','').toLowerCase()
    }
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

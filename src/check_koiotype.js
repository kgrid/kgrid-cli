const fs = require('fs-extra')
const path =require('path')
const os = require('os')

function checkKoiotype () {
  if (fs.existsSync('metadata.json')) {
    let meta = fs.readJsonSync('metadata.json')
    let koiotype = meta['@type'].replace('koio:','').toLowerCase()
    if(koiotype=='knowledgeobject'){
      return 'ko'
    } else {
      return 'implementation'
    }
  } else {
    return 'shelf'
  }
}

module.exports=checkKoiotype

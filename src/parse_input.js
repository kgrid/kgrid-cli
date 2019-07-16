const checkPathKoioType = require('./check_pathkoiotype')
const path= require('path')
const fs = require('fs-extra')
const list = require('./getall')

function parseInput(cmd, ark, zip, src) {
  let pathtype = checkPathKoioType()
  let kolist = list(pathtype.shelfpath)
  let koid = {naan:'',name:'',imp:''}
  let arkid = []
  let kopath = ''
  let srckopath = ''
  let pathFound = false
  let pathMatch = true
  if(ark) {
    arkid = ark.split('/')
    if(arkid[0]==''){
      arkid[0]='ark:'
    } else {
      if(arkid[0]!='ark:'){
        arkid.unshift('ark:')
      }
    }
    let idkey=arkid.join('/')
    var idIndex = kolist.findIndex(function(e){  return e.id==idkey })
    if(idIndex!=-1){
      kopath = path.join(pathtype.shelfpath, kolist[idIndex].path)
      pathFound = true
    }
  }
  if(src) {
    if(ark){
      console.log('The input of ark id will be ignored since a source directory is specified to package.\n')
    }
    var dirIndex = kolist.findIndex(function(e){ return path.join(pathtype.shelfpath, src)==path.join(pathtype.shelfpath,e.path)  })
    if(dirIndex!=-1){
      arkid = kolist[dirIndex].id.split('/')
      kopath = path.join(pathtype.shelfpath, kolist[dirIndex].path)
      pathFound = true
    }
  }
  if(zip) {
    if(ark){
      console.log('The input of ark id will be ignored since a file is specified to upload.\n')
      arkid=[]
    }
    if(path.extname(zip)!='.zip'){
      console.log('Only ZIP format is supported. Please package your KO first and try again.')
      return 1
    } else {
      if(fs.pathExistsSync(path.join(pathtype.shelfpath,zip))){
        arkid = path.basename(zip, '.zip').split('-')
        arkid.unshift('ark:')
        pathFound = true
      }
    }
  }
  koid.naan=arkid[1] || ''
  koid.name=arkid[2] || ''
  koid.imp=arkid[3] || ''
  srckopath = (koid.imp=='') ? kopath : path.dirname(kopath)
  pathMatch = (pathtype.type=='shelf') | ((kopath === pathtype.implpath)&&(pathtype.type=='implementation')) | ((pathtype.type=='ko')&&(kopath.includes(pathtype.kopath)))
  if(!pathMatch){
    let curArkid = pathtype.arkid.split('/')
    koid.naan=curArkid[1] || ''
    koid.name=curArkid[2] || ''
    koid.imp=curArkid[3] || ''
    srckopath = pathtype.kopath
    pathFound = true
    console.log('Current directory is the knowledge object of '+pathtype.arkid+'.\n\nThe command line inputs will be ignored.\n')
  }
  if(!pathFound){
      switch(cmd){
        case 'upload':
          console.log('Please provide a valid ark id for the KO or a valid file name in .zip format.\n')
          console.log('  Example: kgrid upload ark:/hello/world\n\nOr\n')
          console.log('  Example: kgrid upload --file hello-world.zip')
          return 1
        case 'play':
          break;
        case 'package':
          console.log('Please provide a valid ark id or a directory of KO\n')
          console.log('  Example: kgrid package ark:/hello/world\n\nOr\n')
          console.log('  Example: kgrid package --source myko')
          return 1
      }
  }
  var parsedInput = {}
  parsedInput.koid = JSON.parse(JSON.stringify(koid))
  parsedInput.fullpath = (cmd=='upload') ? path.join(pathtype.shelfpath, koid.naan+'-'+koid.name+'.zip') : srckopath
  return parsedInput
}

module.exports =  parseInput

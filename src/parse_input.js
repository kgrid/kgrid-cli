const checkPathKoioType = require('./check_pathkoiotype')
const path= require('path')
const fs = require('fs-extra')
const list = require('./getall')

function parseInput(cmd, ark, zip, src, newpath) {
  let pathtype = checkPathKoioType()
  let curArkid = pathtype.arkid.split('/')

  let kolist = list(pathtype.shelfpath)

  let arkid = []
  let fullpath = ''

  let koid = {naan:'',name:'',imp:''}
  let srckopath = ''

  let pathFound = false
  let pathMatch = true

  // console.log('****   DEBUG: Initial Values   ****')
  // console.log(arkid)
  // console.log(fullpath)
  if(ark) {  // For Specify KO ark id
    arkid = ark.split('/')
    if(arkid[0]==''){
      arkid[0]='ark:'
    } else {
      if(arkid[0]!='ark:'){
        arkid.unshift('ark:')
      }
    }
    if(pathtype.type!='shelf'){
      pathMatch = pathtype.type=='ko' ?  checkInputMatch('ko', arkid, curArkid) : checkInputMatch('imp', arkid, curArkid)
      if(pathMatch){
        fullpath = pathtype.kopath
        pathFound =true
      } else {
        console.log('Current directory is the knowledge object of '+pathtype.arkid+'.\n\nPlease change to the directory for the specified KO/Implmentation and try again.\n')
        return 1
      }
    } else {
      let idkey=arkid.join('/')
      var idIndex = kolist.findIndex(function(e){  return e.id==idkey })
      if(idIndex!=-1){
        fullpath = path.join(pathtype.shelfpath, kolist[idIndex].path)
        pathFound = true
      }else {
        console.log(ark+' not found.\n')
        // return 1
      }
      fullpath = (arkid.length==4 && pathtype.type=='implementation')?path.dirname(fullpath):fullpath
    }
    // console.log('****   DEBUG: Values with ARK input  ****')
    // console.log(arkid)
    // console.log(fullpath)
  }

  if(src) { // For package KO from a source directory
    if(ark){
      console.log('The input of ark id will be ignored since a source directory is specified to package.\n')
    }
    var dirIndex = kolist.findIndex(function(e){ return path.join(pathtype.shelfpath, src)===path.join(pathtype.shelfpath,e.path)  })
    if(dirIndex!=-1){
      arkid = kolist[dirIndex].id.split('/')
      if(pathtype.type!='shelf'){
        pathMatch = pathtype.type=='ko' ?  checkInputMatch('ko', arkid, curArkid) : checkInputMatch('imp', arkid, curArkid)
        if(pathMatch){
          fullpath = pathtype.kopath
          pathFound =true
        } else {
          console.log('Current directory is the knowledge object of '+pathtype.arkid+'.\n\nPlease change to the directory for the specified KO/Implmentation and try again.\n')
          return 1
        }
      } else {
        fullpath = path.join(pathtype.shelfpath,kolist[dirIndex].path)
        fullpath = (arkid.length==4)?path.dirname(fullpath):fullpath
        pathFound =true
      }
    }else {
      console.log('Source directory not found.')
      return 1
    }
    console.log('****   DEBUG: Values with SOURCE input  ****')
    console.log(arkid)
    console.log(fullpath)
  }

  if(zip) {  // For upload a zip file
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
      } else {
        console.log('Can not find the zip fil of '+zip+' in the directory of '+pathtype.shelfpath)
        return 1
      }
    }
  }

  if(newpath) { // For create  new implementation
    if(pathtype.type=='implementation'){
      console.log('Current directory is the knowledge object of '+pathtype.arkid+'.\n\nPlease change to the shelf level and try again.\n')
      return 1
    }
    if(pathtype.type=='ko') {
      if(newpath.ko){
        if(path.join(pathtype.shelfpath, newpath.ko)!=pathtype.kopath) {
          console.log('Current directory is the knowledge object of '+pathtype.arkid+'.\n\nPlease change to the shelf level and try again.\n')
          return 1
        }
      }
      if(!newpath.imp){
        console.log('Current directory is the knowledge object of '+pathtype.arkid+'.\n\nTo add an implementation, please provide a name for the implementation.\n\n  Example: kgrid create -i impl')
        return 1
      }else {
      }
    }
    arkid =[]
    fullpath = pathtype.kopath
    arkid.push('ark:')
    arkid.push(curArkid[1]||'')
    if(newpath.ko){
      arkid.push(newpath.ko)
      fullpath = path.join(pathtype.shelfpath, newpath.ko)
    }
    if(newpath.imp){
      arkid.push(newpath.imp)
      if(fs.pathExistsSync(path.join(fullpath, newpath.imp))) {
        console.log('The implementation '+newpath.imp+ ' of '+pathtype.arkid+' alrready exists.\n\nTo add an implementation, please provide a different name for the implementation.\n')
        return 1
      }
    } else {

    }
    if(fullpath!=''){
      pathFound=true
    }
    //
    // console.log('****   DEBUG: Values with Create input  ****')
    // console.log(curArkid)
    // console.log(arkid)
    // console.log(fullpath)
  }

  if(arkid.length!=0){
    koid.naan=arkid[1] ||  ''
    koid.name=arkid[2] ||  ''
    koid.imp=arkid[3] ||  ''
  } else {
    koid.naan=curArkid[1] || ''
    koid.name=curArkid[2] || ''
    koid.imp=curArkid[3] || ''
    fullpath = pathtype.kopath
    pathMatch=true
    if(cmd=='create'){
      pathFound=(curArkid.length>3)
    } else {
      pathFound=(curArkid.length>=3)
    }
  }
  srckopath = fullpath
  koid.imp = curArkid[3] || koid.imp



  // console.log('========================')

  if(!pathFound){
      switch(cmd){
        case 'upload':
          console.log('Please provide a valid ark id for the KO or a valid file name in .zip format.\n')
          console.log('  Example: kgrid upload ark:/hello/world\n\nOr\n')
          console.log('  Example: kgrid upload --file hello-world.zip')
          return 1
        case 'package':
          console.log('Please provide a valid ark id or a directory of KO/implementation\n')
          console.log('  Example: kgrid package ark:/hello/world\n\nOr\n')
          console.log('  Example: kgrid package --source myko')
          return 1
        case 'create':
          console.log('Please provide a valid name for the KO/implementation\n')
          console.log('  Example: kgrid create myko\n\nOr\n')
          console.log('  Example: kgrid create myko -i impl')
          return 1
      }
  }
  var parsedInput = {}
  parsedInput.koid = JSON.parse(JSON.stringify(koid))
  parsedInput.fullpath = (cmd=='upload') ? path.join(pathtype.shelfpath, koid.naan+'-'+koid.name+'.zip') : srckopath
  return parsedInput
}

function checkInputMatch(type, arkid, curArkid){
  let bool = (arkid.length>=3 && curArkid.length>=3)
  if(bool){
    bool = bool && (arkid[1]==curArkid[1]) && (arkid[2]==curArkid[2])
  }
  if(bool && type=='imp' && arkid.length==4){
    bool = bool && (arkid[3]==curArkid[3])
  }
  return bool
}

module.exports =  parseInput

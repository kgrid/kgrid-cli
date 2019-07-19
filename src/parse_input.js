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
  let pathFound = false
  let pathMatch = true

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
      fullpath = (arkid.length==4)?path.dirname(fullpath):fullpath
    }
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

      }
    }
  }

  if(newpath) { // For create  new implementation
    if(pathtype.type=='implementation'){
      console.log('Current directory is the knowledge object of '+pathtype.arkid+'.\n\nPlease change to the shelf level and try again.\n')
      return 1
    }
    if(pathtype.type=='ko') {
      if(newpath.ko!=''){
        if(path.join(pathtype.shelfpath, newpath.ko)!=pathtype.kopath) {
          console.log('Current directory is the knowledge object of '+pathtype.arkid+'.\n\nPlease change to the shelf level and try again.\n')
          return 1
        }
      }
    }
    arkid =[]
    fullpath = pathtype.kopath
    arkid.push('ark:')
    arkid.push(curArkid[1]||'')
    if(newpath.ko!=''){
      arkid.push(newpath.ko)
      fullpath = path.join(pathtype.shelfpath, newpath.ko)
    }else{
      if(pathtype.type=='ko'){
        arkid.push(curArkid[2])
      }
    }
    if(newpath.imp){
      arkid.push(newpath.imp)
      if(fs.pathExistsSync(path.join(fullpath, newpath.imp))) {
        console.log('The implementation of '+arkid.join('/')+' already exists.\n\nTo add an implementation, please provide a different name for the implementation.\n')
        return 1
      }
    }
    if(fullpath!=''){
      pathFound=true
    }
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
  koid.imp = curArkid[3] || koid.imp
  if (cmd=='upload') {
    let fn = (koid.imp!='') ? koid.naan+'-'+koid.name +'-'+koid.imp :koid.naan+'-'+koid.name
    fullpath = path.join(pathtype.shelfpath, fn +'.zip')
    if(!fs.pathExistsSync(fullpath)){
    pathFound =false
    }
  }

  if(!pathFound){
      switch(cmd){
        case 'upload':
          console.log('Can not find the zip file in the directory of '+pathtype.shelfpath+'\n\nPlease package the KO first and try again.')
          return 1
        case 'package':
          console.log('Please provide a valid ark id or a directory of KO/implementation\n')
          console.log('  Example: kgrid package ark:/hello/world\n\nOr\n  Example: kgrid package --source myko')
          return 1
        case 'create':
          console.log('Please provide a valid name for the KO/implementation\n')
          console.log('  Example: kgrid create myko\n\nOr\n  Example: kgrid create myko -i impl')
          return 1
      }
  }
  return {koid : JSON.parse(JSON.stringify(koid)), fullpath : fullpath }
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

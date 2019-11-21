const checkPathKoioType = require('./check_pathkoiotype')
const path= require('path')
const inquirer = require('inquirer')
const fs = require('fs-extra')
const list = require('./getall')

async function parseInput(cmd, ark, zip, src, newpath) {
  let pathtype = checkPathKoioType()
  let curArkid = pathtype.arkid.split('/')
  // console.log(pathtype)
  let kolist = list(pathtype.shelfpath)
  let fullpath = ''
  let koid = {naan:'',name:''}
  if(kolist!=null | cmd=='play'){
    let arkid = []
    let pathFound = false
    let pathMatch = true

    if(src) { // For package KO from a source directory
      if(ark){
        console.log('The input of ark id will be ignored since a source directory is specified to package.\n')
      }
      var dirIndex = kolist.findIndex(function(e){ return path.join(pathtype.shelfpath, src)===path.join(pathtype.shelfpath,e.path)  })
      if(dirIndex!=-1){
        arkid = kolist[dirIndex].id.split('/')
        if(pathtype.type!='shelf'){ //pathtype.type=='ko'
          pathMatch =  checkInputMatch(arkid, curArkid)
          if(pathMatch){
            fullpath = pathtype.kopath
            pathFound =true
          } else {
            console.log('Current directory is the knowledge object of '+pathtype.arkid+'.\n\nPlease change to the directory for the specified KO and try again.\n')
            return 1
          }
        } else {
          fullpath = path.join(pathtype.shelfpath,kolist[dirIndex].path)
          pathFound =true
        }
      }else {
        console.log('Source directory not found.')
        return 1
      }
    }

    if(ark) {  // For Specify KO ark id
      arkid = ark.split('/')
      if(arkid[0]==''){
        arkid[0]='ark:'
      } else {
          if(arkid[0]!='ark:'){
            arkid.unshift('ark:')
          }
      }
      let filteredkolist = []
      if(arkid.length>3){
        filteredkolist = kolist.filter(function(e){
          return (e.version==arkid[3]) && (e.id==arkid[0]+'/'+arkid[1]+'/'+arkid[2])
        })
      } else {
        filteredkolist = kolist.filter(function(e){
          return e.id==arkid[0]+'/'+arkid[1]+'/'+arkid[2]
        })
      }
      let pathCount = checkInputMatchCount(curArkid, filteredkolist)
      console.log(pathCount)
      switch(cmd){
        case 'play':
          break;
        default:
          switch(pathCount){
            case 0:
              if(pathtype.type!='shelf'){  // pathtype.type =='ko'
                console.log('Current directory is the knowledge object of '+pathtype.arkid+'.\n\nPlease change to the directory for the specified KO and try again.\n')
              } else {
                console.log('The specified object can not be found.\n')
                console.log('Please provide a valid ark id or a directory of KO\n\n  Example: kgrid package ark:/hello/world\n\n  Example: kgrid package ark:/hello/world/v1.0\n\nOr\n\n  Example: kgrid package --source myko\n')
              }
              return 1;
            case 1:
              if(pathtype.type!='shelf'){  // pathtype.type =='ko'
                fullpath = pathtype.kopath
                pathFound =true
              } else {
                fullpath = path.join(pathtype.shelfpath, filteredkolist[0].path)
                pathFound = true
              }
              break;
            default: // more then 2 versions
              let versions = filteredkolist.map(function(e){ return e.version})
              let responses = await inquirer.prompt([
                  {
                    type: 'list',
                    name: 'selectedversion',
                    message: 'Please select a version: ',
                    default: 0,
                    // scroll: false,
                    choices: versions,
                    pageSize: Math.min(15, versions.length)
                  }
                ])
              let selectedversionIndex = versions.indexOf(responses.selectedversion)
              console.log()
              fullpath = path.join(pathtype.shelfpath, filteredkolist[selectedversionIndex].path)
              pathFound = true
              break;
          }
          break;

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
        }
      }
    }

    if(newpath) { // For create  new KO
      if(pathtype.type=='ko') {
        console.log('Current directory is the knowledge object of '+pathtype.arkid+'.\n\nPlease change to the shelf level and try again.\n')
        return 1
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
      if(fullpath!=''){
        pathFound=true
      }
    }

    if(arkid.length!=0){
      koid.naan=arkid[1] ||  ''
      koid.name=arkid[2] ||  ''
      koid.version=arkid[3] || ''
    } else {
      koid.naan=curArkid[1] || ''
      koid.name=curArkid[2] || ''
      fullpath = pathtype.kopath
      pathMatch=true
      if(cmd=='create'){
        pathFound=(curArkid.length>2)
      } else {
        pathFound=(curArkid.length>=2)
      }
    }

    if (cmd=='upload') {
      let fn = koid.naan+'-'+koid.name+'-'+koid.version
      fullpath = path.join(pathtype.shelfpath, fn +'.zip')
      if(!fs.pathExistsSync(fullpath)){
        pathFound =false
      }else {
        pathFound =true
      }
    }

    if(!pathFound){
      switch(cmd){
        case 'upload':
          if(koid.name==''){
            console.log('Please specify the KO to be uploaded.\n\n  Example: kgrid upload ark:/99999/myko\n\nOr\n\n  Example: kgrid upload --file 99999-myko.zip\n')
          }else {
            console.log('Can not find the zip file in the directory of '+pathtype.shelfpath+'\n\nPlease package the KO first and try again.\n')
          }
          return 1
        case 'package':
          console.log('Please provide a valid ark id or a directory of KO\n\n  Example: kgrid package ark:/hello/world\n\nOr\n\n  Example: kgrid package --source myko\n')
          return 1
        case 'create':
          console.log('Please provide a valid name for the KO\n\n  Example: kgrid create myko')
          return 1
      }
    }
    return {koid : JSON.parse(JSON.stringify(koid)), fullpath : fullpath }
  } else {
    if(cmd!='play'){
      console.log('Error. Operation not permitted.\n')
      return 1
    } else {
      return {koid : JSON.parse(JSON.stringify(koid)), fullpath : fullpath }
    }
  }
}

function checkInputMatch(arkid, curArkid){
  return (arkid.length>=2 && curArkid.length>=2) ? (arkid[1]==curArkid[1]) && (arkid[2]==curArkid[2]) : false
}

function checkInputMatchCount(curArkid, list){
  if(curArkid.length>3){
    return list.filter(function(e){
      return (e.version==curArkid[3]) && (e.id==curArkid[0]+'/'+curArkid[1]+'/'+curArkid[2])
    }).length
  } else {
    return list.length
  }
}
module.exports =  parseInput

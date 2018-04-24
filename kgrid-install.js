#!/usr/bin/env node

var download = require('download-git-repo')
const downloadurl = require('download');
var program = require('commander')
var path=require('path')
const fs=require('fs-extra')
const ncp=require('ncp').ncp
const exists = require('fs').existsSync
const jsonpath = require('jsonpath')
const klawSync = require('klaw-sync')
const BASE_URL = 'http://localhost';
var template = 'kotemplate'
var tmp = 'tmp'
var gittemplate='kgrid/ko-templates'
var adapters = []
program
  .name('kgrid install')
  .parse(process.argv)

var prop= {}
var paths =[]
if(exists('project.json')){
  prop=JSON.parse(fs.readFileSync('project.json', 'utf8'))
  adapters=prop.adapters
  downloadandinstall()
} else {
  console.log('project.json not found. Checking all knowledge objects in the working directory...')
  var srcpath = process.cwd()
  rawpaths=klawSync(srcpath)
  rawpaths.forEach(function(e){
    if((e.path.toLowerCase().includes('metadata'))){
      paths.push(e)
    }
  })
  paths.forEach(function(e){
    var content = JSON.parse(fs.readFileSync(e.path, 'utf8'))
    var names = jsonpath.query(content, '$..adapterType');
    names.forEach(function(e){
      if(adapters.indexOf(e)==-1){
        adapters.push(e)
      }
    })
  })
  adapters.forEach(function(e){
    console.log('Found adapter type: '+ e)
  })
  download(gittemplate, tmp, err => {
      if(err!=null){
        console.log(err)
      }else {
        prop=JSON.parse(fs.readFileSync('tmp/kotemplate/project.json', 'utf8'))
        prop.project="shelf"
        prop.object='99999-shelf'
        prop.adapters = adapters
        console.log('Generating project.json ...')
        fs.writeFileSync('project.json',JSON.stringify(prop))
        downloadandinstall()
      }
  })
}


function downloadandinstall() {
  fs.ensureDir('tools', err => {
					if(err!=null){
					   console.log(err)
					} else{
					   fs.ensureDir('tools/adapters', err => {
								if(err!=null){console.log(err) }
              })
					   }
					})
  var promises = []
  var act_entry=prop.tools.filter(function(e){return e.name=='activator'})
  var fn = 	'./tools/'+act_entry[0].filename
  if(!exists(fn)){
    console.log('Downloading activator ...')
    promises.push(downloadurl(act_entry[0].download_url+act_entry[0].filename,'tools'))
  }
  var shelf_entry=prop.tools.filter(function(e){return e.name=='shelf'})
  var fn_shelf = 	'./tools/'+shelf_entry[0].filename
  if(!exists(fn_shelf)){
      console.log('Downloading shelf gateway ...')
      promises.push(downloadurl(shelf_entry[0].download_url+shelf_entry[0].filename,'tools'))
  }
  adapters.forEach(function(e){
    var link = prop.tools.filter(function(el){
      return el.name==e
    })
    if(link.length==0){

    }else{
      link.forEach(function(e){
        if(e.name!=''){
          var bl = './tools/adapters/'+e.filename
          if(!exists(bl)){
            console.log('Downloading '+e.filename+'...')
            promises.push(downloadurl(e.download_url+e.filename,'tools/adapters'))
          }
        }
      })
    }
  })
  if(promises.length>0){
    Promise.all(promises).then(()=>{
      if(promises.length ==1){
        console.log(promises.length+' file downloaded.')
      }else {
        console.log(promises.length+' files downloaded.')
      }
      fs.remove(tmp,err=>{ if(err) console.log(err)})
    },err=>{
      console.log(err)
    })
  }else {
    if(exists(tmp)){fs.remove(tmp,err=>{ if(err) console.log(err)})}
    console.log('All needed files are already installed.')
  }
}

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
var activator = {"name":"", "version":"","filename":"","download_url":""}
var shelf = {"name":"", "version":"","filename":"","download_url":""}
program
  .name('kgrid install')
  .parse(process.argv)

var prop= {}
var paths =[]
var kopath = ''
if(exists('project.json')){
  prop=JSON.parse(fs.readFileSync('project.json', 'utf8'))
  adapters=prop.adapters
  kopath=prop.object
  downloadandinstall()
  loadkotoshelf()
} else {
  console.log('project.json not found. Checking all knowledge objects in the working directory...')
  var srcpath = process.cwd()
  rawpaths=klawSync(srcpath)
  rawpaths.forEach(function(e){
    if((e.path.toLowerCase().includes('metadata'))){
      paths.push(e)
    }
  })
  var adapterentrylist = []
  paths.forEach(function(e){
    var content = JSON.parse(fs.readFileSync(e.path, 'utf8'))
    var adapterlist = jsonpath.query(content, '$..adapters');
    // console.log('QUERY REsult:'+JSON.stringify(adapterlist))
    adapterlist.forEach(function(e){
      e.forEach(function(el){
        var entry = el.name+'-'+el.version
        adapterentrylist = adapters.map(function(e){ return e.name+'-'+e.version})
        if(adapterentrylist.indexOf(entry)==-1){
          adapters.push(el)
        }
      })
    })
    var activatorlist = jsonpath.query(content, '$..activator');
    if(activatorlist.length>0){
      activator = activatorlist[0]
    }
    var shelflist = jsonpath.query(content, '$..shelf');
    if(shelflist.length>0){
      shelf = shelflist[0]
    }
  })
  adapters.forEach(function(e){
    console.log('Found adapter type: '+ e.name+'-'+e.version)
  })
  download(gittemplate, tmp, err => {
      if(err!=null){
        console.log(err)
      }else {
        prop=JSON.parse(fs.readFileSync('tmp/kotemplate/project.json', 'utf8'))
        prop.project="shelf"
        prop.object='99999-shelf'
        prop.adapters = adapters
        prop.activator=activator
        prop.shelf=shelf
        console.log('Generating project.json ...')
        fs.writeFileSync('project.json',JSON.stringify(prop))
        kopath=process.cwd()
        downloadandinstall()
        loadkotoshelf()
      }
  })
}

function loadkotoshelf() {
  var shelfdir='runtime/shelf/'+kopath
  fs.ensureDir(shelfdir, err=>{
    if(err!=null) {
      console.log(err)
    } else {
      ncp(kopath, shelfdir, function(err){
        if(err!=null){
          console.log(err)
        }else {
          console.log('Successfully loaded the knowledge object to runtime shelf.')
        }
      })
    }
  })
}

function downloadandinstall() {
  fs.ensureDir('runtime', err => {
					if(err!=null){
					   console.log(err)
					} else{
					   fs.ensureDir('runtime/adapters', err => {
								if(err!=null){console.log(err) }
              })
					   }
					})
  var promises = []
  var act_entry=prop.activator
  var fn = 	'./runtime/'+act_entry.filename
  if(!exists(fn)){
    console.log('Downloading activator ...')
    promises.push(downloadurl(act_entry.download_url+act_entry.filename,'runtime'))
  }
  var shelf_entry=prop.shelf
  var fn_shelf = 	'./runtime/'+shelf_entry.filename
  if(!exists(fn_shelf)){
      console.log('Downloading shelf gateway ...')
      promises.push(downloadurl(shelf_entry.download_url+shelf_entry.filename,'runtime'))
  }
  adapters.forEach(function(e){
    if(e.name!=''){
          var bl = './runtime/adapters/'+e.filename
          if(!exists(bl)){
            console.log('Downloading '+e.filename+'...')
            promises.push(downloadurl(e.download_url+e.filename,'runtime/adapters'))
          }
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

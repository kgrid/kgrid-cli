#!/usr/bin/env node

// var download = require('download-git-repo')
const downloadurl = require('download');
const program = require('commander')
const path=require('path')
const fs=require('fs-extra')
const ncp=require('ncp').ncp
const exists = require('fs').existsSync
// const jsonpath = require('jsonpath')
const klawSync = require('klaw-sync')
var template = 'kotemplate'
var gittemplate='kgrid/ko-templates'
var adapters = []
var activator = {"name":"", "version":"","filename":"","download_url":""}
var shelf = {"name":"", "version":"","filename":"","download_url":""}
program
  .name('kgrid install')
  .option('--dev','Run in development mode')
  .option('--prod','Run in production mode')
  .parse(process.argv)

var prop= {}
var paths =[]
var srcpath = process.cwd()
var kopath = ''
var kopaths=[]
var runtime=''
if(!program.prod) {
  runtime='activator/'
}else{
  runtime='./'
}
if(exists(runtime+'manifest.json')){
  prop=JSON.parse(fs.readFileSync(runtime+'manifest.json', 'utf8'))
  adapters=prop.adapters
  kopaths=prop.objects
  if(!program.prod){
    kopaths.forEach(function(e){
      loadkotoshelf(e.id)
    })
  }else {
    // console.log('The function to load remote knowledge objects will be implemented in the future release.')
  }
  downloadandinstall()
} else {
    if(!program.prod){
      console.log('manifest.json not found. Please run `kgrid setup` and then try again.')
    }else {
      console.log('manifest.json not found. Please run `kgrid setup --prod` and then try again.')
    }
}


function loadkotoshelf(kopath) {
  var shelfdir=runtime+'/shelf/'+kopath
  fs.ensureDir(shelfdir, err=>{
    if(err!=null) {
      console.log(err)
    } else {
      if(exists(kopath)){
      ncp(kopath, shelfdir, function(err){
        if(err!=null){
          console.log(err)
        }else {
          console.log('Successfully loaded Knowledge Object '+kopath+' to activator shelf.')
        }
      })
    }else {
      console.log('Knowledge Object '+kopath+' not found.')
    }
    }
  })
}

function downloadandinstall() {
  fs.ensureDir(runtime, err => {
					if(err!=null){
					   console.log(err)
					} else{
					   fs.ensureDir(runtime+'/adapters', err => {
								if(err!=null){console.log(err) }
              })
					   }
					})
  var promises = []
  var act_entry=prop.activator
  var fn = 	runtime+'/'+act_entry.filename
  if(!exists(fn)){
    console.log('Downloading '+act_entry.filename+ '...')
    promises.push(downloadurl(act_entry.download_url+act_entry.filename,runtime))
  }
  var shelf_entry=prop.shelf
  var fn_shelf = 	runtime+'/'+shelf_entry.filename
  if(!exists(fn_shelf)){
      console.log('Downloading '+shelf_entry.filename+'...')
      promises.push(downloadurl(shelf_entry.download_url+shelf_entry.filename,runtime))
  }
  adapters.forEach(function(e){
    if(e.name!=''){
          var bl = runtime+'/adapters/'+e.filename
          if(!exists(bl)){
            console.log('Downloading '+e.filename+'...')
            promises.push(downloadurl(e.download_url+e.filename,runtime+'/adapters'))
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
    },err=>{
      console.log(err)
    })
  }else {
    console.log('All needed files are already installed.')
  }
}

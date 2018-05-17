#!/usr/bin/env node

const download = require('download');
const program = require('commander')
const path=require('path')
const fs=require('fs-extra')
const ora = require('ora')
const ncp=require('ncp').ncp
const exists = require('fs').existsSync
const klawSync = require('klaw-sync')
const figures = require('figures');
var Multispinner = require('multispinner')

var template = 'kotemplate'
var gittemplate='kgrid/ko-templates'
var files = []
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
  files=prop.files
  kopaths=prop.objects
  // if(!program.prod){
  //   kopaths.forEach(function(e){
  //     loadkotoshelf(e.id)
  //   })
  // }else {
  //   // console.log('The function to load remote knowledge objects will be implemented in the future release.')
  // }
  downloadandinstall(function(){
    if(!program.prod){
      kopaths.forEach(function(e){
        loadkotoshelf(e.id)
      })
    }else {
      // console.log('The function to load remote knowledge objects will be implemented in the future release.')
    }
  })
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

function downloadandinstall(cb) {
  fs.ensureDir(runtime, err => {
					if(err!=null){
					   console.log(err)
					} else{
					   fs.ensureDir(runtime+'adapters', err => {
								if(err!=null){console.log(err) }
              })
					   }
					})
  var promises = []
  var spinnerarray = []
  var urlarray=[]
  files.forEach(function(e){
    if(e.name!=''){
          var bl = runtime+e.target+e.filename
          if(!exists(bl)){
            spinnerarray.push(e.filename)
            urlarray.push(e.download_url+e.filename)
          }
        }
      })

  var multispinner = null
  if(spinnerarray.length>0){
    multispinner = new Multispinner(spinnerarray, {
      preText: 'Downloading',
      color: {
        incomplete: 'yellow'
      },
      symbol: {
        success: figures.tick,
        error: figures.cross
      }
    })
  }
  files.forEach(function(e){
    if(e.name!=''){
          var bl = runtime+e.target+e.filename
          if(!exists(bl)){
            promises.push(downloadkgridcomponent(e.download_url+e.filename,runtime+e.target, e.filename, multispinner))
          }
        }
      })

  if(promises.length>0){
    Promise.all(promises).then(()=>{
      multispinner.on('done', function(){
        if(promises.length ==1){
          console.log(promises.length+' file downloaded.')
        }else {
          console.log(promises.length+' files downloaded.')
        }
        cb()
      })

    },err=>{
      console.log(err)
    })
  }else {
    console.log('All needed files are already installed.')
  }
}

function downloadkgridcomponent(url, tgt, spinnerID, spinners) {
  download(url, tgt).then(success=>{
    spinners.success(spinnerID)
    return [spinnerID, success]
  })
  .catch(err=>{
    spinners.error(spinnerID)
     return [spinnerID, err]
  })
}

#!/usr/bin/env node

const download = require('download');
const program = require('commander')
const path=require('path')
const fs=require('fs-extra')
const ora = require('ora')
const ncp=require('ncp').ncp
const exists = require('fs').existsSync
const klawSync = require('klaw-sync')
var execsync = require('child_process').execSync
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
var runtime=''
if(!program.prod) {
  runtime='activator/'
}else{
  runtime='./'
}
console.log('Installing Dev dependencies...')
execsync('npm install')
console.log('Installing KGrid Runtime dependencies ...')
if(exists('package.json')){
  prop=JSON.parse(fs.readFileSync('package.json', 'utf8'))
  files=prop.runtimedependencies
  downloadandinstall(function(){
    if(!program.prod){
      console.log("To start the activator, type in command `npm run dev`.")
    }else {
      // console.log('The function to load remote knowledge objects will be implemented in the future release.')
    }
  })
} else {
      console.log('package.json not found. ')
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
    console.log('All needed Knowledge Grid components are already installed.')
    cb()
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

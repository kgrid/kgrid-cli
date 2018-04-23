#!/usr/bin/env node

var download = require('download-git-repo')
const downloadurl = require('download');
var program = require('commander')
var path=require('path')
const fs=require('fs-extra')
const ncp=require('ncp').ncp
const exists = require('fs').existsSync
const BASE_URL = 'http://localhost';
const KGRID_ACTIVATOR_PORT = '3080';
const ADAPTERGATEWAY_PORT_START = '3081';
var template = 'kotemplate'
var tmp = 'tmp'
var gittemplate='kgrid/ko-templates'
var adapters = ['JS','PYTHON']
program
  .name('kgrid install')
  .parse(process.argv)

var prop= {}
if(exists('project.json')){
  prop=JSON.parse(fs.readFileSync('project.json', 'utf8'))
  adapters=prop.adapters
} else {
    console.log('project.json not found. Default setting will be used for installing K-Grid components.')
    download(gittemplate, tmp, err => {
      if(err!=null){
        console.log(err)
      }else {
        prop=JSON.parse(fs.readFileSync('tmp/kotemplate/project.json', 'utf8'))
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
            console.log('Downloading '+e.filename)
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
  console.log('All needed files are already installed.')
}
}

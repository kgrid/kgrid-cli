#!/usr/bin/env node

var download = require('download-git-repo')
const downloadurl = require('download');
var program = require('commander')
var path=require('path')
const fs=require('fs-extra')
const ncp=require('ncp').ncp
const exists = require('fs').existsSync
const BASE_URL = 'http://localhost';
const ACTIVATOR_PORT = '3080';
const ADAPTERGATEWAY_PORT_START = '3081';
const ACTIVATOR_DOWNLOAD = {'filename':'activator-0.5.8-SNAPSHOT.war','url':'https://github.com/kgrid/kgrid-starter/releases/download/0.6/activator-0.5.8-SNAPSHOT.war'};
const ADAPTERGATEWAY_DOWNLOAD_URLs = [
   {'adapter':'PYTHON','filename':'','url':''}
  ,{'adapter':'JS','filename':'','url':''}
]
const ADAPTER_DOWNLOAD_URLs = [
    {'adapter':'PYTHON','filename':'python-adapter-0.5.8-SNAPSHOT-jar-with-dependencies.jar','url':'https://github.com/kgrid/python-adapter/releases/download/0.5.8-SNAPSHOT/python-adapter-0.5.8-SNAPSHOT-jar-with-dependencies.jar'}
   ,{'adapter':'JS','filename':'','url':''}
 ]

program
  .name('kgrid install')
  .parse(process.argv)

var prop= {}
if(exists('project.json')){
  prop=JSON.parse(fs.readFileSync('project.json', 'utf8'))
  const adapters=prop.adapters
  fs.ensureDir('tools', err => {
					if(err!=null){
					   console.log(err)
					} else{
					   fs.ensureDir('tools/adapters', err => {
								if(err!=null){console.log(err) }
              })
					   // fs.ensureDir('activator/shelf', err => {
					   //   if(err!=null){console.log(err) }
             // })
					   }
					})
var promises = []
const b = 	'./tools/'+ACTIVATOR_DOWNLOAD.filename
if(!exists(b)){
    console.log('Downloading activator ...')
    promises.push(downloadurl(ACTIVATOR_DOWNLOAD.url,'tools'))
  }
adapters.forEach(function(e){
    var link = ADAPTER_DOWNLOAD_URLs.filter(function(el){
      return el.adapter==e
    })
    if(link[0].filename!=''){
      var bl = './tools/adapters/'+link[0].filename
      if(!exists(bl)){
        console.log('Downloading '+e+' adapter ...')
        promises.push(downloadurl(link[0].url,'tools/adapters'))
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
}else {
    console.log('project.json not found.')
}

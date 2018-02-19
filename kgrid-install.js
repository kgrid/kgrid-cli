#!/usr/bin/env node
var download = require('download-git-repo')
const downloadurl = require('download');
var program = require('commander')
var path=require('path')
const fs=require('fs-extra')
const ncp=require('ncp').ncp
const exists = require('fs').existsSync

program
  .name('kgrid install')
  .parse(process.argv)

const prop= JSON.parse(fs.readFileSync('project.json', 'utf8'))
const adapters=prop.adapters

const activatorfile='activator-0.5.8-SNAPSHOT.war'
var adapterfiles =[{'adapter':'PYTHON','filename':'python-adapter-0.5.8-SNAPSHOT-jar-with-dependencies.jar','url':'https://github.com/kgrid/python-adapter/releases/download/0.5.8-SNAPSHOT/python-adapter-0.5.8-SNAPSHOT-jar-with-dependencies.jar'}
    ,{'adapter':'JS','filename':'','url':''}]
fs.ensureDir('activator', err => {
					if(err!=null){
					   console.log(err)
					} else{
					   fs.ensureDir('activator/adapters', err => {
								if(err!=null){console.log(err) }
              })
					   fs.ensureDir('activator/shelf', err => {
					     if(err!=null){console.log(err) }
             })
					   }
					})
var promises = []
const b = 	'./activator/'+activatorfile
if(!exists(b)){
    console.log('Downloading activator ...')
    promises.push(downloadurl('https://github.com/kgrid/kgrid-starter/releases/download/0.6/activator-0.5.8-SNAPSHOT.war','activator'))
  }
adapters.forEach(function(e){
    var link = adapterfiles.filter(function(el){
      return el.adapter==e
    })
    if(link[0].filename!=''){
      var bl = './activator/adapters/'+link[0].filename
      if(!exists(bl)){
        console.log('Downloading '+e+' adapter ...')
        promises.push(downloadurl(link[0].url,'activator/adapters'))
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

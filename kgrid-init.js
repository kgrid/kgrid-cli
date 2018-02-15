#!/usr/bin/env node
var download = require('download-git-repo')
const downloadurl = require('download');
var program = require('commander')
var path=require('path')
const fs=require('fs-extra')
const ncp=require('ncp').ncp
const exists = require('fs').existsSync

program
  .usage('<template-name> [project-name]')
  .option('-c, --clone', 'use git clone')
  .option('--offline', 'use cached template')
 	.parse(process.argv)

var template=program.args[0]
var project = program.args[1]
var tmp = 'tmp'
var dest = template.replace(/[\/:]/g, '-')
var gittemplate='kgrid/ko-templates'
var src=path.join(tmp,template)
const activatorfile='activator-0.5.8-SNAPSHOT.war'


if(project!=null){
		console.log('Your Object Name:'+project)
		dest = project.replace(/[\/:]/g, '-')
}

download(gittemplate, tmp, err => {
		if(err){
		    console.log(err)
		 }else {
				fs.ensureDir(dest, err => {  console.log(err) })
				fs.ensureDir('activator', err => {  
					if(err){
					   console.log(err) 
					} else{
					   fs.ensureDir('activator/adapters', err => {  
								console.log(err) })
					   fs.ensureDir('activator/shelf', err => {  
					   console.log(err) })
					   }
					})
				var b = 	'./activator/'+activatorfile
				console.log(b)
				if(!exists(b)){
					console.log('Downloading activator...')
					downloadurl('https://github.com/kgrid/kgrid-starter/releases/download/0.6/activator-0.5.8-SNAPSHOT.war','activator').then(() => { console.log('done!')
}, err=>{
console.log(err)})
				}
				ncp(src, dest, function(err) {
					if(err){
						console.error(err)
					}else{
						console.log('Successfully initiated your object!')
						fs.remove(tmp,err=>{ console.log(err)})
					}
				})
		 }   
  })



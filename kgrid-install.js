#!/usr/bin/env node
var download = require('download-git-repo')
const downloadurl = require('download');
var program = require('commander')
var path=require('path')
const fs=require('fs-extra')
const ncp=require('ncp').ncp
const exists = require('fs').existsSync

program
  .usage('')
 	.parse(process.argv)

const activatorfile='activator-0.5.8-SNAPSHOT.war'

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
var b = 	'./activator/'+activatorfile
console.log(b)
if(!exists(b)){
		console.log('Downloading activator...')
		downloadurl('https://github.com/kgrid/kgrid-starter/releases/download/0.6/activator-0.5.8-SNAPSHOT.war','activator').then(() => { console.log('done!')
        }, err=>{
          if(err!=null){
          console.log(err)}})
        }

//Will download adapters based on the payload engine type

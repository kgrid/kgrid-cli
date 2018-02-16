#!/usr/bin/env node
var download = require('download-git-repo')
const downloadurl = require('download');
var program = require('commander')
var path=require('path')
const fs=require('fs-extra')
const ncp=require('ncp').ncp
const exists = require('fs').existsSync
const zipFolder = require('zip-folder');

program
  .name('kgrid packge')
  .usage('[options]')
  .option('-l, --legacy','An option to package using legacy model')
 	.parse(process.argv)

var ver = program.args[0]
var tmp = 'tmp'
var dest = 'activator/shelf'
const inputfile ='input.xml'
const outputfile='output.xml'
const payloadfile='payload.js'
const metadatafile='metadata.json'
const basefile='base.json'
const project=path.basename(process.cwd())

var prop= JSON.parse(fs.readFileSync('project.json', 'utf8'))
var packfile=prop.object
var srcpath = 'src/'+prop.object+'/'

if(program.legacy){
    packaginglegacy()
}else{
    packagingzip()
}

function packagingzip(){

  zipFolder('src/'+prop.object, 'src/'+prop.object+'.zip', function(err) {
  	if(err) {
  		console.log('oh no!', err);
  	} else {
  		console.log('EXCELLENT');
      fs.ensureDir('target', err => {
         if(err!=null){console.log(err) }
         fs.copySync('src/'+prop.object+'.zip','target/'+prop.object+'.zip')
         fs.moveSync('src/'+prop.object+'.zip','activator/shelf/'+prop.object+'.zip',{overwrite:true})
       })
  	}
  });
}

function packaginglegacy(){
var data = fs.readFileSync(srcpath+basefile, 'utf8')
var myobject = JSON.parse(data)
data = fs.readFileSync(srcpath+inputfile, 'utf8')
myobject.inputMessage=data
data = fs.readFileSync(srcpath+outputfile, 'utf8')
myobject.outputMessage=data
data = fs.readFileSync(srcpath+payloadfile, 'utf8')
myobject.payload.content=data
data = fs.readFileSync(srcpath+metadatafile, 'utf8')
myobject.metadata=JSON.parse(data).metadata
console.log(JSON.stringify(myobject))
fs.ensureDir('target', err => {
   if(err!=null){console.log(err) }
   fs.writeFileSync('target/'+packfile,JSON.stringify(myobject))
   fs.writeFileSync('./activator/shelf/'+packfile,JSON.stringify(myobject))
 })
}

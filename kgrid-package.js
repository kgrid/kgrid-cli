#!/usr/bin/env node
var download = require('download-git-repo')
const downloadurl = require('download');
var program = require('commander')
var path=require('path')
const fs=require('fs-extra')
const ncp=require('ncp').ncp
const exists = require('fs').existsSync

program
 	.parse(process.argv)

var object = program.args[0]
var tmp = 'tmp'
var dest = 'activator/shelf'
const inputfile ='input.xml'
const outputfile='output.xml'
const payloadfile='payload.js'
const metadatafile='metadata.json'
const basefile='base.json'
const packfile=path.basename(process.cwd())

console.log(packfile)

var data = fs.readFileSync(basefile, 'utf8')
var myobject = JSON.parse(data)

data = fs.readFileSync(inputfile, 'utf8')
myobject.inputMessage=data
data = fs.readFileSync(outputfile, 'utf8')
myobject.outputMessage=data
data = fs.readFileSync(payloadfile, 'utf8')
myobject.payload.content=data
data = fs.readFileSync(metadatafile, 'utf8')
myobject.metadata=JSON.parse(data).metadata
console.log(JSON.stringify(myobject))

fs.writeFileSync(packfile,JSON.stringify(myobject))
fs.writeFileSync('../activator/shelf/'+packfile,JSON.stringify(myobject))

/*
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

*/

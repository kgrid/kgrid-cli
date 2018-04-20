#!/usr/bin/env node
const request = require('superagent')
const program = require('commander')
const path=require('path')
const exists = require('fs').existsSync

const PORT = process.env.KGRID_SHELF_PORT || 8083;
program
  .name('kgrid putko')
  .description('This will upload the specified knowledge object to the shelf.\n\n    Example: \n\n      kgrid putko target/hello-world.zip')
  .usage('<filename>')
	.parse(process.argv)

var filename = ''
var arkid =''
var options = {
  noColor: false
}

if(program.args.length==0){
  console.log('Please specify the knowledge object zip file and try again. \n\n   Format for the knowledge object id: {naan}-{name}.zip \n\n   Example:  kgrid putko hello-world.zip')
}else {
  filename=program.args[0]
  var index = filename.lastIndexOf('/')
  var l = filename.length
  var s = filename.slice(index+1,l)
  arkid='ark:/'+s.replace('.zip','').replace('-','/')
  if(!exists(filename)){
    console.log('File not found.')
  }else {
    request.put('http://localhost:'+PORT+'/'+arkid)
      .attach('ko',filename)
      .end(function(err,res){
        if(err!=null){
          console.log('Cannot connect to the shelf. Please check if the shelf is running properly.')
        }else {
          if(res!=null){
            console.log(res.text)
          }
        }
  })
}
}

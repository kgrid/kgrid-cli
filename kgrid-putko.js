#!/usr/bin/env node
const request = require('superagent')
const program = require('commander')
const path=require('path')
const PORT = process.env.SHELF_PORT || 8083;
program
  .name('kgrid getko')
  .description('This will retrieve the specified knowledge object from the shelf.\n\n    Example: \n\n      kgrid getko ark:/hello/world/v-0-0-1')
  .usage('<ko>')
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
  var substring=filename.match(/\/(.*?).zip/)
  arkid='ark:/'+substring[1].replace('-','/')
  request.put('http://localhost:'+PORT+'/'+arkid)
      .attach('ko',filename)
      .end(function(err,res){
        if(err!=null){
          console.error(err)
        }else {
          if(res!=null){
            console.log(res.text)
          }
        }
  })
}

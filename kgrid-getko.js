#!/usr/bin/env node
const request = require('superagent')
const program = require('commander')
const path=require('path')
const prettyjson = require('prettyjson');
const PORT = process.env.SHELF_PORT || 8083;
program
  .name('kgrid getko')
  .description('This will retrieve the specified knowledge object from the shelf.\n\n    Example: \n\n      kgrid getko ark:/hello/world/v-0-0-1')
  .usage('<ko>')
	.parse(process.argv)

var arkid = ''
var options = {
  noColor: false
}

if(program.args.length==0){
  console.log('Please specify the knowledge object and try again. \n\n   Format for the knowledge object id: ark:/{naan}/{name}/version \n\n   Example:  kgrid getko ark:/hello/world/v-0-0-1')
}else {
  arkid=program.args[0]
  request.get('http://localhost:'+PORT+'/'+arkid)
     .end(function(err,res){
        if(err!=null){
          console.error(err)
        }else {
          if(res!=null){
            console.log(prettyjson.render(res.body, options))
          }
        }
  })
}

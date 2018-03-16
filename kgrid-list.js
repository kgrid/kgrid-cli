#!/usr/bin/env node
var program = require('commander')

program
  .name('kgrid list')
  .description('List components')
  .option('-t, --template','template list')
 	.parse(process.argv)

var l = ['jslegacy','pythonlegacy','kotemplate']

l.forEach(function(e){
  console.log(e)
})

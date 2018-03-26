#!/usr/bin/env node
const program = require('commander')
const fs=require('fs-extra');
const path=require('path')
const klawSync = require('klaw-sync')

program
  .name('kgrid list')
  .description('List components')
  .option('-t, --template','template list')
  .option('-f, --filetree','template list')
 	.parse(process.argv)

  var prop= JSON.parse(fs.readFileSync('project.json', 'utf8'))
  // var packfile=prop.object
  var srcpath = prop.object+'/'
  var curpath = process.cwd()
  // console.log(srcpath)
if(program.template){
  var l = ['jslegacy','pythonlegacy','kotemplate']
  l.forEach(function(e){
    console.log(e)
  })
}
if(program.filetree){
  var paths=klawSync(srcpath)
  paths.forEach(function(e){
    console.log(e.path.replace(curpath,''))
  })
}

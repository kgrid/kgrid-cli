#!/usr/bin/env node
const program = require('commander')
const fs=require('fs-extra');
const path=require('path')
const klawSync = require('klaw-sync')
const exists = require('fs').existsSync

program
  .name('kgrid list')
  .description('List components. \n\n  A file name can be used to filter the result when listing files.\n\n  Example:\n\n        kgrid list -s metadata ')
  .option('-t, --template','template list')
  .option('-f, --filetree','project file list')
  .option('-s, --shelf','shelf list')
 	.parse(process.argv)

var curpath = process.cwd()
var paths =[]
var rawpaths =[]
var filefilter=''
if(program.args.length>0){
  filefilter=program.args[0].toLowerCase()
}
if(program.template){
  var l = ['jslegacy','pythonlegacy','kotemplate']
  l.forEach(function(e){
    console.log(e)
  })
} else
if(program.filetree){
  if(!exists('project.json')){
    console.log('Project file not found. Navigate to a valid KGrid project folder and try again.')
  }else {
    var prop= JSON.parse(fs.readFileSync('project.json', 'utf8'))
    var srcpath = prop.object+'/'
    rawpaths=klawSync(srcpath)
    rawpaths.forEach(function(e){
      if((e.path.toLowerCase().includes(filefilter))|filefilter==''){
        paths.push(e)
      }
    })
    paths.forEach(function(e){
      console.log(e.path.replace(curpath,''))
    })
  }
} else
if(program.shelf){
  rawpaths=klawSync(curpath)
  rawpaths.forEach(function(e){
    if((e.path.toLowerCase().includes(filefilter))|filefilter==''){
      paths.push(e)
    }
  })
  paths.forEach(function(e){
    console.log(e.path.replace(curpath,''))
  })
} else {
  program.help()
}

#!/usr/bin/env node
const program = require('commander')
const request = require('superagent')
const fs=require('fs-extra');
const path=require('path')
const klawSync = require('klaw-sync')
const exists = require('fs').existsSync
const PORT = process.env.KGRID_ACTIVATOR_PORT || 8083;
const prettyjson = require('prettyjson');
const minimist = require('minimist')

var options = {  noColor: false }
program
  .name('kgrid list')
  .description('List components. \n\n  Example:\n\n      kgrid list -s  \n\n      kgrid list --ko=ark:/hello/world')
  .usage('[options]')
  .option('-t, --template','template list')
  .option('-s, --shelf','shelf ko list')
  .option('-e, --env','env')
  .option('--ko','knowledge object')
 	.parse(process.argv)

// console.log(process.argv)
var argv=minimist(process.argv.slice(2))

var curpath = process.cwd()
var paths =[]
var rawpaths =[]
var filefilter=''

if(program.args.length>0){
  filefilter=program.args[0].toLowerCase()
}

if(program.env){
    console.log(process.env)
} else
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
    request.get('http://localhost:'+PORT+'/')
      .end(function(err,res){
        if(err!=null){
          console.log('Cannot connect to the shelf. Please check if the shelf is running properly.')
        }else {
          if(res!=null){
            var rawlist={}
            for(var key in res.body){
              var obj = res.body[key]
              var subobj ={}
              for(var subkey in obj){
                subobj[subkey] = {}
              }
              rawlist[key]=subobj
            }
            // console.log(rawlist)
            console.log(prettyjson.render(rawlist, options))
          }
        }
  })
} else
  if(program.ko){
    if(argv.ko){
      request.get('http://localhost:'+PORT+'/'+argv.ko)
         .end(function(err,res){
            if(err!=null){
              console.error("Not Found.")
            }else {
              if(res!=null){
                console.log(prettyjson.render(res.body, options))
              }
            }
      })
    } else {
      console.log('Please specify the knowledge object with the arkid.')
    }
  }
  else {
    program.help()
  }

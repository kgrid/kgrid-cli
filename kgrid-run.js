#!/usr/bin/env node
var request = require('superagent')
var program = require('commander')
var path=require('path')
var exec = require('child_process').exec
var execsync = require('child_process').execSync
const exists = require('fs').existsSync
const fs=require('fs-extra')
const minimist = require('minimist')
var child=null

program
  .name('kgrid run')
  .description('This will start the K-Grid activator.\n\n  Use the option -p to specify a port.\n\n  Example: \n\n      kgrid run --shelfonly --dev -p 8083')
  .usage('[options]')
  .option('--port','Specify a different port')
  .option('--shelfonly','Start shelf gateway only')
  .option('--adapteronly','Start adapter gateway only')
  .option('--dev','Run in development mode')
	.parse(process.argv)

var port = process.env.KGRID_ACTIVATOR_PORT || 8083
var activator_options=' --activator.home=runtime --activator.shelf.path=./'
var adapter_options=' --activator.home=runtime --activator.shelf.path=./'
var shelf_options=' --shelf.location=./shelf/'
var options=''
if(program.dev) {
  if(program.shelfonly){
    options=shelf_options
  }else if(program.adapteronly){
    options=adapter_options
  } else {
    options=activator_options
  }
}
var argv=minimist(process.argv.slice(2))
if(program.port){
  port=argv.port
}
if(process.platform === "win32") {
  execsync('setx KGRID_ACTIVATOR_PORT '+port)
} else {

}
//To run at project folder
// const toolpath='./runtime/'
// const upper=''
//To run in runtime folder
const toolpath='./'
const upper ='../'
if(!exists(upper+'project.json')){
  console.log('Please run kgrid install and then try again.')
} else {

  var prop=JSON.parse(fs.readFileSync(upper+'project.json', 'utf8'))
  adapters=prop.adapters
  var activatorfile = toolpath + prop.activator.filename
  var shelfgatewayfile = toolpath + prop.shelf.filename
  var adapters = prop.adapters.map(function(e){
    return e.filename}).filter(function(e){return e.includes('gateway')})
  // console.log(adapters)
  var adapterfile = toolpath + 'adapters/'+ adapters[0]
  if(program.shelfonly){
    if(!exists(shelfgatewayfile)){
      console.log('Cannot find the shelf gateway file. Please run kgrid install and then try again.')
    } else {
      request.get('http://localhost:'+port+'/health')
         .end(function(err,res){
              if(res==null){
                console.log('Starting up the shelf...')
                child=exec('java -jar '+shelfgatewayfile+' --server.port='+port+options,
                      function (error, stdout, stderr){
                          console.log('Output -> ' + stdout);
                          if(error !== null){
                            console.log("Error -> "+error);
                          }
                        })
                child.stdout.on('data', (data) => {
                          console.log(`${data}`)
                          })
              }else {
  							console.log('There is one activator running on Port '+port+'.')
  							console.log('Your knowledge object operation will be directed to this instance.')
              }
      })
    }
} else if(program.adapteronly) {
  if(!exists(adapterfile)){

    console.log('Cannot find the adapter gateway file: '+adapterfile+'. Please run kgrid install and then try again.')
  } else {
    request.get('http://localhost:'+port+'/health')
       .end(function(err,res){
            if(res==null){
              console.log('Starting Adapter Gateway...'+options)
              child=exec('java -jar '+adapterfile+' --server.port='+port+options,
                    function (error, stdout, stderr){
                        console.log('Output -> ' + stdout);
                        if(error !== null){
                          console.log("Error -> "+error);
                        }
                      })
                      child.stdout.on('data', (data) => {
                        console.log(`${data}`)
                        })

            } else {
							console.log('There is one activator running on Port '+port+'.')
							console.log('Your knowledge object operation will be directed to this instance.')
            }
    })


  }
} else {
  if(!exists(activatorfile)){
    console.log('Cannot find the activator file. Please run kgrid install and then try again.')
  } else {
    request.get('http://localhost:'+port+'/health')
       .end(function(err,res){
            if(res==null){
              console.log('Starting Activator...')
              child=exec('java -jar '+activatorfile+' --server.port='+port+options,
                    function (error, stdout, stderr){
                        console.log('Output -> ' + stdout);
                        if(error !== null){
                          console.log("Error -> "+error);
                        }
                      })
                      child.stdout.on('data', (data) => {
                        console.log(`${data}`)
                        })

            }else {
							console.log('There is one activator running on Port '+port+'.')
							console.log('Your knowledge object operation will be directed to this instance.')
            }
    })
  }
}
}

#!/usr/bin/env node
var request = require('superagent')
var program = require('commander')
var path=require('path')
var exec = require('child_process').exec
var execsync = require('child_process').execSync
const exists = require('fs').existsSync
const minimist = require('minimist')
var child=null

program
  .name('kgrid run')
  .description('This will start the K-Grid activator.\n\n  Use the option -p to specify a port.\n\n  Example: \n\n      kgrid run --shelfonly --dev -p 8083')
  .usage('[options]')
  .option('-p, --port','Specify a different port')
  .option('--shelfonly','Start shelf gateway only')
  .option('--dev','Run in development mode')
	.parse(process.argv)

var port = process.env.KGRID_ACTIVATOR_PORT || 8083
var activator_options=' --activator.home=tools --activator.shelf.path=./'
var shelf_options=' --shelf.path=./'
var options=''
if(program.dev) {
  if(program.shelfonly){
    options=shelf_options
  }else {
    options=activator_options
  }
}
var argv=minimist(process.argv.slice(2))
if(program.port){
  port=argv.port
}
port='8083'
execsync('setx KGRID_ACTIVATOR_PORT '+port)
const activatorfile='./tools/activator-0.5.8-SNAPSHOT.war'
const shelfgatewayfile='./tools/shelf-gateway-0.5.8-SNAPSHOT.jar'

if(program.shelfonly){
  if(!exists(shelfgatewayfile)){
      console.log('Cannot find the shelf gateway file. Please run kgrid install and then try again.')
    }else {
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
} else {
  if(!exists(activatorfile)){
    console.log('Cannot find the activator file. Please run kgrid install and then try again.')
  } else {
    request.get('http://localhost:'+port+'/health')
       .end(function(err,res){
            if(res==null){
              console.log('Starting Activator...')
              child=exec('java -jar tools/activator-0.5.8-SNAPSHOT.war --server.port='+port+options,
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

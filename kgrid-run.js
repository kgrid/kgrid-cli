#!/usr/bin/env node
var request = require('superagent')
var program = require('commander')
var path=require('path')
var exec = require('child_process').exec
// var spawn = require('child_process').spawn
const exists = require('fs').existsSync
var child=null

program
  .name('kgrid run')
  .description('This will start the K-Grid activator with default port of 8082.\n\n  Use the option -p to specify a port.\n\n  Example: \n\n      kgrid run -p 8083')
  .usage('[options]')
  .option('-p, --port','Specify a different port')
  .option('--dev','Run in development mode')
	.parse(process.argv)

var arkid = path.basename(process.cwd()).replace(/[\-:]/g, '/')
var port = '8082'
var options=' --activator.home=tools --activator.shelf.path=target'
if(!program.dev){options=""}

if(program.port){
  port=program.args[0]
}
const activatorfile='./tools/activator-0.5.8-SNAPSHOT.war'

if(!exists(activatorfile)){
    console.log('Cannot find the activator file. Please run kgrid install and then try again.')
  }else {
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

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
  .name('kgrid shelfup')
  .description('This will start the K-Grid shelf gateway with default port of 8083.\n\n  Use the option -p to specify a port.\n\n  Example: \n\n      kgrid shelfup -p 8083')
  .usage('[options]')
  .option('-p, --port','Specify a different port')
  .option('--dev','Run in development mode')
	.parse(process.argv)

var argv=minimist(process.argv.slice(2))

var arkid = path.basename(process.cwd()).replace(/[\-:]/g, '/')
var port = '8083'
var options=' --shelf.path=./'

if(!program.dev){options=""}
if(program.port){
  port=argv.port
}
execsync('setx KGRID_SHELF_PORT '+port)

const shelfgatewayfile='./shelf-gateway-0.5.8-SNAPSHOT.jar'

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

#!/usr/bin/env node
var request = require('superagent')
var co = require('co')
var prompt = require('co-prompt')
var program = require('commander')
var path=require('path')
var exec = require('child_process').exec
var spawn = require('child_process').spawn
var child=null


program
  .name('kgrid run')
  .description('This will start the K-Grid activator with default port of 8082.\n\n  Use the option -p to specify a port.\n\n  Example: \n\n      kgrid run -p 8083')
  .usage('[options]')
  .option('-p, --port','Specify a different port')
	.parse(process.argv)

var arkid = path.basename(process.cwd()).replace(/[\-:]/g, '/')
var port = '8082'

if(program.port){
  port=program.args[0]
}
request.get('http://localhost:'+port+'/health')
       .end(function(err,res){
            if(res==null){
              console.log('Starting Activator...')
              delay=3000
              child=exec('java -jar activator/activator-0.5.8-SNAPSHOT.war --server.port='+port+' --activator.home=activator',
                    function (error, stdout, stderr){
                        console.log('Output -> ' + stdout);
                        if(error !== null){
                          console.log("Error -> "+error);
                        }
                      })

            }else {
							console.log('There is one activator running on Port '+port+'.')
							console.log('Your knowledge object operation will be directed to this instance.')
            }
            setTimeout(function(){
               console.log('K-Grid Activator is ready and can be accessed at http://localhost:'+port)
               process.kill(process.pid)
             },3000)

    })

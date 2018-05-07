#!/usr/bin/env node
var request = require('superagent')
var program = require('commander')
var path = require('path')
var exec = require('child_process').exec
var execsync = require('child_process').execSync
const exists = require('fs').existsSync
const fs = require('fs-extra')
const minimist = require('minimist')
const BASE_URL = process.env.KGRID_BASE_URL ||'http://localhost'
var child = null

program
  .name('kgrid run')
  .description('This will start the K-Grid activator.\n\n  Use the option -p to specify a port.\n\n  Example: \n\n      kgrid run --shelfonly --dev -p 8083')
  .usage('[options]')
  .option('--port', 'Specify a different port')
  .option('--shelfonly', 'Start shelf gateway only')
  .option('--adapteronly', 'Start adapter gateway only')
  .option('--dev', 'Run in development mode')
  .option('--prod', 'Run in production mode')
	.parse(process.argv)

var port = process.env.KGRID_ACTIVATOR_PORT || 8083
var activator_options = ' --activator.home=activator --activator.shelf.path=./'
var adapter_options = ' --activator.home=activator --activator.shelf.path=./'
var shelf_options = ' --shelf.location=./shelf/'
var options = ''

// To run in activator folder
const runtime = './'

if (!program.prod) {
  if (program.shelfonly) {
    options = shelf_options
  } else if (program.adapteronly) {
    options = adapter_options
  } else {
    options = activator_options
  }
}
var argv = minimist(process.argv.slice(2))
if (program.port) {
  port = argv.port
}
if (process.platform === 'win32') {
  execsync('setx KGRID_ACTIVATOR_PORT ' + port)
} else {

}

if (!exists(runtime + 'manifest.json')) {
  if (!program.prod) {
    console.log('Please navigate to activator folder by `cd activator` and try again.')
  } else {
    console.log('Please run kgrid setup and then try again.')
  }
} else {
  var prop = JSON.parse(fs.readFileSync(runtime + 'manifest.json', 'utf8'))
  adapters = prop.adapters
  var activatorfile = runtime + prop.activator.filename
  var shelfgatewayfile = runtime + prop.shelf.filename
  var adapters = prop.adapters.map(function (e) {
    return e.filename
  }).filter(function (e) { return e.includes('gateway') })
  // console.log(adapters)
  var adapterfile = runtime + 'adapters/' + adapters[0]
  if (program.shelfonly) {
    if (!exists(shelfgatewayfile)) {
      console.log('Cannot find the shelf gateway file. Please run kgrid install and then try again.')
    } else {
      request.get(BASE_URL+':' + port + '/health')
         .end(function (err, res) {
           if (res == null) {
             console.log('Starting up the shelf...')
             child = exec('java -jar ' + shelfgatewayfile + ' --server.port=' + port + options,
                      function (error, stdout, stderr) {
                        console.log('Output -> ' + stdout)
                        if (error !== null) {
                          console.log('Error -> ' + error)
                        }
                      })
             child.stdout.on('data', (data) => {
               console.log(`${data}`)
             })
           } else {
  							console.log('There is one activator running on Port ' + port + '.')
  							console.log('Your knowledge object operation will be directed to this instance.')
           }
         })
    }
  } else if (program.adapteronly) {
    if (!exists(adapterfile)) {
      console.log('Cannot find the adapter gateway file: ' + adapterfile + '. Please run kgrid install and then try again.')
    } else {
      request.get(BASE_URL+':' + port + '/health')
       .end(function (err, res) {
         if (res == null) {
           console.log('Starting Adapter Gateway...' + options)
           child = exec('java -jar ' + adapterfile + ' --server.port=' + port + options,
                    function (error, stdout, stderr) {
                      console.log('Output -> ' + stdout)
                      if (error !== null) {
                        console.log('Error -> ' + error)
                      }
                    })
           child.stdout.on('data', (data) => {
             console.log(`${data}`)
           })
         } else {
           console.log('There is one activator running on Port ' + port + '.')
           console.log('Your knowledge object operation will be directed to this instance.')
         }
       })
    }
  } else {
    if (!exists(activatorfile)) {
      console.log('Cannot find the activator file. Please run kgrid install and then try again.')
    } else {
    // request.get(BASE_URL+':'+port+'/health')
    //    .end(function(err,res){
    //         if(res==null){
    //           console.log('Starting Activator...')
    //           child=exec('java -jar '+activatorfile+' --server.port='+port+options,
    //                 function (error, stdout, stderr){
    //                     console.log('Output -> ' + stdout);
    //                     if(error !== null){
    //                       console.log("Error -> "+error);
    //                     }
    //                   })
    //                   child.stdout.on('data', (data) => {
    //                     console.log(`${data}`)
    //                     })
    //
    //         }else {
		// 					console.log('There is one activator running on Port '+port+'.')
		// 					console.log('Your knowledge object operation will be directed to this instance.')
    //         }
    // })
      console.log('Activator is under development. Please use `--shelfonly` to start shelf or use `--adapteronly` to start adapter gateway.')
    }
  }
}

const {Command, flags} = require('@oclif/command')
// const inquirer = require('inquirer')
const fs = require('fs-extra')
const path = require('path')
const shelljs = require('shelljs')

function runKgrid(cmd) {
    let shelf = cmd.shelf
    let kgridcomponent = cmd.component
    let port = cmd.port
    let cmdstring ='start java -jar '
    let kgridHome = process.env.KGRID_HOME
    if (kgridHome) {
      if(fs.pathExistsSync(kgridHome)){
        console.log('Found KGRID_HOME at: ' + kgridHome)
        if(shelf == ''){
          // Use default shelf
          shelf = kgridHome + path.sep + 'shelf'
        }
        // Check if shelf exists
        if(fs.pathExistsSync(shelf)){
          console.log('Found shelf at: ' + shelf)
          process.chdir(kgridHome)
          if(process.platform == 'win32'){
            cmdstring = cmdstring + kgridcomponent + ' --server.port='+port+' --kgrid.shelf.cdostore.url=filesystem:file:///' + shelf.split(path.sep).join('/')
            console.log(cmdstring)
            shelljs.exec(cmdstring)
          }
        } else {
          console.log('Could not find the directory set as KGRID_HOME. Please run "kgrid setup" again.')
        }
      } else {
        console.log('Could not find the directory for the shelf. Please try again.')
      }
    } else {
      // KGRID_HOME is not set
      console.log('Could not find the home directory for KGrid Components. Please run "kgrid setup".')
    }
}

module.exports = runKgrid

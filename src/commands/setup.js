const {Command, flags} = require('@oclif/command')
// const inquirer = require('inquirer')
const fs = require('fs-extra')
const path = require('path')
const shelljs = require('shelljs')
// const {spawnSync} = require("child_process")

class SetupCommand extends Command {
  async run() {
    // this.log(process.platform)
    const {flags} = this.parse(SetupCommand)
    let userHome = ''
    if (process.platform == 'win32'){
      userHome = process.env.USERPROFILE
    } else {
      userHome = process.env.HOME || process.env.HOMEPATH
    }
    let home = flags.home || userHome
    let kgridHome = home + path.sep + '.kgrid'

    // Set Environment Variable KGRID_HOME if not existing
    let khome = process.env.KGRID_HOME
    if (khome) {
        fs.ensureDirSync(khome)
        process.chdir(khome)
        this.log('Found KGRID_HOME at: ' + process.cwd())
        this.log('Downloading and installing will happen here... To Be implemented.')
    } else {
      fs.ensureDirSync(kgridHome)
      if (process.platform == 'win32'){
        // Win32
        this.log(kgridHome)
        let result = shelljs.exec('setx /m KGRID_HOME ' + kgridHome, {silent:true}).code
        if(result != 0){
          this.log('Error');
        } else {
          this.log('Success: KGRID_HOME has been set at ' + kgridHome);
        }
      } else {
        // OS
        shelljs.exec('export KGRID_HOME=' + kgridHome)
      }
    }
    fs.ensureDirSync(kgridHome + path.sep + 'shelf')

    // Download and Install KGRID Components

    if (process.platform == 'win32'){
      this.log('Please open a new terminal window for your next step to use the setting.')
    }
  }
}

SetupCommand.description = 'Start KGrid Component'

SetupCommand.flags = {
  home: flags.string({}),
}

module.exports = SetupCommand

const colors = require('colors/safe');
const shelljs = require('shelljs');
const fs = require('fs-extra')
const kVersion = require('../../check_kgridversion')

module.exports = async function () {
    let cmd = process.argv[2]
    if(cmd=='version'|cmd=='-v'|cmd=='--version') {
      console.log(colors.green('Checking JAVA Version ...'))
      shelljs.exec('java -version')
      console.log('\n'+colors.green('Checking Node Version ...'))
      shelljs.exec('node --version')
      console.log('')
      let khome = await kVersion('')
      console.log('______________________________________________________________')
    } else {
      console.log(colors.blue('KGrid CLI v'+this.config.version+'\n'))
    }
}

const InitCommand = require('./init')
const {Command, flags} = require('@oclif/command')
const inquirer = require('inquirer')
const fs = require('fs-extra')
const kometaObj = require('../template/kometadata.json')
var topMeta = JSON.parse(JSON.stringify(kometaObj))

class CreateCommand extends Command {
  async run() {
    const {flags} = this.parse(CreateCommand)
    let ko = flags.ko
    let ready = false
    topMeta.hasImplementation = []
    let title = topMeta.title
    if (ko) {
      if (fs.pathExistsSync(ko)) {
        this.log('Path existing. Please start over with a different name for the knowledge object.')
      } else {
        ready = true
      }
    } else {
      let responses = await inquirer.prompt([
        {
          type: 'input',
          name: 'ko',
          message: 'Folder name for your knowledge object: ',
          default: 'newko',
          validate: function (input) {
            var done = this.async()
            setTimeout(function () {
              if (fs.pathExistsSync(input)) {
                done('Path existing. You need to provide a different name for your knowledge object.')
                return
              }
              done(null, true)
            }, 500)
          },
        },
        {
          type: 'input',
          name: 'title',
          message: 'Knowledge Object Title: ',
          default: title,
        },
      ])
      ko = responses.ko
      title = responses.title
      ready = true
    }
    if(ready){
      fs.ensureDirSync(ko)

      // Generate Top Level Metadata
      topMeta.title = title
      fs.writeJsonSync(ko+'/metadata.json', topMeta, {spaces: 4})

      process.chdir(ko)
      this.log('==== Initialize the first implementation ==== ')
      await InitCommand.run()
      this.log('The knowledge object has been created.')
    }
  }
}

CreateCommand.description = 'Create the knowledge object'

CreateCommand.flags = {
  ko: flags.string({char: 'k'}),
}

module.exports = CreateCommand

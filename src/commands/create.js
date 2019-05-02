const InitCommand = require('./init')
const {Command, flags} = require('@oclif/command')
const inquirer = require('inquirer')
const fs = require('fs-extra')

class CreateCommand extends Command {
  async run() {
    const {flags} = this.parse(CreateCommand)
    let ko = flags.ko
    let ready = false
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
      ])
      ko = responses.ko
      ready = true
    }
    if(ready){
      fs.ensureDirSync(ko)
      process.chdir(ko)
      this.log(process.cwd())
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

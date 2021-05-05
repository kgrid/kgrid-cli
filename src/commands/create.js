const {Command, flags} = require('@oclif/command')
const inquirer = require('inquirer')
const path = require('path')
const fs = require('fs-extra')
const metadataTemplate = require('../template/kometadata.json')
let topMeta = JSON.parse(JSON.stringify(metadataTemplate));
const addKOContent = require('../add_kocontent')
const documentations = require('../json/extradoc.json')
const os = require('os')
const userConfig = require('../user_config')
const parseInput = require('../parse_input')
const DEFAULT_VERSION = "v1.0";

class CreateCommand extends Command {
  async run() {
    const {args} = this.parse(CreateCommand)
    let template = 'simplejs'
    let runtime = 'Nashorn'
    let inputPath = {naan: '', name: args.ko || '', version: ''}

    const userConfigJson = userConfig()
    if (userConfigJson) {
      inputPath.naan = userConfigJson.devDefault.naan
    } else {
      inputPath.naan = os.userInfo().username

    }
    if (args.ko) {
      if (args.ko.includes('-') || args.ko.includes('/')) {
        this.error("Invalid Name", {
  //        code: "KGRID_ERR",
          ref: "https://kgrid.org/kgrid-cli/#kgrid-create-ko",
          suggestions: ["Please provide a valid name for your knowledge object. (Alphanumeric characters only.)"],
        })
        return 1
      }
      let parsedInput = await parseInput('create', null, null, null, inputPath);

      if (parsedInput === 1) {
        console.log("Could not parse user input.");
        return 1
      }

      let responses = await inquirer.prompt([
        {
          type: 'list',
          name: 'selectedRuntime',
          message: 'Please select the target runtime: ',
          default: 0,
          scroll: false,
          choices: ['' +
          'V8', 'NodeJS']
        }
      ])
      runtime = responses.selectedRuntime;

      if (runtime === 'V8') {
        responses = await inquirer.prompt([
          {
            type: 'list',
            name: 'selectedTemplate',
            message: 'Please select the template type: ',
            default: 0,
            scroll: false,
            choices: ['Simple', 'Bundled', 'Executive']
          }
        ])
        switch (responses.selectedTemplate) {
          case 'Simple':
            template = 'simplejs'
            break
          case 'Bundled':
            template = 'bundlejs'
            break
          case 'Executive':
            template = 'executive'
            break
        }
      } else {
        template = 'simpleproxy'
      }
      process.stdout.write('Creating the Knowledge Object ...\r')
      fs.ensureDirSync(parsedInput.fullpath)
      topMeta.identifier = 'ark:/' + parsedInput.koid.naan + '/' + parsedInput.koid.name+ '/' + DEFAULT_VERSION;
      topMeta['@id'] = parsedInput.koid.naan + '/' + parsedInput.koid.name + '/' + DEFAULT_VERSION
      topMeta.version=DEFAULT_VERSION;
      fs.writeJsonSync(path.join(parsedInput.fullpath, 'metadata.json'), topMeta, {spaces: 4})

      var arkid = await addKOContent(parsedInput.fullpath, parsedInput.koid, template, runtime)
      process.stdout.write('The knowledge object ' + arkid + ' has been created.\n')
      if (template === 'bundlejs' && runtime !== 'NodeJS') {
        console.log('\nPlease go to the folder by `cd ' + args.ko + '`.\n\nRun `npm install` and `npm run build` before deploying to the activator.')
      } else {
        console.log('\nPlease go to the folder by `cd ' + args.ko + '`.\n\nRun `npm install` before deploying to the activator.')
      }
    } else {
      this.error("Missing Parameter: Name", {
//        code: "KGRID_ERR",
        ref: "https://kgrid.org/kgrid-cli/#kgrid-create-ko",
        suggestions: ["Please provide a valid name for your knowledge object.","Example: kgrid create myko"],
      })
      return 1
    }
  }
}

CreateCommand.description = `Create Knowledge Object.
${documentations.create}
`
CreateCommand.flags = {
  help: flags.help({char: 'h'})
}
CreateCommand.args = [
  {name: 'ko'}
]
module.exports = CreateCommand

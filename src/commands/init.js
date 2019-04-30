const {Command, flags} = require('@oclif/command')
const inquirer = require('inquirer')
const fs = require('fs-extra')
const yaml = require('js-yaml')
const serviceObj = require('../json/service.json')
const kometaObj = require('../json/kometadata.json')
const implementationMetaObj = require('../json/impmetadata.json')

var topMeta = JSON.parse(JSON.stringify(kometaObj))
var impleMeta = JSON.parse(JSON.stringify(implementationMetaObj))
var impleService = JSON.parse(JSON.stringify(serviceObj))

class InitCommand extends Command {
  async run() {
    const {flags} = this.parse(InitCommand)
    let version = flags.version
    let ready = false
    // Prompt for version
    if (version) {
      if (fs.pathExistsSync(version)) {
        this.log('Path existing. Please start over with a different version.')
      } else {
        ready = true
      }
    } else {
      let responses = await inquirer.prompt([
        {
          type: 'input',
          name: 'version',
          message: 'Implementation version: ',
          default: 'v0.1',
          validate: function (input) {
            var done = this.async()
            setTimeout(function () {
              if (fs.pathExistsSync(input)) {
                done('Path existing. You need to provide a different version.')
                return
              }
              done(null, true)
            }, 500)
          },
        },
      ])
      version = responses.version
      ready = true
    }
    if (ready) {
      if (fs.pathExistsSync('metadata.json')) {
        topMeta = fs.readJsonSync('metadata.json')
      } else {
        topMeta.hasImplementation = []
      }
      let idArr = topMeta.identifier.split('/')
      let idNaan = idArr[1]
      let idName = idArr[2]

      // Update Top Level Metadata
      topMeta.hasImplementation.push(idNaan + '-' + idName + '/' + version)
      topMeta.identifier = 'ark:/' + idNaan + '/' + idName
      topMeta['@id'] = idNaan + '-' + idName
      fs.writeJsonSync('metadata.json', topMeta, {spaces: 4})

      // Create the folder for implementation
      fs.ensureDirSync(version)

      // Update Implementation Metadata
      impleMeta['@id'] = version
      impleMeta.identifier = 'ark:/' + idNaan + '/' + idName + '/' + version
      impleMeta.hasServiceSpecification = version + '/service.yaml'
      impleMeta.hasPayload = version + '/welcome.js'
      fs.writeJsonSync(version + '/metadata.json', impleMeta,{spaces: 4})

      // Update Implementation Service Specification
      impleService.info.version = version
      impleService.servers[0].url = impleMeta.identifier.replace('ark:', '')
      fs.writeFileSync(version + '/service.yaml',
        yaml.safeDump(impleService, {
          styles: {
            '!!null': 'canonical', // dump null as ~
          },
          sortKeys: false,        // sort object keys
        })
      )

      // Create src folder for js files
      fs.ensureDirSync(version + '/src')
      fs.writeFileSync(version + '/src/welcome.js', 'function welcome(inputs){\n name = inputs.name; \n  return "Welcome to Knowledge Grid, " + name;\n }')
    }
  }
}

InitCommand.description = 'Create the knowledge object implementation'

InitCommand.flags = {
  version: flags.string({char: 'v'}),
}

module.exports = InitCommand

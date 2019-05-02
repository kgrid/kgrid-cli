const {Command, flags} = require('@oclif/command')
const inquirer = require('inquirer')
const fs = require('fs-extra')
const yaml = require('js-yaml')
const serviceObj = require('../template/service.json')
// const deploymentObj = require('../template/deployment.json')
const kometaObj = require('../template/kometadata.json')
const implementationMetaObj = require('../template/impmetadata.json')
const packageObj = require('../template/package.json')

var topMeta = JSON.parse(JSON.stringify(kometaObj))
var impleMeta = JSON.parse(JSON.stringify(implementationMetaObj))
var impleService = JSON.parse(JSON.stringify(serviceObj))
var pkgJson = JSON.parse(JSON.stringify(packageObj))

class InitCommand extends Command {
  async run() {
    // const {flags} = this.parse(InitCommand)
    // let version = flags.version
    let version = ''
    let ready = false
    // Prompt for version
    if (version!='') {
      if (fs.pathExistsSync(version)) {
        this.log('Path existing. Please start over with a different name for the implementation.')
      } else {
        ready = true
      }
    } else {
      let responses = await inquirer.prompt([
        {
          type: 'input',
          name: 'version',
          message: 'Implementation: ',
          default: 'v0.1',
          validate: function (input) {
            var done = this.async()
            setTimeout(function () {
              if (fs.pathExistsSync(input)) {
                done('Path existing. You need to provide a different name for the implementation.')
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
      impleMeta.hasPayload = version + '/src/index.js'
      fs.writeJsonSync(version + '/metadata.json', impleMeta, {spaces: 4})

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
      // fs.writeFileSync(version + '/deployment.yaml',
      //   yaml.safeDump(deploymentObj, {
      //     styles: {
      //       '!!null': 'canonical', // dump null as ~
      //     },
      //     sortKeys: false,        // sort object keys
      //   })
      // )

      // Update package.JSON
      // pkgJson.version = version.replace('v','')
      fs.writeJsonSync(version + '/package.json', pkgJson, {spaces: 4})

      // Create src folder for js files
      fs.ensureDirSync(version + '/src')
      fs.writeFileSync(version + '/src/index.js', 'function welcome(inputs){\n name = inputs.name; \n  return "Welcome to Knowledge Grid, " + name;\n }')

      // Create src folder for js files
      fs.ensureDirSync(version + '/test')
      fs.writeFileSync(version + '/test/welcome.test.js', 'const rewire = require("rewire") \n const javascript = rewire("../src/index") \n  var welcome = javascript.__get__("welcome") \n test("hello barney (src)", () => { expect( welcome({"name": "Barney Rubble"})).toBe("Welcome to Knowledge Grid, Barney Rubble")})')
      this.log('The implementation of ' + version + ' has been added.')
    }
  }
}

InitCommand.description = 'Add an implementation to the knowledge object.'
//
// InitCommand.flags = {
//   version: flags.string({char: 'v'}),
// }

module.exports = InitCommand

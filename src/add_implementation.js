const inquirer = require('inquirer')
const fs = require('fs-extra')
const yaml = require('js-yaml')
const path =require('path')
const serviceObj = require('../src/template/simple/service.json')
const kometaObj = require('../src/template/kometadata.json')
const implementationMetaObj = require('../src/template/simple/impmetadata.json')
const packageObj = require('../src/template/simple/package.json')
const source = require.resolve('../src/template/simple/src/index.js')
const sourcePath = path.dirname(path.dirname(source))

var topMeta = JSON.parse(JSON.stringify(kometaObj))
var impleMeta = JSON.parse(JSON.stringify(implementationMetaObj))
var impleService = JSON.parse(JSON.stringify(serviceObj))
var pkgJson = JSON.parse(JSON.stringify(packageObj))

async function addImplementation (ko, version) {
  if (fs.pathExistsSync(path.join(ko,'metadata.json'))) {
    topMeta = fs.readJsonSync(path.join(ko,'metadata.json'))
  } else {
    topMeta.hasImplementation = []
  }
  let ready = false
  let imptitle = impleMeta.title

  if (version!='') {
    if (fs.pathExistsSync(path.join(ko,version))) {
      console.log('Path existing. Please start over with a different name for the implementation.')
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
          return !fs.pathExistsSync(path.join(ko,input)) || 'Path existing. Please provide a different name for the implementation.'
        },
      },
    ])
    version = responses.version
    ready = true
  }
  if (ready) {

    let idArr = topMeta.identifier.split('/')
    let idNaan = idArr[1]
    let idName = idArr[2]

    // Update Top Level Metadata
    topMeta.hasImplementation.push(idNaan + '-' + idName + '/' + version)
    topMeta.identifier = 'ark:/' + idNaan + '/' + idName
    topMeta['@id'] = idNaan + '-' + idName
    fs.writeJsonSync(path.join(ko,'metadata.json'), topMeta, {spaces: 4})
    let implementationPath = path.join(ko, version)
    // Create the folder for implementation
    fs.ensureDirSync(implementationPath)

    // Update Implementation Metadata
    impleMeta['@id'] = version
    impleMeta.title=imptitle
    impleMeta.identifier = 'ark:/' + idNaan + '/' + idName + '/' + version
    impleMeta.hasServiceSpecification = version + '/service.yaml'
    impleMeta.hasPayload = version + '/src/index.js'
    fs.writeJsonSync(path.join(implementationPath,'metadata.json'), impleMeta, {spaces: 4})

    // Update Implementation Service Specification
    impleService.info.version = version
    impleService.servers[0].url = impleMeta.identifier.replace('ark:', '')
    fs.writeFileSync(path.join(implementationPath,'service.yaml'),
      yaml.safeDump(impleService, {
        styles: {
          '!!null': 'canonical', // dump null as ~
        },
        sortKeys: false,        // sort object keys
      })
    )

    // Update package.JSON
    fs.writeJsonSync(path.join(implementationPath,'package.json'), pkgJson, {spaces: 4})

    // Create src folder for js files
    fs.ensureDirSync(path.join(implementationPath, 'src'))
    fs.copySync(path.join(sourcePath,'src'), path.join(implementationPath, 'src'))
    // Create test folder for js files
    fs.ensureDirSync(path.join(implementationPath, 'test'))
    fs.copySync(path.join(sourcePath,'test'), path.join(implementationPath, 'test'))

    if(ko==''){
      console.log('The implementation of ' + version + ' has been added.')
    }else {
      console.log('The implementation of ' + version + ' has been initialized.')
    }
  }
}
module.exports=addImplementation

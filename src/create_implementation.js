const inquirer = require('inquirer')
const fs = require('fs-extra')
const yaml = require('js-yaml')
const path =require('path')
const source = require.resolve('../src/template/kometadata.json')
const topSourcePath = path.dirname(source)
const os = require('os')

async function createImplementation (ko, implementation, template, flat) {
  let ready = false
  let implementationPath = ko+'_'+implementation
  if (implementation!='') {
    if (fs.pathExistsSync(implementationPath)) {
      console.log('Path existing. Please start over with a different name for the implementation.')
    } else {
      ready = true
    }
  } else {
    let responses = await inquirer.prompt([
      {
        type: 'input',
        name: 'implementation',
        message: 'Implementation: ',
        default: 'implementation',
        validate: function (input) {
          return !fs.pathExistsSync(ko+'_'+input) || 'Path existing. Please provide a different name for the implementation.'
        },
      },
    ])
    implementation = responses.implementation
    ready = true
  }
  if (ready) {
    var sourcePath = path.join(topSourcePath, template)
    var topMeta
    if (fs.pathExistsSync(path.join(ko,'metadata.json'))) {
      topMeta = fs.readJsonSync(path.join(ko,'metadata.json'))
    } else {
      topMeta = fs.readJsonSync(path.join(topSourcePath,'metadata.json'))
    }

    const serviceObj = fs.readJsonSync(path.join(sourcePath,'service.json'))
    const implementationMetaObj = fs.readJsonSync(path.join(sourcePath,'impmetadata.json'))
    const packageObj = fs.readJsonSync(path.join(sourcePath,'package.json'))

    var impleMeta = JSON.parse(JSON.stringify(implementationMetaObj))
    var impleService = JSON.parse(JSON.stringify(serviceObj))
    var pkgJson = JSON.parse(JSON.stringify(packageObj))

    let idArr = topMeta.identifier.split('/')
    let idNaan = os.userInfo().username
    let idName = ko

    if(idName==''){
      idName = path.basename(process.cwd())
    }
    // Update Top Level Metadata
    topMeta.hasImplementation.push(idNaan + '-' + idName + '/' + implementation)
    topMeta.identifier = 'ark:/' + idNaan + '/' + idName
    topMeta['@id'] = idNaan + '-' + idName
    fs.writeJsonSync(path.join(ko,'metadata.json'), topMeta, {spaces: 4})
    if(flat){
      implementationPath = ko+'_'+implementation
    } else {
      implementationPath = path.join(ko,implementation)
    }
    // Create the folder for implementation
    fs.ensureDirSync(implementationPath)

    // Update Implementation Metadata
    impleMeta['@id'] = implementation
    impleMeta.identifier = 'ark:/' + idNaan + '/' + idName + '/' + implementation
    impleMeta.hasServiceSpecification = implementation + '/service.yaml'
    if(template=='bundled') {
      impleMeta.hasPayload =  implementation + '/dist/main.js'
    } else {
      impleMeta.hasPayload = implementation + '/src/index.js'
    }
    fs.writeJsonSync(path.join(implementationPath,'metadata.json'), impleMeta, {spaces: 4})

    // Update Implementation Service Specification
    impleService.info.implementation = implementation
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

    if(template=='bundled') {
      // Add webpack.config.js for bundled implementation
      fs.copySync(path.join(sourcePath,'webpack.config.js'), path.join(implementationPath,'webpack.config.js'))
    }

    if(ko==''){
      console.log('The implementation of ' + implementation + ' has been added.')
    }else {
      console.log('The implementation of ' + implementation + ' has been initialized.')
    }
  }
}
module.exports=createImplementation

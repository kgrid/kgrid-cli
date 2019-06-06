const fs = require('fs-extra')
const yaml = require('js-yaml')
const path =require('path')
const os = require('os')
const colors = require('colors/safe');
const source = require.resolve('../src/template/kometadata.json')
const userConfig = require('../src/user_config')
const topSourcePath = path.dirname(source)

async function createImplementation (ko, implementation, template, flat) {
  let implementationPath = ''
  if(flat){
    implementationPath = ko+'_'+implementation
  } else {
    implementationPath = path.join(ko,implementation)
  }
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

  var userNaan = os.userInfo().username
  const userConfigJson =  userConfig()
  if(userConfigJson){
    userNaan = userConfigJson.devDefault.naan
  }
  let idArr = topMeta.identifier.split('/')
  let idNaan = userNaan
  let idName = ko

  if(idName==''){
    idName = path.basename(process.cwd())
  }
  // Update Top Level Metadata
  let topMetaImplementations = topMeta.hasImplementation;
  topMeta.hasImplementation =[]
  if(!Array.isArray(topMetaImplementations)){
    topMeta.hasImplementation.push(topMetaImplementations)
  } else {
    topMeta.hasImplementation= JSON.parse(JSON.stringify(topMetaImplementations))
  }

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
  impleService.info.version = implementation
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
  console.log('\nThe implementation of ' + colors.cyan.inverse(implementation) + ' has been initialized.')
}

module.exports=createImplementation

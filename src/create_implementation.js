const fs = require('fs-extra')
const yaml = require('js-yaml')
const path =require('path')
const source = require.resolve('../src/template/kometadata.json')

async function createImplementation (fullpath, koid, template) {
  let shelf = path.dirname(fullpath)
  var sourcePath = path.join(path.dirname(source), template)
  var topMeta = fs.readJsonSync(path.join(fullpath,'metadata.json'))
  const serviceObj = fs.readJsonSync(path.join(sourcePath,'service.json'))
  const implementationMetaObj = fs.readJsonSync(path.join(sourcePath,'impmetadata.json'))
  const packageObj = fs.readJsonSync(path.join(sourcePath,'package.json'))
  var impleMeta = JSON.parse(JSON.stringify(implementationMetaObj))
  var impleService = JSON.parse(JSON.stringify(serviceObj))
  var pkgJson = JSON.parse(JSON.stringify(packageObj))
  // Update Top Level Metadata
  // let topMetaImplementations = topMeta.hasImplementation;
  // topMeta.hasImplementation =[]
  // if(!Array.isArray(topMetaImplementations)){
  //   topMeta.hasImplementation.push(topMetaImplementations)
  // } else {
  //   topMeta.hasImplementation= JSON.parse(JSON.stringify(topMetaImplementations))
  // }
  // topMeta.hasImplementation.push(koid.naan + '-' + koid.name + '/' + koid.imp)
  fs.writeJsonSync(path.join(fullpath,'metadata.json'), topMeta, {spaces: 4})
  // Create the folder for implementation
  fs.ensureDirSync(fullpath)
  // Update Implementation Metadata
  impleMeta['@id'] = koid.imp
  impleMeta.identifier = 'ark:/' + koid.naan + '/' + koid.name
  impleMeta.hasServiceSpecification = koid.imp + '/service.yaml'
  // fs.writeJsonSync(path.join(fullpath,'metadata.json'), impleMeta, {spaces: 4})
  // Update Implementation Service Specification
  impleService.info.version = koid.imp
  impleService.servers[0].url = impleMeta.identifier.replace('ark:', '')
  fs.writeFileSync(path.join(fullpath,'service.yaml'),
    yaml.safeDump(impleService, {
      styles: { '!!null': 'canonical',}, // dump null as ~
      sortKeys: false,        // sort object keys
    })
  )
  // Update package.JSON
  fs.writeJsonSync(path.join(fullpath,'package.json'), pkgJson, {spaces: 4})
  // Create src folder for js files
  fs.ensureDirSync(path.join(fullpath, 'src'))
  fs.copySync(path.join(sourcePath,'src'), path.join(fullpath, 'src'))
  // Create test folder for js files
  fs.ensureDirSync(path.join(fullpath, 'test'))
  fs.copySync(path.join(sourcePath,'test'), path.join(fullpath, 'test'))
  if(template=='bundled') {
    // Add webpack.config.js for bundled implementation
    fs.copySync(path.join(sourcePath,'webpack.config.js'), path.join(fullpath,'webpack.config.js'))
  }
  console.log('The implementation of ' + koid.imp + ' has been initialized.\n')
  return koid.naan + '/' + koid.name
}

module.exports=createImplementation

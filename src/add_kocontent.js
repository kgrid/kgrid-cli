const fs = require('fs-extra')
const yaml = require('js-yaml')
const path = require('path')
const source = require.resolve('../src/template/kometadata.json')


async function addKOContent(fullpath, koid, template, runtime) {
  let sourcePath = path.join(path.dirname(source), template);
  let topMeta = fs.readJsonSync(path.join(fullpath, 'metadata.json'));
  const serviceObj = fs.readJsonSync(path.join(sourcePath, 'service.json'))
  const deploymentObj = fs.readJsonSync(path.join(sourcePath, 'deployment.json'))
  const packageObj = fs.readJsonSync(path.join(sourcePath, 'package.json'))
  let koService = JSON.parse(JSON.stringify(serviceObj));
  let koDeployment = JSON.parse(JSON.stringify(deploymentObj));
  let pkgJson = JSON.parse(JSON.stringify(packageObj));
  let artifact = "src/index.js"

  if (template === 'bundlejs' && runtime !== 'NodeJS') {
    artifact = "dist/main.js"
  }
  topMeta.hasPayload.push(artifact)
  fs.writeJsonSync(path.join(fullpath, 'metadata.json'), topMeta, {spaces: 4})

  koService.servers[0].url = '/' + koid.naan + '/' + koid.name ;
  fs.writeFileSync(path.join(fullpath, 'service.yaml'),
    yaml.safeDump(koService, {
      styles: {'!!null': 'canonical',}, // dump null as ~
      sortKeys: false,                   // sort object keys
    })
  )
  fs.writeFileSync(path.join(fullpath, 'deployment.yaml'),
    yaml.safeDump(koDeployment, {
      styles: {'!!null': 'canonical',}, // dump null as ~
      sortKeys: false,                   // sort object keys
    })
  )
  pkgJson.name = '@kgrid/' + koid.naan + '-' + koid.name
  fs.writeJsonSync(path.join(fullpath, 'package.json'), pkgJson, {spaces: 4})   // Update package.JSON
  fs.ensureDirSync(path.join(fullpath, 'src'))    // Create src folder for js files
  fs.copySync(path.join(sourcePath, 'src'), path.join(fullpath, 'src'))
  fs.ensureDirSync(path.join(fullpath, 'test'))    // Create test folder for js files
  fs.copySync(path.join(sourcePath, 'test'), path.join(fullpath, 'test'))
  // Add webpack.config.js for bundled KO
  if (template === 'bundlejs') {
    fs.copySync(path.join(sourcePath, 'webpack.config.v8'), path.join(fullpath, 'webpack.config.js'))
  }

  return koid.naan + '/' + koid.name
}

module.exports = addKOContent

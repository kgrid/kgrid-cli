#!/usr/bin/env node
const program = require('commander')
const inquirer = require('inquirer')
const downloadgit = require('download-git-repo')
const path = require('path')
const fs = require('fs-extra')
const ncp = require('ncp').ncp

program
  .name('kgrid extract')
  .description('This will extract the legacy knowledge object. \n\n  The object file name can be entered as command line arguemnt or as input.\n\n  Option -l will extract the KO into the legacy file template. \n\n  You can specify a local folder where a template can be found. If not using the local template, a template will be downloaded from GitHub. \n\n  Example:\n\n        kgrid extract 99999-trial \n\n ')
  .usage('<template-name> <project-name> [object-name]')
  .usage('[filename] [options]')
  .option('-l, --legacy', 'The option to extract knowledge objects using legacy model')
 	.parse(process.argv)

var file = program.args[0]
const inputfile = 'input.xml'
const outputfile = 'output.xml'
const payloadfile = 'payload'
var payloadext = 'js'
const metadatafile = 'metadata.json'
const basefile = 'base.json'

var template = 'kotemplate'
var localtemplatedir = ''
var koid = '99999-newko'
var tmp = 'tmp'
var dest = koid.replace(/[\/:]/g, '-')
var gittemplate = 'kgrid/ko-templates'
var src = path.join(tmp, template)

inquirer.prompt([{
  type: 'input',
  name: 'srcfile',
  message: 'The KO file to extract: ',
  default: file
},
{
  type: 'confirm',
  name: 'localtemp',
  message: 'Would you like to use a template from your local folder? ',
  default: false
},
{
  type: 'input',
  name: 'localtemplatedir',
  message: 'Local Template Directory:',
  default: process.cwd(),
  when: function (answers) {
    return answers.localtemp
  }
}
]).then(answers => {
  if (answers.localtemp) {
    template = answers.templatetype
    localtemplatedir = answers.localtemplatedir
  }
  file = answers.srcfile
  fs.pathExists(file, (err, exists) => {
    if (exists) {
      var array = file.split('.')
      koid = array[0]
      dest = koid.replace(/[\/:]/g, '-')
      if (program.legacy) {
        console.log('Start extracting ' + file + ' into legacy template ...')
        extractinglegacytolegacy(file)
      } else {
        console.log('Start extracting ' + file + ' ...')
        extractlegacy(file)
      }
    } else {
      console.log('The file is not found. Please check the path and try again.')
    }
  })
})

function extractinglegacytolegacy (srcfile) {
  var data = fs.readFileSync(srcfile, 'utf8')
  var myobject = JSON.parse(data)
  var metadata = {'metadata': {}}
  metadata.metadata = myobject.metadata
  payloadfile = myobject.payload.functionName
  var payload = myobject.payload.content
  var enginetype = myobject.payload.engineType.toUpperCase()
  switch (enginetype) {
    case 'JS':
      payloadext = 'js'
      break
    case 'PYTHON':
      payloadext = 'py'
      break
  }
  var input = myobject.inputMessage
  var output = myobject.outputMessage
  myobject.payload.content = ''
  myobject.metadata = {}
  myobject.inputMessage = ''
  myobject.outputMessage = ''
  fs.ensureDir('target', err => {
    if (err != null) { console.log(err) }
    fs.writeFileSync('target/base.json', JSON.stringify(myobject))
    fs.writeFileSync('target/metadata.json', JSON.stringify(metadata))
    fs.writeFileSync('target/' + payloadfile + '.' + payloadext, payload)
    fs.writeFileSync('target/input.xml', input)
    fs.writeFileSync('target/output.xml', output)
    console.log('Extracted files can be found in the folder of target.')
  })
}

function extractlegacy (srcfile) {
  var data = fs.readFileSync(srcfile, 'utf8')
  // console.log(data)
  var myobject = JSON.parse(data)

  if (myobject.metadata.arkId) {
    var ark = myobject.metadata.arkId.replace('ark:\/', '')
    koid = ark.replace(/[\/:]/g, '-')
  }
  var ver = 'v0.0.1'
  if (myobject.metadata.version) {
    if (myobject.metadata.version != '') {
      ver = myobject.metadata.version
    }
  }
  var fn = myobject.payload.functionName
  var payload = myobject.payload.content
  var enginetype = myobject.payload.engineType.toUpperCase()
  switch (enginetype) {
    case 'JS':
      payloadext = 'js'
      break
    case 'PYTHON':
      payloadext = 'py'
      break
  }
  dest = 'target/' + koid + '/' + ver

  var resfile = fn + '.' + payloadext
  // var iospec = {}
  // iospec.inputMessage = myobject.inputMessage
  // iospec.outputMessage = myobject.outputMessage

  console.log('Object ID: ' + koid)
  console.log('Version: ' + ver)
  fs.ensureDir(dest).then(() => {
    console.log('Creating template ...')
    initproject(localtemplatedir != '', function () {
      var metadata =  JSON.parse(fs.readFileSync( src+'/hello-world/v0.0.1' + '/metadata.json', 'utf8'))
      metadata = myobject.metadata
      var o = {}
      o.arkId='ark:/' + koid
      o.fedoraPath=koid.replace('/','-')
      metadata.arkId = o.arkId.replace('-','/')

      // metadata['@graph'][0].version = myobject.metadata.version
      // metadata['@graph'][0].title = myobject.metadata.title
      // metadata['@graph'][0].owners = myobject.metadata.owners
      // metadata['@graph'][0].contributors = myobject.metadata.contributors
      // metadata['@graph'][0].description = myobject.metadata.description
      // metadata['@graph'][0].fedoraPath = koid
      // metadata['@graph'][0].arkId = 'ark:/' + koid
      console.log('Extracting top-level metadata ...')
      fs.writeFileSync(dest + '/metadata.json', JSON.stringify(metadata, null,2))
      var model_metadata =  JSON.parse(fs.readFileSync( src+'/hello-world/v0.0.1' + '/model/metadata.json', 'utf8'))
      // model_metadata['@graph'][0].functionName = myobject.payload.functionName
      // model_metadata['@graph'][0].adapterType = myobject.payload.engineType.toUpperCase()
      model_metadata.functionName = myobject.payload.functionName
      if(myobject.payload.engineType=='JS'){
        model_metadata.adapterType = 'JAVASCRIPT'
      }else {
        model_metadata.adapterType = myobject.payload.engineType.toUpperCase()
      }
      fs.writeFileSync(dest + '/model/metadata.json', JSON.stringify(model_metadata, null,2))
      console.log('Extracting payload code ...')
      // var resmeta = fs.readFileSync(dest + '/model/resource/metadata.json')
      // fs.unlink(dest+'/model/resource/metadata.json',err=>{})
      fs.unlink(dest + '/model/resource/welcome.js', err => {})
      // resmeta.list = []
      // resmeta.list.push({filename: resfile})
      // fs.writeFileSync(dest + '/model/resource/metadata.json', resmeta)
      fs.writeFileSync(dest + '/model/resource/' + resfile, payload)
      // console.log('Extracting I/O specifications ...')
      // fs.writeFileSync(dest + '/model/service/iospec.json', iospec)
      // fs.writeFileSync(dest+'/model/service/output.xml',output)
      console.log('Extraction Complete!')
    })
  }).catch(err => {
    console.log(err)
  })
}

function initproject (local, callback) {
  if (!local) {
    downloadgit(gittemplate, tmp, err => {
		  if (err != null) {
		    console.log(err)
		  } else {
    copytemplate(false, callback)
  }
    })
  } else {
    copytemplate(true, callback)
  }
}

function copytemplate (local, callback) {
  var source = src + '/hello-world/v0.0.1'
  if (local) source = localtemplatedir
  fs.ensureDir(dest, err => {
    if (err != null) {
      console.log(err)
    } else {
      console.log(dest)
      ncp(source, dest, function (err) {
        if (err != null) {
          console.error(err)
        } else {
          callback()
          if (!local) fs.remove(tmp, err => { if (err) console.log(err) })
        }
      })
    }
  })
}

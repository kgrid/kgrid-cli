#!/usr/bin/env node
var program = require('commander')
var inquirer = require('inquirer')
var download = require('download-git-repo')
var path=require('path')
const fs=require('fs-extra')
const ncp=require('ncp').ncp

program
  .name('kgrid extract')
  .description('This will extract the legacy knowledge object. \n\n  The object file name can be entered as command line arguemnt or as input.\n\n  Option -l will extract the KO into the legacy file template. \n\n  You can specify a local folder where a template can be found. If not using the local template, a template will be downloaded from GitHub. \n\n  Example:\n\n        kgrid extract 99999-trial \n\n ')
  .usage('<template-name> <project-name> [object-name]')
  .usage('[filename] [options]')
  .option('-l, --legacy','The option to extract knowledge objects using legacy model')
 	.parse(process.argv)

var file = program.args[0]
const inputfile ='input.xml'
const outputfile='output.xml'
const payloadfile='payload'
var payloadext = 'js'
const metadatafile='metadata.json'
const basefile='base.json'

 var template = 'kotemplate'
 var localtemplatedir=''
  var koid='99999-newko'
 var tmp = 'tmp'
 var dest = koid.replace(/[\/:]/g, '-')
 var gittemplate='kgrid/ko-templates'
 var src=path.join(tmp,template)

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
        default:process.cwd(),
        when:function(answers){
          return answers.localtemp
        }
      }
        ]).then(answers=>{
        if(answers.localtemp){
          template=answers.templatetype
          localtemplatedir = answers.localtemplatedir
        }
        fs.pathExists(answers.srcfile, (err, exists)=>{
          if(exists){
        if(program.legacy){
          console.log('Start extracting '+answers.srcfile+' into legacy template ...')
          extractinglegacytolegacy(answers.srcfile)
        }else {
          console.log('Start extracting '+answers.srcfile+' ...')
          // extractinglegacy(answers.srcfile)
          extractlegacy(answers.srcfile)
          }
        }else {
          console.log('The file is not found. Please check the path and try again.')
        }

      })
    })

function extractinglegacytolegacy(srcfile){
  var data = fs.readFileSync(srcfile, 'utf8')
  var myobject = JSON.parse(data)
  var metadata ={'metadata':{}}
  metadata.metadata = myobject.metadata
  var payload = myobject.payload.content
  var enginetype= myobject.payload.engineType.toUpperCase()
  switch(enginetype){
    case 'JS':
      payloadext='js'
      break;
    case 'PYTHON':
      payloadext='py'
      break;
  }
  var input=myobject.inputMessage
  var output = myobject.outputMessage
  myobject.payload.content=''
  myobject.metadata={}
  myobject.inputMessage=''
  myobject.outputMessage=''
  fs.ensureDir('target', err => {
    if(err!=null){console.log(err) }
    fs.writeFileSync('target/base.json',JSON.stringify(myobject))
    fs.writeFileSync('target/metadata.json',JSON.stringify(metadata))
    fs.writeFileSync('target/payload.'+payloadext,payload)
    fs.writeFileSync('target/input.xml',input)
    fs.writeFileSync('target/output.xml',output)
    console.log('Extracted files can be found in the folder of target.')
 })
}

function extractlegacy(srcfile){
  var data = fs.readFileSync(srcfile, 'utf8')
  var myobject = JSON.parse(data)
  var metadata ={'metadata':{}}
  metadata.metadata = myobject.metadata
  if(myobject.metadata.arkId){
     var ark=myobject.metadata.arkId.replace('ark:\/', '')
     koid=ark.replace(/[\/:]/g, '-')
   }
  var ver= 'v-0-0-1'
  if(myobject.metadata.version){
    if(myobject.metadata.version!=''){
      ver=myobject.metadata.version
    }
  }
  var payload = myobject.payload.content
  var enginetype= myobject.payload.engineType.toUpperCase()
  switch(enginetype){
    case 'JS':
      payloadext='js'
      break;
    case 'PYTHON':
      payloadext='py'
      break;
  }
  dest='target/'+koid+'/'+ver
  var input=myobject.inputMessage
  var output = myobject.outputMessage
  console.log("Object ID: "+koid)
  console.log("Version: "+ver)
  fs.ensureDir('target').then(() => {
    console.log('Creating template ...')
    initproject(localtemplatedir!='', function(){
      console.log('Extracting top-level metadata ...')
      fs.writeFileSync(dest+'/metadata.json',JSON.stringify(metadata))
      console.log('Extracting payload code ...')
      fs.writeFileSync(dest+'/models/resource/payload.'+payloadext,payload)
      console.log('Extracting I/O specifications ...')
      fs.writeFileSync(dest+'/models/service/input.xml',input)
      fs.writeFileSync(dest+'/models/service/output.xml',output)
      console.log('Extraction Complete!')
    })
  }).catch(err=>{
    console.log(err)
  })
}

function initproject(local,callback){
  if(!local){
    download(gittemplate, tmp, err => {
		  if(err!=null){
		    console.log(err)
		  }else {
        copytemplate(false, callback)
      }
    })
  }else{
    copytemplate(true,callback)
  }
}

function copytemplate(local, callback){
  var source = src+'/ko'
  if(local) source =localtemplatedir
  fs.ensureDir(dest, err => {
    if(err!=null){
      console.log(err)
    }else{
      ncp(source,dest, function(err) {
        if(err!=null){
          console.error(err)
        }else{
          callback()
          if(!local) fs.remove(tmp,err=>{ if(err) console.log(err)})
        }
      })
    }
  })
}

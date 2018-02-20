#!/usr/bin/env node
var download = require('download-git-repo')
const downloadurl = require('download')
var program = require('commander')
var path=require('path')
var inquirer = require('inquirer')
const fs=require('fs-extra')
const ncp=require('ncp').ncp
const exists = require('fs').existsSync
const zipFolder = require('zip-folder')

program
  .name('kgrid extract')
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

inquirer.prompt([{
        type: 'input',
        name: 'srcfile',
        message: 'The KO file to extract: ',
        default: file
      }]).then(answers=>{
        console.log('Start extracting '+answers.srcfile+' ...')
        extractinglegacytolegacy(answers.srcfile)
      })

function extractinglegacytolegacy(srcfile){
  var data = fs.readFileSync(srcfile, 'utf8')
  var myobject = JSON.parse(data)
  var metadata ={'metadata':{}}
  metadata.metadata = myobject.metadata
  var payload = myobject.payload.content
  var enginetype= myobject.payload.enginetype
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
//  console.log(JSON.stringify(myobject))
  fs.ensureDir('extra', err => {
    if(err!=null){console.log(err) }
    fs.writeFileSync('extra/base.json',JSON.stringify(myobject))
    fs.writeFileSync('extra/metadata.json',JSON.stringify(metadata))
    fs.writeFileSync('extra/payload.'+payloadext,payload)
    fs.writeFileSync('extra/input.xml',input)
    fs.writeFileSync('extra/output.xml',output)
    console.log('Extracted files can be found in the folder of extra.')
 })
}

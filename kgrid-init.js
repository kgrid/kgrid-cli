#!/usr/bin/env node
var download = require('download-git-repo')
const downloadurl = require('download')
var program = require('commander')
var path=require('path')
const inquirer = require('inquirer')
const fs=require('fs-extra')
const ncp=require('ncp').ncp
const exists = require('fs').existsSync
const minimist = require('minimist')
const moment = require('moment')
program
  .name('kgrid init')
  .description('This will initialize the knowledge object based on the specified template. \n\n  If object-name is omitted, the object will have the same name as project-name.\n\n  Use kgrid list -t to find the available templates. \n\n  Example:\n\n        kgrid init jslegacy myproject 99999-trial\n\n        cd myproject \n\n        kgrid install')
  .usage('<template-name> <project-name> [object-name]')
  .option('-i, --input','An optional mode to enter the set-up information interactively.')
 	.parse(process.argv)

var template = ''
var localtemplatedir=''
var project = 'newproject'
var object = 'newko'
var version = 'v0.0.1'
const choices = [
  'jslegacy'
  ,'pythonlegacy'
  ,'kotemplate'
]
var tmp = 'tmp'
var srccontainer= 'src'
var dest = project.replace(/[\/:]/g, '-')
var gittemplate='kgrid/ko-templates'
var src=path.join(tmp,template)
var prop = {'template':'','project':'','object':'','version':'','adapters':[]}

var argv=minimist(process.argv.slice(2))
console.log(argv)
if (program.args.length<2 && !program.input) {
  program.help()
}else {
  template=program.args[0]
  if (program.args[1]!=null) {
    project=program.args[1]
  }
  if (program.args[2]!=null) {
    object=program.args[2]
  } else {
    object=project
  }
  var inx=choices.indexOf(template)
  if (inx==-1) {
    console.log("Unknown template. The default template will be used.")
    inx=2
    template=choices[inx]
  }
  if (program.input) {
    inquirer.prompt([
            {
              type: 'confirm',
              name: 'localtemp',
              message: 'Would you like to use a template from your local folder? ',
              default: false
            },
      {
        type: 'rawlist',
        name: 'template',
        message: 'Please select one of the available templates:',
        choices:choices,
        default:inx,
        when:function(answers){
          return !answers.localtemp
        }
      },
      {
        type: 'rawlist',
        name: 'templatetype',
        message: 'Please select one of the template types:',
        choices:choices,
        default:inx,
        when:function(answers){
          return answers.localtemp
        }
      },
      {
        type: 'input',
        name: 'localtemplatedir',
        message: 'Local Template Directory:',
        default:process.cwd(),
        when:function(answers){
          return answers.localtemp
        }
      },
      {
        type: 'input',
        name: 'project',
        message: 'Project Name: ',
        default:project
      },
      {
        type: 'input',
        name: 'object',
        message: 'Object Name: ',
        default:function(a){ return a.project}
      },
      {
        type: 'input',
        name: 'version',
        message: 'Version: ',
        default:function(a){ return 'v0.0.1'}
      }
    ]).then(answers=>{
      if(answers.localtemp){
        template=answers.templatetype
        localtemplatedir = answers.localtemplatedir
      }else {
        template=answers.template
      }
      project=answers.project
      object=answers.object
      version = answers.version
      checkproject(project)
    })
  }else {
    checkproject(project)
  }
}

function checkproject(proj){
  dest = project.replace(/[\/:]/g, '-')
  src=path.join(tmp,template)
  if(exists(proj)){
      console.log('The project name is in use. Continuing will overwrite the existing project.')
      inquirer.prompt([{
            type: 'confirm',
            name: 'continue',
            message: 'Would you like to continue? ',
            default: false
          }]).then(answers=>{
            if (answers.continue){
              var local=(localtemplatedir!='')
              initproject(local)
            }else {
              console.log('Please change the project name and try again.')
            }
          },err=>{
            console.log(err)
          })
  }else {
    var local=(localtemplatedir!='')
    initproject(local)
  }
}

function initproject(local){
  if(object!=null){
		console.log('Your Object Name:'+object)
		dest = object.replace(/[\/:]/g, '-')
  }
  prop.template=template
  prop.project=project
  prop.object=dest
  prop.version=version
  switch (template){
    case 'jslegacy':
      prop.adapters.push('JS')
      break
    case 'pythonlegacy':
      prop.adapters.push('PYTHON')
      break
    default:
      prop.adapters.push('JS')
      break
  }
  console.log(JSON.stringify(prop))
  if(!local){
    download(gittemplate, tmp, err => {
		  if(err!=null){
		    console.log(err)
		  }else {
        copytemplate(false)
      }
    })
  }else{
    copytemplate(true)
  }
}

function copytemplate(local){
  var source = src+'/ko'
  if(local) source =localtemplatedir
  fs.ensureDir(project+'/'+dest+'/'+version, err => {
    if(err!=null){
      console.log(err)
    }else{
      ncp(source, project+'/'+dest+'/'+version, function(err) {
        if(err!=null){
          console.error(err)
        }else{
          console.log('Successfully initiated your object!')
          var metadata= JSON.parse(fs.readFileSync(project+'/'+dest+'/'+version+'/metadata.json', 'utf8'))
          metadata.version=version
          metadata.metadata.arkId.fedoraPath=dest
          metadata.metadata.createdOn=moment().valueOf()
          metadata.metadata.lastModified=moment().valueOf()
          metadata.metadata.arkId.arkId='ark:/'+dest.replace('-','\/')
          console.log(JSON.stringify(metadata))
          fs.writeFileSync(project+'/'+dest+'/'+version+'/metadata.json',JSON.stringify(metadata))
          var p = JSON.parse(fs.readFileSync(src+'/project.json'))
          prop.tools=JSON.parse(JSON.stringify(p.tools))
          fs.writeFileSync(project+'/project.json',JSON.stringify(prop))
          if(!local) fs.remove(tmp,err=>{ if(err) console.log(err)})
        }
      })
    }
  })
}

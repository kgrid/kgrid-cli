#!/usr/bin/env node
var download = require('download-git-repo')
const downloadurl = require('download')
var program = require('commander')
var path=require('path')
const inquirer = require('inquirer')
const fs=require('fs-extra')
const ncp=require('ncp').ncp
const exists = require('fs').existsSync

program
  .name('kgrid init')
  .description('This will initialize the knowledge object based on the specified template. \n\n  If object-name is omitted, the object will have the same name as project-name.\n\n  Use kgrid list -t to find the available templates. \n\n  Example:\n\n        kgrid init jslegacy myproject 99999-trial\n\n        cd myproject \n\n        kgrid install')
  .usage('<template-name> <project-name> [object-name]')
  .option('-i, --input','An optional mode to enter the set-up information interactively.')
 	.parse(process.argv)

var template = ''
var project = 'newproject'
var object = 'newko'
const choices = [
  'jslegacy',
  'pythonlegacy',
  'sample'
]
if(program.args.length<2 && !program.input){
  program.help()
}else {
  template=program.args[0]
  if(program.args[1]!=null){
    project=program.args[1]
  }
  if(program.args[2]!=null){
    object=program.args[2]
  }else{
    object=project
  }
  var inx=choices.indexOf(template)
  if(inx==-1){ inx=0}
  if(program.input){
    inquirer.prompt([{
        type: 'rawlist',
        name: 'template',
        message: 'Please select one of the available templates:',
        choices:choices,
        default:inx
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
      }
    ]).then(answers=>{
        template=answers.template
        project=answers.project
        object=answers.object
        checkproject(project)
    })
  }else {
    checkproject(project)
  }

}

function checkproject(proj){
  if(exists(proj)){
      console.log('The project name is in use. Continuing will overwrite the existing project.')
      inquirer.prompt([{
            type: 'confirm',
            name: 'continue',
            message: 'Would you like to continue? ',
            default: false
          }]).then(answers=>{
            if (answers.continue){
              initproject()
            }else {
              console.log('Please change the project name and try again.')
            }
          },err=>{
            console.log(err)
          })
  }else {
      initproject()
  }
}

function initproject(){
  var tmp = 'tmp'
  var srccontainer= 'src'
  var dest = project.replace(/[\/:]/g, '-')
  var gittemplate='kgrid/ko-templates'
  var src=path.join(tmp,template)
  var prop = {'template':'','project':'','object':'','adapters':[]}
  if(object!=null){
		console.log('Your Object Name:'+object)
		dest = object.replace(/[\/:]/g, '-')
  }
  prop.template=template
  prop.project=project
  prop.object=dest
  switch (template){
    case 'jslegacy':
      prop.adapters.push('JS')
      break
    case 'pythonlegacy':
      prop.adapters.push('PYTHON')
      break
    default:
      break
  }
  console.log(JSON.stringify(prop))
  download(gittemplate, tmp, err => {
		if(err!=null){
		    console.log(err)
		 }else {
       fs.ensureDir(project+'/'+srccontainer+'/'+dest, err => {
         if(err!=null){
           console.log(err)
         }else{
				ncp(src, project+'/'+srccontainer+'/'+dest, function(err) {
					if(err!=null){
						console.error(err)
					}else{
						console.log('Successfully initiated your object!')
            fs.writeFileSync(project+'/project.json',JSON.stringify(prop))
						fs.remove(tmp,err=>{ if(err) console.log(err)})
					}
				})
		 }
  })
}
})
}

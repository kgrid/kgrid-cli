#!/usr/bin/env node
var download = require('download-git-repo')
const downloadurl = require('download');
var program = require('commander')
var path=require('path')
const fs=require('fs-extra')
const ncp=require('ncp').ncp
const exists = require('fs').existsSync

program
  .name('kgrid init')
  .description('This will initialize the knowledge object based on the specified template. \n\n  If object-name is omitted, the object will have the same name as project-name.\n\n  Use kgrid list -t to find the available templates. \n\n  Example:\n\n        kgrid init jslegacy myproject 99999-trial')
  .usage('<template-name> <project-name> [object-name]')
 	.parse(process.argv)

var template=program.args[0]
var project = program.args[1]
var object = program.args[2]
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
prop.object=object
switch (template){
  case 'jslegacy':
    prop.adapters.push('JS')
    break;
  default:
    break;
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

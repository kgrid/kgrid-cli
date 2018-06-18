#!/usr/bin/env node
const downloadgit = require('download-git-repo')
const program = require('commander')
const path = require('path')
const inquirer = require('inquirer')
const fs = require('fs-extra')
const ncp = require('ncp').ncp
const exists = require('fs').existsSync
const minimist = require('minimist')
const moment = require('moment')

program
  .name('kgrid create')
  .description('This will initialize the knowledge object based on the specified template. \n\n  If object-name is omitted, the object will have the same name as project-name.\n\n  Use kgrid list -t to find the available templates. \n\n  Example:\n\n        kgrid create\n\n           or\n\n        kgrid create -a jslegacy myproject 99999-trial\n\n')
  .usage('<project-name>')
  .option('-a, --auto', 'An optional mode to enter the set-up information using the template defaults.')
  .option('-f, --fullversion', 'An optional mode to enter the set-up information using prompt.')
  .option('-i, --input', 'An optional mode to enter the set-up information interactively.')
  // .option('-o, --objonly','An option to create the knowledge object ')
 	.parse(process.argv)

var template = 'kotemplate'
var simpleVersion = true
var localtemplatedir = ''
var localtemp = false
var project = 'newproject'
var object = '99999-newko'
var version = 'v0.0.1'
var owners = ''
var contributors = ''
var description = ''
var title = ''
const choices = [
  'jslegacy',
  'pythonlegacy',
  'kotemplate',
  'ldtemplate'
]
var tmp = 'tmp'
var srccontainer = 'src'
var dest = project.replace(/[\/:]/g, '-')
var gittemplate = 'kgrid/ko-templates'
var src = path.join(tmp, template)
var prop = {}

var argv = process.argv.slice(2)
// console.log(argv)
if (program.args.length < 1 && program.auto) {
  program.help()
} else {
  if (program.args[0] != null) {
    project = program.args[0]
  }
  if(program.fullversion){
    simpleVersion =false
  }
  var inx = choices.indexOf(template)
  if (program.auto) {
    if (template != '') {
      if (inx == -1) {
        console.log('Unknown template. The default template will be used.')
        inx = 2
      }
    } else {
      console.log('No template specified. The default template will be used.')
      inx = 2
    }
    template = choices[inx]
  }
  if (!program.auto) {
    inquirer.prompt([
      {
        type: 'confirm',
        name: 'localtemp',
        message: 'Would you like to use a template from your local folder? ',
        default: localtemp,
        when: !simpleVersion
      },
      {
        type: 'rawlist',
        name: 'template',
        message: 'Please select one of the available templates:',
        choices: choices,
        default: 2,
        when: function (answers) {
          return !simpleVersion && !answers.localtemp
        }
      },
      {
        type: 'rawlist',
        name: 'templatetype',
        message: 'Please select one of the template types:',
        choices: choices,
        default: inx,
        when: function (answers) {
          return answers.localtemp && !simpleVersion
        }
      },
      {
        type: 'input',
        name: 'localtemplatedir',
        message: 'Local Template Directory:',
        default: process.cwd(),
        when: function (answers) {
          return answers.localtemp && !simpleVersion
        }
      },
      {
        type: 'input',
        name: 'project',
        message: 'Project Name: ',
        default: project
      },
    ]).then(answers => {
      project = answers.project
      template = choices[2]
      if (!simpleVersion) {
        localtemp = answers.localtemp
        if (localtemp) {
          template = answers.templatetype
          localtemplatedir = answers.localtemplatedir
        } else {
          template = answers.template
        }
        project = answers.project
      }
      checkproject(project)
    })
  } else {
    checkproject(project)
  }
}

function checkproject (proj) {
  dest = project.replace(/[\/:]/g, '-')
  src = path.join(tmp, template)
  if (exists(proj)) {
    console.log('The project name is in use. Continuing will add the new knowledge object to the existing project.')
    inquirer.prompt([{
      type: 'confirm',
      name: 'continue',
      message: 'Would you like to continue? ',
      default: false
    }]).then(answers => {
      if (answers.continue) {
        initproject((localtemplatedir != ''))
      } else {
        console.log('Please change the project name and try again.')
      }
    }, err => {
      console.log(err)
    })
  } else {
    initproject((localtemplatedir != ''))
  }
}

function initproject (local) {
  if (!local) {
    downloadgit(gittemplate, tmp, err => {
		  if (err != null) {
		    console.log(err)
		  } else {
        copytemplate(false)
      }
    })
  } else {
    copytemplate(true)
  }
}

function copytemplate (local) {
  var src_path = ''
  if (local) {
    src_path = localtemplatedir
  } else {
    src_path = src
  }
  var source = src_path
  fs.ensureDir(project, err => {
    if (err != null) {
      console.log(err)
    } else {
      if(!exists(project+'/package.json')){
        ncp(source, project, function (err) {
          if (err != null) {
            console.error(err)
          } else {
            prop = JSON.parse(fs.readFileSync(src_path + '/package.json'))
            prop.objects = []
            prop.template = template
            prop.project = project
            fs.writeFileSync(project + '/package.json', JSON.stringify(prop, null, 4))
            if(exists(project+'/hello-world')) { fs.remove(project+'/hello-world', err => { if (err) console.log(err) }) }
            createobject(local)
          }
        })
      } else {
        prop = JSON.parse(fs.readFileSync(project + '/package.json'))
        createobject(local)
      }
    }
  })
}

function createobject(local){
  var src_path = ''
  if (local) {
    src_path = localtemplatedir
  } else {
    src_path = src
  }
  var adapterentrylist = []
  var source = src_path + '/hello-world/v0.0.1'

  inquirer.prompt([
    {
      type: 'input',
      name: 'object',
      message: 'Object Name: ',
      default: object,
    },
    {
      type: 'input',
      name: 'version',
      message: 'Version: ',
      default: function (a) { return 'v0.0.1' },
      when: !simpleVersion
    },
    {
      type: 'input',
      name: 'title',
      message: 'Title: ',
      default: function (a) { return 'Knowledge Object Title' },
      when: !simpleVersion
    },
    {
      type: 'input',
      name: 'owners',
      message: 'Organization: ',
      default: function (a) { return 'DLHS' },
      when: !simpleVersion
    },
    {
      type: 'input',
      name: 'contributors',
      message: 'Created by: ',
      default: function (a) { return 'KGRID Team' },
      when: !simpleVersion
    },
    {
      type: 'input',
      name: 'description',
      message: 'Brief Description: ',
      default: function (a) { return 'A new knowledge object.' },
      when: !simpleVersion
    }
  ]).then(answers => {
    object = answers.object
    if (!simpleVersion) {
      localtemp = answers.localtemp
      if (localtemp) {
        template = answers.templatetype
        localtemplatedir = answers.localtemplatedir
      } else {
        template = answers.template
      }
      object = answers.object
      version = answers.version
      owners = answers.owners
      title = answers.title
      contributors = answers.contributors
      description = answers.description
    }
  dest = object.replace(/[\/:]/g, '-')
  fs.ensureDir(project + '/' + dest + '/' + version, err => {
    if (err != null) {
      console.log(err)
    } else {
      ncp(source, project + '/' + dest + '/' + version, function (err) {
        if (err != null) {
          console.error(err)
        } else {
          var metadata = JSON.parse(fs.readFileSync(project + '/' + dest + '/' + version + '/metadata.json', 'utf8'))
          if (template == 'kotemplate') {
          // metadata.version = version
            if(!simpleVersion){
              metadata.version = version
              metadata.title = title
              metadata.owners = owners
              metadata.contributors = contributors
              metadata.description = description
            }
            // metadata.arkId.fedoraPath = dest
            metadata.createdOn = moment().valueOf()
            metadata.lastModified = moment().valueOf()
            metadata.arkId = 'ark:/' + dest.replace('-', '\/')
          } else {
            metadata['@graph'][0].version = version
            metadata['@graph'][0].title = title
            metadata['@graph'][0].owners = owners
            metadata['@graph'][0].contributors = contributors
            metadata['@graph'][0].description = description
            metadata['@graph'][0].fedoraPath = dest
            metadata['@graph'][0].created = moment().valueOf()
            metadata['@graph'][0].lastModified = moment().valueOf()
            metadata['@graph'][0].arkId = 'ark:/' + dest.replace('-', '\/')
          }
          fs.writeFileSync(project + '/' + dest + '/' + version + '/metadata.json', JSON.stringify(metadata, null, 2))
          if(!exists(project + '/package.json')){
            prop = JSON.parse(fs.readFileSync(src_path + '/package.json'))
            prop.objects = []
          } else {
            // console.log("Reading existing package.json ...")
            prop = JSON.parse(fs.readFileSync(project + '/package.json'))
          }
          // console.log(JSON.stringify(prop))
          prop.template = template
          prop.project = project
          prop.objects.push({'id': dest, 'version': version})
          var content = JSON.parse(fs.readFileSync(project + '/' + dest + '/' + version + '/'+metadata.model+'/metadata.json', 'utf8'))
          content.adapters.forEach(function(e){
            var entry = e.name + '-' + e.version + '-' + e.filename
            if (prop.runtimedependencies.map(function(el){
              return el.name + '-' + el.version + '-' + el.filename
            }).indexOf(entry) == -1) {
              prop.runtimedependencies.push(e)
            }
          })
          fs.writeFileSync(project + '/package.json', JSON.stringify(prop, null, 4))
          console.log('Knowledge Object ' + object + ' has been successfully created in Project ' + project + '.\n ')
          console.log('Go to the project folder by `cd ' + project + '`')
          console.log('Install dev dependencies by `npm install`')
          if (!local) fs.remove(tmp, err => { if (err) console.log(err) })
        }
      })
    }
  })
})
}

#!/usr/bin/env node
const program = require('commander')
const path = require('path')
const pathsep =path.sep
const fs = require('fs-extra')
const exists = require('fs').existsSync
const jsonpath = require('jsonpath')
const klawSync = require('klaw-sync')
const BASE_URL = process.env.KGRID_BASE_URL ||'http://localhost'
var adapters = []
var activator = {'name': '', 'version': '', 'filename': '', 'download_url': ''}
var shelf = {'name': '', 'version': '', 'filename': '', 'download_url': ''}
var manifestjson = {}
program
  .name('kgrid setup')
  .option('--dev', 'Run in development mode')
  .option('--prod', 'Run in production mode')
  .parse(process.argv)

var srcpath = process.cwd()
var prop = {}
var metadatapaths = []
var kolist = []
var kopaths = []
var runtime = ''
var ready = false

if (!program.prod) {
  runtime = 'activator/'
} else {
  runtime = './'
}
manifestjson.objects = []
if (exists('project.json')) {
  prop = JSON.parse(fs.readFileSync('project.json', 'utf8'))
  kolist = prop.objects
  kodeplist = prop.kodependencies
  if (kolist.length > 0) {
    kolist.forEach(function (e) {
      manifestjson.objects.push(e)
      kopaths.push(srcpath + pathsep + e.id + pathsep + e.version)
      console.log('Found Knowledge Object: ' + e.id + '-' + e.version)
    })
    ready = true
  } else {
    console.log('No Knowledge Object is specified in project.json. ')
  }
  if (kodeplist) {
    if (kodeplist.length > 0) {
      kodeplist.forEach(function (e) {
        manifestjson.objects.push(e)
        kopaths.push(srcpath + pathsep + e.id + pathsep + e.version)
        console.log('Found Dependency Knowledge Object: ' + e.id + '-' + e.version)
      })
    } else {
      console.log('No Dependency Knowledge Object is specified in project.json. ')
    }
  }
} else {
  if (exists(srcpath + '/shelf')) {
    var klawshelf = klawSync(srcpath + '/shelf')
    var koonshelf = klawshelf.map(function (e) { return e.path }).filter(function (e) {
      var b = false
      var p = e.replace(srcpath, '').split(path.sep)
      if (p.length == 4) {
        b = true
      }

      return b
    })
    kolist = []
    kopaths = []
    koonshelf.forEach(function (e) {
      var p = e.replace(srcpath, '').split(path.sep)
      var obj = {}
      obj.id = p[2]
      obj.version = p[3]
      manifestjson.objects.push(obj)
      kolist.push(obj)
      kopaths.push(e)
    })
    if (kolist.length > 0) {
      ready = true
    }
  } else {
    console.log('No Knowledge Grid shelf found here. ')
  }
}

if (ready) {
  var klawedpaths = klawSync(srcpath)
  var rawpaths = klawedpaths.filter(function (e) {
    var b = false
    kopaths.forEach(function (koe) {
      b = b | (e.path.includes(koe))
    })
    return b
  })
  rawpaths.forEach(function (e) {
    if ((e.path.toLowerCase().includes('metadata'))) {
      metadatapaths.push(e)
    }
  })

  var adapterentrylist = []
  metadatapaths.forEach(function (e) {
    var content = JSON.parse(fs.readFileSync(e.path, 'utf8'))
    var adapterlist = jsonpath.query(content, '$..adapters')
    adapterlist.forEach(function (e) {
      e.forEach(function (el) {
        var entry = el.name + '-' + el.version + '-' + el.filename
        adapterentrylist = adapters.map(function (e) { return e.name + '-' + e.version + '-' + e.filename })
        if (adapterentrylist.indexOf(entry) == -1) {
          adapters.push(el)
        }
      })
    })
    var activatorlist = jsonpath.query(content, '$..activator')
    if (activatorlist.length > 0) {
      activator = activatorlist[0]
    }
    var shelflist = jsonpath.query(content, '$..shelf')
    if (shelflist.length > 0) {
      shelf = shelflist[0]
    }
  })
  adapters.forEach(function (e) {
    console.log('Found adapter type: ' + e.name + '-' + e.version)
  })

  manifestjson.adapters = adapters
  manifestjson.activator = activator
  manifestjson.shelf = shelf
  console.log('Generating manifest.json ...')
  fs.ensureDir(runtime, err => {
    if (err != null) {
      console.log(err)
    } else {
      fs.writeFileSync(runtime + 'manifest.json', JSON.stringify(manifestjson))
    }
  })
}

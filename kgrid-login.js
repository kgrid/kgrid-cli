#!/usr/bin/env node
var request = require('superagent')
var co = require('co')
var prompt = require('co-prompt')
var program = require('commander')

program
  .name('kgrid login')
  .description('This will log into https://kgrid.med.umich.edu/library2')
  .usage('')
  .parse(process.argv)

  co(function *() {
      var username = yield prompt('username: ')
      var password = yield prompt.password('password: ')
      request
       .post('http://kgrid.med.umich.edu/library2/login?username='+username+'&password='+password)
       .end(function (err, res) {
         var link = JSON.stringify(res.body)
         console.log('Response: %s', link)
       })
    })

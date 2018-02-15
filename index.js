#!/usr/bin/env node
var request = require('superagent')
var co = require('co')
var prompt = require('co-prompt')
var program = require('commander')
var exec = require('child_process').exec
var spawn = require('child_process').spawn
var child=null

program
  .command('run ["username"]')
  .option('-u, --username <username>', 'The user to authenticate as')
  .action(function(file) {
      var delay = 500
      request
        .get('http://localhost:8082/health')
        .end(function(err,res){
            if(res==null){
              console.log('Starting Activator...')
              delay=3000
              child=exec('java -jar activator/activator-0.5.8-SNAPSHOT.war --server.port=8082 --activator.home=activator',
                    function (error, stdout, stderr){
                        console.log('Output -> ' + stdout);
                        if(error !== null){
                          console.log("Error -> "+error);
                        }
                      })
                     
            }else {
							console.log('There is one activator running on Port 8082.')
							console.log('Your knowledge object operation will be directed to this instance.')
            }
            setTimeout(function(){
                console.log('Activator is ready and can be accessed at http://localhost:8082.')
                co(function *() {
                    var username = yield prompt('Please enter your name: ')
                    var outcome='Hello, '+username
                    request
                      .post('http://localhost:8082/knowledgeObject/ark:/hello/world/result')
                      .set('Content-Type','application/json')
                      .send({'name':username})
                      .end(function (err, res) {
                          if(res!=null) {
                            var link = JSON.parse(res.text).result
                            console.log('Response: %s', link)
                            if(link==outcome){
                              console.log('Test Passed!')
                            }else {
                              console.log('Test Failed!')
                            }
                          }
                          if(err!=null) {
                            var link = err
                            console.log('Response: %s', link)
                            console.log('Test Failed!')
                          }

 //                         if(child!=null) {
 //                           console.log('Shutting down the activator')
 //                            child.kill()
 //                         }
                          process.stdin.pause()
                      })
                  })
                  },delay)
    })
  })

program
  .command('login ["username","password"]')
  .option('-u, --username <username>', 'The user to authenticate as')
  .option('-p, --password <password>', 'The users password')
  .action(function(file) {
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
 })

 program.parse(process.argv)
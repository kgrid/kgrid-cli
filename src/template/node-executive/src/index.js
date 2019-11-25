const welcome = require("@kgrid/99999-helloworld")

function process(inputs){
  var names = inputs.names;
  var results = {}
  names.forEach(function(e){
    var obj = {}
    obj.name = e
    var result = welcome(obj)
    results[e]=result
  })
  return results;
}

module.exports = process
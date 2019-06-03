function process(inputs){
  var names = inputs.names;
  var executor = context.getExecutor("99999-helloworld/implA/welcome")
  var results = {}
  names.forEach(function(e){
    var obj = {}
    obj.name = e
    var result = executor.execute(obj)
    results[e]=result
  })
  return results;
}

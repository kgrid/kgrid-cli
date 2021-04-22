function process(inputs){
  var executor = context.getExecutor("js/simple/1.0/welcome");
  if (executor != null) {
     inputs = JSON.stringify(inputs)
     return executor.execute(inputs, "application/json");
  } else {
     throw new Error("Cannot find simple js hello world ko.")
  }

}

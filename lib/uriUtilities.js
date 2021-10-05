const URI = require('uri-js');

function createUri(path, base){
  let uri;
  if (base){
    base = addScheme(base);
    base = makePathADirectory(base);
    let fullPath = URI.resolve(base, path);
    uri = URI.parse(fullPath)
  } else {
    uri = URI.parse(path)
  }

  return uri
}

function addScheme(path){
  if(!URI.parse(path).scheme){
    return `file://${path}`
  }
}

function makePathADirectory(base) {
  if (base[base.length - 1] !== '/') {
    base = base.concat('/')
  }
  return base;
}

module.exports = {
  createUri: createUri
}

const URI = require('uri-js');

function createUri(path, base){
  let uri;
  if (base){
    base = makePathADirectory(base);
    base = addScheme(base);
    let fullPath = URI.resolve(base, path);
    uri = URI.parse(fullPath);
  } else {
    uri = URI.parse(path);
  }
  return uri;
}

function addScheme(base){
  if(!URI.parse(base).scheme){
    return `file://${base}`;
  }
}

function makePathADirectory(base) {
  let path = URI.parse(base).path
  if (path[path.length - 1] !== '/') {
    path = path.concat('/');
  }
  return path;
}

module.exports = {
  createUri: createUri
}

const URI = require("uri-js");

function readManifest(manifestJson, manifestUri) {
  let koUris = []
  if (manifestJson.manifest) {
    manifestJson = manifestJson.manifest
  }
  if (process.env.DEBUG) {
    console.log(`From ${manifestUri}:\n `)
    console.log(manifestJson)
  }
  manifestJson
    .map(ko => {
      koUris.push(
        ko['@id']
          ? URI.resolve(manifestUri, ko['@id'])
          : URI.resolve(manifestUri, ko))
    })
  return koUris
}

function createManifest(koUris){
  let manifestJson = []
  koUris.map(uri =>{
    manifestJson.push(
      {
        "@id": uri,
        "@type": "koio:KnowledgeObject"
      }
    )
  })
  return manifestJson;
}

module.exports = {
  readManifest: readManifest,
  createManifest: createManifest
}

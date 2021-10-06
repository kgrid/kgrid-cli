const URI = require("uri-js");
const {uriToString, createUri} = require("./uriUtilities")

function readManifest(manifestJson, manifestUri) {
  console.log(`Reading Manifest from ${uriToString(manifestUri)}\n`)
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
          ? createUri(URI.resolve(uriToString(manifestUri), ko['@id']))
          : createUri(URI.resolve(uriToString(manifestUri), ko)))
    })
  return koUris
}

function createManifest(koUris) {
  let manifestJson = []
  koUris.map(uri => {
    manifestJson.push(
      {
        "@id": uriToString(uri),
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

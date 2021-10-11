const URI = require("uri-js");
const {uriToString, createUri} = require("./uriUtilities")
const axios = require("axios");
const fs = require("fs-extra");

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

function readManifestJson(manifestJson, manifestUri) {
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

function readManifestFromUri(uri) {
  return new Promise((resolve, reject) => {
    if (uri.scheme.startsWith('http')) {
      axios.get(uriToString(uri))
        .then((response) => {
          resolve(readManifestJson(response.data, uri));
        })
        .catch(() => {
          reject(uri);
        });
    } else {
      try {
        resolve(readLocalManifest(uri))
      } catch (error) {
        reject(error.message)
      }
    }
  })
}

function readLocalManifest(uri) {
  let kos = []
  let manifestJson = fs.readJsonSync(uri.path)
  readManifestJson(manifestJson, uri)
    .map(koUri => {
      kos.push(koUri);
    })
  return kos
}

module.exports = {
  readManifestJson: readManifestJson,
  readManifestFromUri: readManifestFromUri,
  createManifest: createManifest
}

const {expect, test} = require('@oclif/test');
const td = require('testdouble');
const url = require('url');
const path = require('path');
const fs = require("fs-extra");

describe('download', () => {
  const destination = 'destination';
  const relativeFilePath = '/some/file/path/file.zip'
  const absoluteFilePath = 'file:///some/file/path/file.zip'
  const remoteFilePath = 'http://website.com/files/file.zip'
  const localManifestPath = '/some/manifest/path/manifest.json'
  const remoteManifestPath = '/some/manifest/path/manifest.json'
  const manifestJsonLocalFile = [{
    "@id": absoluteFilePath,
    "@type": "koio:KnowledgeObject"
  }]
  const manifestJsonRemoteFile = [{
    "@id": remoteFilePath,
    "@type": "koio:KnowledgeObject"
  }]
  let downloadOptions = {
    extract: false,
    headers: {accept: ['application/zip', 'application/octet-stream']}
  };
  const fs = td.replace('fs-extra');
  const download = td.replace('download');
  const admzip = td.replace('adm-zip');
  const del = td.replace('del');

  td.when(fs.existsSync(relativeFilePath)).thenResolve(() => {
  })
  td.when(fs.existsSync(localManifestPath)).thenResolve(() => {
  })
  td.when(fs.writeJsonSync(manifestJsonLocalFile)).thenResolve(() => {
  })
  td.when(fs.copySync(relativeFilePath, path.join(destination, path.basename(relativeFilePath)))).thenResolve(() => {
  })
  td.when(download(remoteFilePath, path.join(process.cwd()), downloadOptions)).thenResolve(null);
  td.when(fs.readJsonSync(localManifestPath)).thenResolve(() => {
    return manifestJsonLocalFile
  })
  td.when(fs.readJsonSync(remoteManifestPath)).thenResolve(() => {
    return manifestJsonRemoteFile
  })

  test
    .command([`download`, `-d`, `${destination}`, `-f`, `${relativeFilePath}`])
    .it('should create the destination directory if not already there', (context) => {
      td.verify(fs.ensureDirSync(destination))
    });

  test
    .command([`download`, `-f`, `${relativeFilePath}`])
    .it('should use the current directory if destination not set', (context) => {
      td.verify(fs.ensureDirSync(process.cwd()))
    });

  test
    .command([`download`, `-d`, `${destination}`, `-f`, `${relativeFilePath}`])
    .it('should write the final manifest in the destination', (context) => {
      td.verify(fs.writeJsonSync(path.join(destination, 'manifest.json'), manifestJsonLocalFile, {spaces: 4}))
    });

  test
    .command([`download`, `-f`, `${relativeFilePath}`])
    .it('should write the relative file into the final manifest', (context) => {
      td.verify(fs.writeJsonSync(path.join(process.cwd(), 'manifest.json'), manifestJsonLocalFile, {spaces: 4}))
    });

  test
    .command([`download`, `-f`, `${relativeFilePath}`])
    .it('should copy the relative file', (context) => {
      td.verify(fs.copySync(relativeFilePath, path.join(process.cwd(), path.basename(relativeFilePath))))
    });

  test
    .command([`download`, `-d`, `${destination}`, `-f`, `${relativeFilePath}`])
    .it('should download the relative file to the destination', (context) => {
      td.verify(fs.copySync(relativeFilePath, path.join(destination, path.basename(relativeFilePath))))
    });

  test
    .command([`download`, `-f`, `${absoluteFilePath}`])
    .it('should write the absolute file into the final manifest', (context) => {
      td.verify(fs.writeJsonSync(path.join(process.cwd(), 'manifest.json'), manifestJsonLocalFile, {spaces: 4}))
    });

  test
    .command([`download`, `-f`, `${absoluteFilePath}`])
    .it('should copy the absolute file', (context) => {
      td.verify(fs.copySync(relativeFilePath, path.join(process.cwd(), path.basename(relativeFilePath))))
    });

  test
    .command([`download`, `-f`, `${remoteFilePath}`])
    .it('should download the remote file', (context) => {
      td.verify(download(
        remoteFilePath,
        path.join(process.cwd()),
        downloadOptions))
    });

  test
    .command([`download`, `-f`, `${remoteFilePath}`])
    .it('should write the remote file into the final manifest', (context) => {
      td.verify(fs.writeJsonSync(path.join(process.cwd(), 'manifest.json'), manifestJsonRemoteFile, {spaces: 4}))
    });

  test
    .command([`download`, `-m`, `${localManifestPath}`])
    .it('should read the local manifest json', (context) => {
      td.verify(fs.readJsonSync(localManifestPath))
    });

  test
    .command([`download`, `-m`, `${localManifestPath}`])
    .it('should copy the local file in the manifest', (context) => {
      td.verify(fs.copySync(relativeFilePath, path.join(process.cwd(), path.basename(relativeFilePath))))
    });

  test
    .command([`download`, `-m`, `${remoteManifestPath}`])
    .it('should read the remote manifest json', (context) => {
      td.verify(fs.readJsonSync(remoteManifestPath))
    });

  test
    .command([`download`, `-m`, `${remoteManifestPath}`])
    .it('should download the remote file from the manifest', (context) => {
      td.verify(download(
        remoteFilePath,
        path.join(process.cwd()),
        downloadOptions))
    });

  test
    .command([`download`, `-m`, `${remoteManifestPath}`])
    .it('should write the remote file from the original manifest into the final manifest', (context) => {
      td.verify(fs.writeJsonSync(path.join(process.cwd(), 'manifest.json'), manifestJsonRemoteFile, {spaces: 4}))
    });

  test
    .command([`download`, `-m`, `${localManifestPath}`])
    .it('should write the local file from the original manifest into the final manifest', (context) => {
      td.verify(fs.writeJsonSync(path.join(process.cwd(), 'manifest.json'), manifestJsonLocalFile, {spaces: 4}))
    });
});


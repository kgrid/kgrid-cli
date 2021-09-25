const {expect, test} = require('@oclif/test')
const td = require('testdouble')
const url = require('url');
const path = require('path')
const fs = require("fs-extra");

describe('download', () => {
  describe('with a single relative file', () => {
    const destination = 'destination';
    const filePath = '/some/file/path/file.zip'
    const filePathWithSchema = 'file:///some/file/path/file.zip'
    const manifestJson = [{
      "@id": "file:///some/file/path/file.zip",
      "@type": "koio:KnowledgeObject"
    }]
    const fs = td.replace('fs-extra');
    const download = td.replace('download');
    const admzip = td.replace('adm-zip');
    const del = td.replace('del');
    td.when(fs.existsSync(filePath)).thenResolve(() => {
    })
    td.when(fs.writeJsonSync(td.matchers.anything())).thenResolve(() => {
    })
    td.when(fs.copySync(filePath, path.join(destination, path.basename(filePath)))).thenResolve(() => {
    })

    test
      .stdout()
      .command([`download`, `-d`, `${destination}`, `-f`, `${filePath}`])
      .it('should create the destination directory if not already there', (context) => {
        td.verify(fs.ensureDirSync(destination))
      });
    test
      .stdout()
      .command([`download`, `-d`, `${destination}`, `-f`, `${filePath}`])
      .it('should write the final manifest', (context) => {
        td.verify(fs.writeJsonSync(path.join(destination, 'manifest.json'), manifestJson, {spaces: 4}))
      });
    test
      .stdout()
      .command([`download`, `-d`, `${destination}`, `-f`, `${filePath}`])
      .it('should download the file', (context) => {
        td.verify(fs.copySync(filePath, path.join(destination, path.basename(filePath))))
      });
  });
});

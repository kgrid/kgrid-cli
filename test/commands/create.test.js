const {expect, test} = require('@oclif/test');
const path = require('path');
const fs = require('fs');
const shell = require('shelljs');
const tmp = require('tmp');

var tmpobj = tmp.dirSync();

shell.cd(tmpobj.name);

describe('test create ', () => {
  test
  .stdout()
  .command(['create' ])
  .it('runs create with no ko name', output => {
    expect(output.stdout).to.include('Please provide a name for your knowledge object')
  })

  test
  .stdout()
  .command(['create', 'test-ko', '-v', 'koversion'])
  .it('runs create with test-ko name', output => {

    expect(output.stdout).to.include('Done');

    expect( fs.existsSync( path.join(
      tmpobj.name, "test-ko", "metadata.json") )).to.be.true

    expect( fs.existsSync( path.join(
      tmpobj.name, "test-ko", "koversion", "metadata.json")), "find metadata.json file").to.be.true;

    expect( fs.existsSync( path.join(
      tmpobj.name, "test-ko", "koversion", "package.json")), "find package.json file").to.be.true;

    expect( fs.existsSync( path.join(
      tmpobj.name, "test-ko", "koversion", "service.yaml")), "find service.yaml file").to.be.true;

    expect( fs.existsSync( path.join(
      tmpobj.name, "test-ko", "koversion", "src",  "index.js")), "find index.js file").to.be.true;

    expect( fs.existsSync( path.join(
      tmpobj.name, "test-ko", "koversion", "test",  "welcome.test.js")), "find welcome.test.js file").to.be.true;


  })

})


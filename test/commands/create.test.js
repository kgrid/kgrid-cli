const {expect, test} = require('@oclif/test');
const path = require('path');
const fs = require('fs-extra');
const shell = require('shelljs');
const tmp = require('tmp');

const testDirectory = tmp.dirSync();

//Get back to temp test directory before each test
beforeEach(function () {
  shell.cd(testDirectory.name);
});

describe('test happy day create ', () => {

  test
  .stdout()
  .command(['create', 'testko', '-i', 'koversion'])
  .it('runs create with testko name and koversion implementation', output => {

    expect(output.stdout).to.include('ready');

    expect(fs.existsSync(path.join(
      testDirectory.name, "testko", "metadata.json"))).to.be.true;

    expect(fs.existsSync(path.join(
      testDirectory.name, "testko", "koversion", "metadata.json")),
      "find metadata.json file").to.be.true;

    expect(fs.existsSync(path.join(
      testDirectory.name, "testko", "koversion", "package.json")),
      "find package.json file").to.be.true;

    expect(fs.existsSync(path.join(
      testDirectory.name, "testko", "koversion", "service.yaml")),
      "find service.yaml file").to.be.true;

    expect(fs.existsSync(path.join(
      testDirectory.name, "testko", "koversion", "src", "index.js")),
      "find index.js file").to.be.true;

    expect(fs.existsSync(path.join(
      testDirectory.name, "testko", "koversion", "test", "welcome.test.js")),
      "find welcome.test.js file").to.be.true;

  });

});

describe('test not happy day create ', () => {

  test
  .stdout()
  .command(['create'])
  .it('runs create with no ko name', output => {
    expect(output.stdout).to.include(
      'Please provide a name for your knowledge object')
  });

  test
  .stdout()
  .command(['create', 'testko', '-i', 'koversion'])
  .it('runs create with existing ko name and implementation', output => {

    expect(output.stdout).to.include(
      'exist');

  });

  test
  .stdout()
  .command(['create', 'testko', '-i', 'anotherversion'])
  .it('runs create with existing ko name and new implementation', output => {

    expect(output.stdout).to.include(
      'exist');

  });

});

after(function () {
 testDirectory.removeCallback();
});

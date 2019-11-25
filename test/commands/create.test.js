const {expect, test} = require('@oclif/test');
const path = require('path');
const fs = require('fs-extra');
const shell = require('shelljs');
const tmp = require('tmp');
const inquirer = require('inquirer')

const testDirectory = tmp.dirSync();

//Get back to temp test directory before each test
beforeEach(function () {
  shell.cd(testDirectory.name);
});

describe('test happy day create ', () => {

  let backup;
  before(() => {
    backup = inquirer.prompt;
    inquirer.prompt = (questions) => Promise.resolve(0)
  })

  test
  .stdout()
  .command(['create', 'testko'])
  .it('runs create with testko name', output => {

    expect(output.stdout).to.include('created');

    expect(fs.existsSync(path.join(
      testDirectory.name, "testko", "metadata.json"))).to.be.true;

    expect(fs.existsSync(path.join(
      testDirectory.name, "testko", "package.json")),
      "find package.json file").to.be.true;

    expect(fs.existsSync(path.join(
      testDirectory.name, "testko", "service.yaml")),
      "find service.yaml file").to.be.true;

    expect(fs.existsSync(path.join(
      testDirectory.name, "testko", "src")),
      "find src folder").to.be.true;


    expect(fs.existsSync(path.join(
      testDirectory.name, "testko", "test")),
      "find test folder").to.be.true;

  });
  after(() => {
    inquirer.prompt = backup
  })

});

describe('test not happy day create ', () => {

  test
  .stdout()
  .command(['create'])
  .it('runs create with no ko name', output => {
    expect(output.stdout).to.include(
      'Please provide')
  });

});

after(function () {
 testDirectory.removeCallback();
});

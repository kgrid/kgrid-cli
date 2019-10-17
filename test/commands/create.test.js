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

// describe('test happy day create ', () => {
//
//   test
//   .stdout()
//   .command(['create', 'testko'])
//   .it('runs create with testko name', output => {
//
//     expect(output.stdout).to.include('ready');
//
//     expect(fs.existsSync(path.join(
//       testDirectory.name, "testko", "metadata.json"))).to.be.true;
//
//     expect(fs.existsSync(path.join(
//       testDirectory.name, "testko", "package.json")),
//       "find package.json file").to.be.true;
//
//     expect(fs.existsSync(path.join(
//       testDirectory.name, "testko", "service.yaml")),
//       "find service.yaml file").to.be.true;
//
//     expect(fs.existsSync(path.join(
//       testDirectory.name, "testko", "src", "index.js")),
//       "find index.js file").to.be.true;
//
//     expect(fs.existsSync(path.join(
//       testDirectory.name, "testko", "test", "welcome.test.js")),
//       "find welcome.test.js file").to.be.true;
//
//   });
//
// });

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

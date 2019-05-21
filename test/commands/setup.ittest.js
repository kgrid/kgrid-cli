const {expect, test} = require('@oclif/test');
const path = require('path');
const shell = require('shelljs');
const tmp = require('tmp');

const testDirectory = tmp.dirSync();
console.log(testDirectory.name)

describe('test setup command local', () => {

  beforeEach(function () {
    shell.cd(testDirectory.name);
  });

  test
  .stdout()
  .command('setup')
  .timeout( 20000 )
  .it('run setup local', ctx => {
    expect(shell.ls(path.join(testDirectory.name,'.kgrid')).grep('^kgrid-activator').length,'should find activator').to.be.greaterThan(1);
    expect(shell.ls(path.join(testDirectory.name,'.kgrid')).grep('^kgrid-library').length,'should find library').to.be.greaterThan(1);
    expect(shell.ls(path.join(testDirectory.name,'.kgrid')).grep('manifest').length,'should find manifest').to.be.greaterThan(1);
  });
  afterEach(function () {
   testDirectory.removeCallback();
  });

});


describe('test setup command global', () => {

  test
  .stdout()
  .command(['setup','-g'])
  .timeout( 10000 )
  .it('run setup global without KGRID_HOME', ctx => {
    // expect(shell.ls(path.join(process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE,'.kgrid')).grep('^kgrid-activator').length,'should find activator').to.be.greaterThan(1);
    // expect(shell.ls(path.join(process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE,'.kgrid')).grep('^kgrid-library').length,'should find library').to.be.greaterThan(1);
    expect(shell.ls(path.join(process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE,'.kgrid')).grep('manifest').length,'should find manifest').to.be.greaterThan(1);
  });

  process.env.KGRID_HOME=testDirectory.name;

  test
  .stdout()
  .command(['setup','-g'])
  .timeout( 10000 )
  .it('run setup global with KGRID_HOME', ctx => {
    // expect(shell.ls(path.join(testDirectory.name)).grep('^kgrid-activator').length,'should find activator').to.be.greaterThan(1);
    // expect(shell.ls(path.join(testDirectory.name)).grep('^kgrid-library').length,'should find library').to.be.greaterThan(1);
    expect(shell.ls(path.join(testDirectory.name)).grep('manifest').length,'should find manifest').to.be.greaterThan(1);
  });

  after(function () {
    testDirectory.removeCallback();
  });
});

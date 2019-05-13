const {expect, test} = require('@oclif/test');
const fs = require('fs-extra');
const shell = require('shelljs');

const tempDirectory = shell.tempdir();

describe('test setup command', () => {

  before(function () {
    process.env.KGRID_HOME=tempDirectory.toString();
  });

  test
  .stdout()
  .command('setup')
  .timeout( 10000 )
  .it('run setup with KGRID_HOME', ctx => {
    expect(shell.ls(tempDirectory).grep('^kgrid-activator')).to.exist;
    expect(shell.ls(tempDirectory).grep('^kgrid-library')).to.exist;
    expect(shell.ls(tempDirectory).grep('shelf')).to.exist;
    expect(shell.ls(tempDirectory).grep('manifest')).to.exist;
  });

  test
  .stdout()
  .timeout( 1000 )
  .command(['setup', '--home', tempDirectory.toString()])
  .it('run setup with flag', ctx => {
    expect(shell.ls(tempDirectory).grep('^kgrid-activator')).to.exist;
    expect(shell.ls(tempDirectory).grep('^kgrid-library')).to.exist;
    expect(shell.ls(tempDirectory).grep('shelf')).to.exist;
    expect(shell.ls(tempDirectory).grep('manifest')).to.exist;
  });

  after(function () {
    fs.remove(tempDirectory.toString());
  });
});






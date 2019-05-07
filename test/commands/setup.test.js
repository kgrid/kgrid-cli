const {expect, test} = require('@oclif/test');
const path = require('path');

describe('test setup sets environment variable ', () => {
  test.stdout().command(['setup'])
  .it('runs setup', ctx => {

    expect(process.env.KGRID_HOME).equal(path.join(process.env.HOME, '.kgrid'));

  })

})

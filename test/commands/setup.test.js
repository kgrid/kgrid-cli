const {expect, test} = require('@oclif/test')

describe('test setup sets environment variable ', () => {
  test
  .stdout()
  .command(['setup'])
  .it('runs setup', ctx => {
    expect(process.env.KGRID_HOME).include('/.kgrid')
  })

})

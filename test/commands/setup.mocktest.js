const {expect, test} = require('@oclif/test');
const path = require('path');
// const shell = require('shelljs');
const tmp = require('tmp');
const nock = require('nock')

describe('download activator', () => {
  test
  .nock('https://github.com/', api => api
    .get('/kgrid/kgrid-activator/releases/download/1.0.9/kgrid-activator-1.0.9.jar')
    // user is logged in, return their name
    .reply(302, {tag_name: '1.0.9'})
  )
  .stdout()
  .command(['setup'])
  .it('download activator', ctx => {
    expect(ctx.stdout).to.include('Download')
  })

  // test
  // .nock('https://api.heroku.com', api => api
  //   .get('/account')
  //   // HTTP 401 means the user is not logged in with valid credentials
  //   .reply(401)
  // )
  // .command(['auth:whoami'])
  // // checks to ensure the command exits with status 100
  // .exit(100)
  // .it('exits with status 100 when not logged in')
})

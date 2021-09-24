const {expect, test} = require('@oclif/test')

describe('list', ()=>{
  process.chdir('./test/shelf')
  test
    .stdout()
    .command(['list'])
    .it('should list deprecated flat-structured KOs',(context)=>{
      expect(context.stdout).to.include('ark:/js/flat/v1.0')
    });

  test
    .stdout()
    .command(['list'])
    .it('should list nested-structured KOs',(context)=>{
      expect(context.stdout).to.include('ark:/js/nested/v1.0')
    });

});

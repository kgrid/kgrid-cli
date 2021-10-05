const {expect} = require('chai');
const URI = require('uri-js');

const {createUri} = require('../../../lib/uriUtilities')

describe('uri Utilities', ()=>{
  describe('create Uri', ()=>{
    it('should create an absolute uri from an absolute local uri', ()=>{
      let inputUri = `file://${process.cwd()}/file.zip`;
      let expectedUri = URI.parse(inputUri);
      let output = createUri(inputUri);
      expect(output).to.deep.equal(expectedUri)
    })

    it('should create an absolute uri from an absolute remote uri', ()=>{
      let inputUri = `http://example.gov/directory/file.zip`;
      let expectedUri = URI.parse(inputUri);
      let output = createUri(inputUri);
      expect(output).to.deep.equal(expectedUri)
    })

    it('should create an absolute uri from an relative local path and base in unix', ()=>{
      let scheme = 'file'
      let base = process.cwd()
      let path = `file.zip`;
      let expectedUri = URI.parse(`${scheme}://${base}/${path}`);
      let uri = createUri(path, base);
      expect(uri).to.deep.equal(expectedUri)
    })
  })
});

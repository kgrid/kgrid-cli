const {readManifest, createManifest} = require('../../../lib/manifestUtilities');
const {expect} = require('chai');
describe('manifest utilities', () => {

  describe('readManifest', () => {
    describe('with json Ld Manifest', () => {
      it('should return a list of resolved ko Uris', () => {
        const manifestUri = 'http://somewhere.org/directory/manifest.json'
        const jsonLdManifest = [
          {
            "@id": "someKo.zip"
          },
          {
            "@id": "http://somewhere-else.gov/other-place/absoluteKo.zip"
          },
        ];
        let output = readManifest(jsonLdManifest, manifestUri);
        expect(2).to.be.equal(output.length)
        expect('http://somewhere.org/directory/someKo.zip').to.be.equal(output[0])
        expect('http://somewhere-else.gov/other-place/absoluteKo.zip').to.be.equal(output[1])
      })
    })

    describe('with legacy json Manifest', () => {
      it('should return a list of resolved ko Uris', () => {
        const manifestUri = 'http://somewhere.org/directory/manifest.json'
        const jsonLdManifest = {
          "manifest": [
            "someKo.zip",
            "someOtherKo.zip"
          ]
        };
        let output = readManifest(jsonLdManifest, manifestUri);
        expect(2).to.be.equal(output.length)
        expect('http://somewhere.org/directory/someKo.zip').to.be.equal(output[0])
        expect('http://somewhere.org/directory/someOtherKo.zip').to.be.equal(output[1])
      })
    })
  })

  describe('writeManifest', () => {
    it('should write a jsonLd Manifest', () => {
      const uris = [
        'http://somewhere.org/directory/ko1.zip',
        'http://somewhere.org/directory/ko2.zip',
        'http://somewhere.org/directory/ko3.zip'
      ]
      let output = createManifest(uris);
      expect(3).to.be.equal(output.length)
      output.map((node) => {
        expect(uris).to.include(node['@id'])
        expect('koio:KnowledgeObject').to.be.equal(node['@type'])
      })
    })
  })
})

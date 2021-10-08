const {readManifestJson, createManifest} = require('../../../lib/manifestUtilities');
const {expect} = require('chai');
const {uriToString, createUri} = require("../../../lib/uriUtilities");
describe('manifest utilities', () => {

  describe('readManifestJson', () => {
    describe('with json Ld Manifest', () => {
      it('should return a list of resolved ko Uris', () => {
        const manifestUri = createUri('http://somewhere.org/directory/manifest.json')
        const jsonLdManifest = [
          {
            "@id": "someKo.zip"
          },
          {
            "@id": "http://somewhere-else.gov/other-place/absoluteKo.zip"
          },
        ];
        let output = readManifestJson(jsonLdManifest, manifestUri);
        expect(2).to.be.equal(output.length)
        expect(uriToString(output[0])).to.be.equal('http://somewhere.org/directory/someKo.zip')
        expect(uriToString(output[1])).to.be.equal('http://somewhere-else.gov/other-place/absoluteKo.zip')
      })
    })

    describe('with legacy json Manifest', () => {
      it('should return a list of resolved ko Uris', () => {
        const manifestUri = createUri('http://somewhere.org/directory/manifest.json')
        const legacyManifest = {
          "manifest": [
            "someKo.zip",
            "someOtherKo.zip"
          ]
        };
        let output = readManifestJson(legacyManifest, manifestUri);
        expect(2).to.be.equal(output.length)
        expect(uriToString(output[0])).to.be.equal('http://somewhere.org/directory/someKo.zip')
        expect(uriToString(output[1])).to.be.equal('http://somewhere.org/directory/someOtherKo.zip')
      })
    })
  })

  describe('writeManifest', () => {
    it('should write a jsonLd Manifest', () => {
      const ko1 = 'http://somewhere.org/directory/ko1.zip';
      const ko2 = 'http://somewhere.org/directory/ko2.zip';
      const ko3 = 'http://somewhere.org/directory/ko3.zip';
      const uris = [
        createUri(ko1),
        createUri(ko2),
        createUri(ko3)
      ]
      const output = createManifest(uris);

      expect(3).to.be.equal(output.length)
      const uriStrings = [ko1,ko2,ko3]
      output.map((node) => {
        expect(uriStrings).to.include(node['@id'])
        expect(node['@type']).to.be.equal('koio:KnowledgeObject')
      })
    })
  })
})

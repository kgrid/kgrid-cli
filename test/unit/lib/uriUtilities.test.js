const {expect} = require('chai');
const URI = require('uri-js');

const {createUri, uriToString, getFilename} = require('../../../lib/uriUtilities');

describe('uri Utilities', () => {
  let packageName = `package.zip`;
  let fileScheme = `file`;
  let absoluteLocalUriPath = `${fileScheme}://${process.cwd()}/${packageName}`;
  let relativeLocalUriPath = URI.resolve(process.cwd(), packageName);
  let remoteUriString = `http://example.gov/directory/${packageName}`;
  describe('create Uri', () => {

    it('should create an absolute uri from an absolute local uri', () => {
      let expectedUri = URI.parse(absoluteLocalUriPath);
      let output = createUri(absoluteLocalUriPath);
      expect(output).to.deep.equal(expectedUri);
    });
    it('should create an absolute uri from an absolute remote uri', () => {
      let expectedUri = URI.parse(remoteUriString);
      let output = createUri(remoteUriString);
      expect(output).to.deep.equal(expectedUri);
    });

    it('should create an absolute uri from a downward relative local path and base', () => {
      let expectedUri = createUri(`${process.cwd()}/${packageName}`)
      let uri = createUri(packageName);
      expect(uri).to.deep.equal(expectedUri);
    });

    it('should create an absolute uri from an upward relative local path and base', () => {
      const upwardPackageName = '../package.zip'
      let expectedUri = createUri(
        `${process.cwd().substring(0, process.cwd().lastIndexOf('/'))}/${packageName}`)
      let uri = createUri(upwardPackageName);
      expect(uri).to.deep.equal(expectedUri);
    });
  });

  describe('uriToString', () => {
    describe('should return a proper string', () => {
      it('with an absolute local uri', () => {
        let output = uriToString(createUri(absoluteLocalUriPath));
        expect(output).to.be.equal(absoluteLocalUriPath)
      })

      it('with an relative local uri', () => {
        let output = uriToString(createUri(relativeLocalUriPath));
        expect(output).to.be.equal(`${fileScheme}://${relativeLocalUriPath}`)
      })

      it('with a remote uri', () => {
        let output = uriToString(createUri(remoteUriString));
        expect(output).to.be.equal(remoteUriString)
      })
    })
  })

  describe('getFilename', () => {
    it('should return the file name', () => {
      expect(getFilename(createUri(absoluteLocalUriPath))).to.be.equal(`/${packageName}`)
    })
  })
});

const FormData = require('form-data');
const fs = require('fs-extra')
const axios = require('axios')

function uploadFile(koid, fullpath, url){
  let targeturl = url.endsWith('/') ? url : url+'/'
  let endpoint = 'kos'
  axios({
    method: 'get',
    url: targeturl + 'info'
  })
  .then(function (response) {
    var formData = new FormData();
    formData.append('ko', fs.createReadStream(fullpath),  { knownLength: fs.statSync(fullpath).size });
    const headers = {
      "Content-Type":`multipart/form-data; boundary=${formData._boundary}`,
      "Content-Length": formData.getLengthSync()
    };
    axios({
      method: 'post',
      url: targeturl+endpoint,
      data: formData,
      headers: headers
    })
    .then(function (response) {
      console.log(koid.naan+'/'+koid.name+' has been successfully uploaded to '+targeturl+'\n')
    })
    .catch(function(error){
      console.log('Error when uploading the file to '+targeturl+'\n\n');
    })
  })
  .catch(function(error){
    console.log('Cannot connect to '+targeturl+'\n\nPlease make sure the url is accessible.\n\nUSAGE:\n\n    $ kgrid upload [ARK] --file [FILE] --url [URL]');
  });
}

module.exports = uploadFile

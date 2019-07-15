const FormData = require('form-data');
const path= require('path')
const fs = require('fs-extra')
const axios = require('axios')

function uploadFile(type, koid, filefullpath, url){
  var endpoint = '/kos'
  if(type=='library'){
    endpoint = '/shelf'
  }
  axios({
    method: 'get',
    url: url+'/info'
  })
  .then(function (response) {
    var formData = new FormData();
    formData.append('ko', fs.createReadStream(filefullpath),  { knownLength: fs.statSync(filefullpath).size });
    const headers = {
      "Content-Type":`multipart/form-data; boundary=${formData._boundary}`,
      "Content-Length": formData.getLengthSync()
    };
    axios({
      method: 'post',
      url: url+endpoint,
      data: formData,
      headers: headers
    })
    .then(function (response) {
      console.log(koid.naan+'/'+koid.name+' has been successfully uploaded to '+url+'\n')
    })
    .catch(function(error){
      console.log('Error when uploading the file to '+url+'\n\n');
    })
  })
  .catch(function(error){
    console.log('Cannot connect to '+url+'\n\nPlease make sure the url is accessible.\n\nUSAGE:\n\n    $ kgrid upload [ARK] --file [FILE] --url [URL]');
  });

}

module.exports = uploadFile

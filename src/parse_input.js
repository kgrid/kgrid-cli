const checkPathKoioType = require('./check_pathkoiotype')
const path= require('path')
const fs = require('fs-extra')

function parseInput(cmd, ark, zip, src) {
      let filefullpath = ''
      let pathtype = checkPathKoioType()
      let metaJSON = {}
      let koid = {naan:'',name:'',imp:''}
      let arkid= []
      let fnarr = []
      if(ark) {
        arkid = ark.split('/')
        if(arkid[0]==''){
          arkid[0]='ark:'
        } else {
          if(arkid[0]!='ark:'){
            arkid.unshift('ark:')
          }
        }
        if(arkid.length<=2){
          switch(cmd){
            case 'upload':
              console.log('Please provide a valid ark id.\n')
              console.log('  Example: kgrid upload ark:/hello/world')
              break;
            case 'play':
              console.log('Please provide a valid ark id for the implementation.\n')
              console.log('  Example: kgrid play ark:/hello/world/v1')
              break;
          }
          return 1
        }
      }
      if(zip) {
        if(ark){
          console.log('The input of ark id will be ignored since a file is specified to upload.\n')
        }
        var fnext=path.extname(zip)
        if(fnext!='.zip'){
          console.log('Only ZIP format is supported. Please package your KO first and try again.')
          return 1
        } else {
          var fn = path.basename(zip, '.zip')
          fnarr = fn.split('-')
        }
      }
      if(pathtype.type=='shelf'){
        if(ark){
          koid.naan=arkid[1] || ''
          koid.name=arkid[2] || ''
          koid.imp=arkid[3] || ''
        }
        if(zip){
          koid.naan=fnarr[0] || ''
          koid.name=fnarr[1] || ''
        }
      } else {
        if(pathtype.type=='ko'){
          let koMetadataPath = path.join(pathtype.kopath,'metadata.json');
          if (fs.pathExistsSync(koMetadataPath)) {
            metaJSON = fs.readJsonSync(koMetadataPath);
            koid.naan=metaJSON['@id'].split('-')[0]
            koid.name=metaJSON['@id'].split('-')[1]
          } else {
            this.log("Cannot find metadata.json for " +path.basename(pathtype.kopath));
            return 1; // Error
          }
          if(ark){
            if(koid.naan==arkid[1]&&koid.name==arkid[2]){
              koid.imp=arkid[3] || ''
            }else {
              console.log('Current directory is the knowledge object of '+koid.naan+'/'+koid.name+'.\n\nThe command line input of '+ark+' will be ignored.\n')
            }
          }
        } else {
          if(pathtype.type=='implementation'){
            let impMetadataPath = path.join(pathtype.implpath,'metadata.json');
            if (fs.pathExistsSync(impMetadataPath)) {
              metaJSON = fs.readJsonSync(impMetadataPath);
              var arr = metaJSON.identifier.split('/')
              koid.naan=arr[1]
              koid.name=arr[2]
              koid.imp=arr[3]
            } else {
              this.log("Cannot find metadata.json for " +path.basename(pathtype.implpath));
              return 1; // Error
            }
            if(ark){
              if(koid.naan==arkid[1]&&koid.name==arkid[2]&&koid.imp==arkid[3]){

              }else {
                console.log('Current directory is the knowledge object of '+koid.naan+'/'+koid.name+'/'+koid.imp+'.\n\nPlease make sure the implementation is included in the packaged KO.\n')
              }
            }
          }
        }
      }
      switch(cmd){
        case 'upload':
          var fn = zip
          if(!zip){
            if(!ark){
              console.log('Please sepecify the KO to upload.')
              return 1
            }
            else {
              fn = koid.naan+'-'+koid.name+'.zip'
            }
          }
          filefullpath = path.join(pathtype.shelfpath, fn)
          if(!fs.pathExistsSync(filefullpath)){
            console.log('File '+fn+' can not be found. \n')
            if(!zip){
              console.log('Please package the KO first and try again.')
            }
            return 1
          }
          break;
      }

      var parsedInput = {}
      parsedInput.koid = JSON.parse(JSON.stringify(koid))
      parsedInput.filefullpath = filefullpath
      return parsedInput
    }

module.exports =  parseInput
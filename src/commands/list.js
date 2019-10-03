const {Command, flags} = require('@oclif/command')
const {cli}= require('cli-ux')
const checkPathKoioType = require('../check_pathkoiotype')
const documentations = require('../json/extradoc.json')
const list = require('../getall')

class ListCommand extends Command {
  async run() {
    const {flags} = this.parse(ListCommand)
    let pathtype = checkPathKoioType()
    var kolist = list(pathtype.shelfpath)
    if(kolist!=null){
      console.log("Shelf:  "+pathtype.shelfpath )
      console.log('----------------------------------------------------------')
      var displayArray = []
      kolist.forEach(function(e){
        if(e.type && e.id && e.path){
          var obj = {}
          obj.id = ( e.type.includes('Implementation')) ? "   "+e.id : e.id
          obj.path = ( e.type.includes('Implementation')) ? "  "+e.path : e.path
          displayArray.push(obj)
        }
      })
      cli.table(displayArray,{id:{header:'ARK ID',minWidth:36}, path:{header:'FILE PATH',minWidth:30}})
    } else {
      console.log('Error. Operation not permitted.\n')
    }
  }
}

ListCommand.description = `List all implementations for the Knowledge Objects on the shelf.
${documentations.list}
`

module.exports = ListCommand

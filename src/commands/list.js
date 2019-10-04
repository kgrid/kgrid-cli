const {Command} = require('@oclif/command')
const {cli}= require('cli-ux')
const checkPathKoioType = require('../check_pathkoiotype')
const documentations = require('../json/extradoc.json')
const list = require('../getall')

class ListCommand extends Command {
  async run() {
    let pathtype = checkPathKoioType()
    if(pathtype.type=='shelf'){
      var kolist = list(pathtype.shelfpath)
      if(kolist!=null){
        console.log("Shelf:  "+pathtype.shelfpath +'\n----------------------------------------------------------')
        cli.table(kolist,{id:{header:'ARK ID',minWidth:36}, path:{header:'FILE PATH',minWidth:30}})
      }
    }
    else {
      console.log('Error. Operation not permitted.\n')
    }
  }
}

ListCommand.description = `List all Knowledge Objects on the shelf.
${documentations.list}
`
module.exports = ListCommand

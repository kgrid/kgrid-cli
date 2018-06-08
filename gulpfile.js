#!/usr/bin/env node
const gulp = require('gulp')
const zip = require('gulp-zip')
const fs = require('fs-extra')
const path = require('path')
const exists = require('fs').existsSync
var runSequence = require('run-sequence')

var prop = {}
var srcglob = []
var tasks = []
if(!exists('project.json')){

} else {
   prop = JSON.parse(fs.readFileSync('project.json', 'utf8'))
   prop.objects.forEach(function(e, index){
     var packfile = e.id
     var srcpath = packfile + '/'
     var srcdirectory = path.join(srcpath, '**/*')
     console.log(index+"  "+srcdirectory)
     srcglob.push(srcdirectory)
     gulp.task('zip'+index, () => {
       gulp.src(srcglob[index], {base: '.'})
             .pipe(zip(packfile + '.zip'))
             .pipe(gulp.dest('target'))
             .on('end', function () {
               console.log(packfile + '.zip has been created in the target folder!')
             })
     })
     tasks.push('zip'+index)
     gulp.task('pack', ()=>{
       runSequence(tasks)
     })
   })
}

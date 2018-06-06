#!/usr/bin/env node
const gulp = require('gulp')
const zip = require('gulp-zip')
const fs = require('fs-extra')
const path = require('path')
const exists = require('fs').existsSync

var prop = {}
if(!exists('project.json')){

} else {
   prop = JSON.parse(fs.readFileSync('project.json', 'utf8'))
var packfile = prop.objects[0].id
var srcpath = packfile + '/'

var srcdirectory = path.join(srcpath, '**/*')
var srcglob = []
console.log(srcdirectory)
srcglob.push(srcdirectory)

gulp.task('zip', () => {
  gulp.src(srcglob, {base: '.'})
        .pipe(zip(packfile + '.zip'))
        .pipe(gulp.dest('target'))
        .on('end', function () {
          console.log('Zip file created in the target folder!')
        })
})

}

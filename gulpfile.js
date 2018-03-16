#!/usr/bin/env node
const gulp = require('gulp');
const zip = require('gulp-zip');
const fs=require('fs-extra');
const path=require('path')
var prop= JSON.parse(fs.readFileSync('project.json', 'utf8'))
var packfile=prop.object
var srcpath = prop.object+'/'

/* Here are the code for hand picking the files/folders to be included in the zip file*/
var srcdirectory = path.join(srcpath,'**/')
var srcglob = []
srcglob.push(srcdirectory)
var files = fs.readdirSync(srcpath)
files.forEach(function(e){
  var fn = path.join(srcpath,e)
  if (e!='metadata.json' && fs.lstatSync(fn).isFile()) {
    console.log(e+" will be excluded from the zip file.")
    fn='!'+fn
  }
  srcglob.push(fn)
})

  gulp.task('zip', () =>{
    gulp.src(srcglob)
        .pipe(zip(packfile+'.zip'))
        .pipe(gulp.dest('target'))
        .on('end', function() {
          console.log('Zip file created in the target folder!')
          fs.copySync('target/'+prop.object+'.zip','activator/shelf/'+prop.object+'.zip')
        });

  });

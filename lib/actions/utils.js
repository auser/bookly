var fs = require('fs-extra');
var path = require('path');
var through2 = require('through2')
var klaw = require('klaw');

var flatten = function(arr) {
  var flat = [].concat(arr);

  for(var i = 0; i < flat.length; i++) {  
    if(Array.isArray(flat[i])) {
      // Replace with the items and backtrack 1 position
      flat.splice(i, 1, ...flat[i--]);  
    }
  }
  return flat;
}

var pushSorted = function(item, files, config) {
  config = config || {};

  if (config.chapters) {
    var idx = config.chapters.indexOf(item.folder);
    if (idx >= 0) {
      files[idx].push(item);
    } else {
      files.push(item);
    }
  } else {
    files.push(item);
  }

  return files;
}

var readFiles = function(regex) {
  return function(inputFolder, config, done) {
    var files = []
    if (config.chapters) {
      files = config.chapters.map(name => [])
    }
    var folderRegex = new RegExp(config.input + '/(.*)');
    var excludeDirFilter = through2.obj(function (item, enc, next) {
      var fileSplit = item.path.split('/');
      var filename = fileSplit.pop();
      if (!item.stats.isDirectory() && 
          !/^\./.test(filename) && 
          filename.search('-content') === -1 && 
          regex.test(filename)) {

        if (fileSplit.join('/').match(folderRegex)) {
          this.push({ path: item.path, name: filename, folder: fileSplit.join('/').match(folderRegex)[1] });
        }
      }
      next();
    });

    klaw(inputFolder)
      .pipe(excludeDirFilter)
      .on('data', function (item) {
        files = pushSorted(item, files, config);
      })
      .on('end', function () { 
        done(flatten(files)); 
      });
  }
}

module.exports = {
  readMdFiles: readFiles(/\.md$|\.markdown$/),
  readHtmlFiles: readFiles(/\.htm$|\.html$/)
}
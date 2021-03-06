var chapters = require('./chapters');
var ph = require('./ph');
var mdx = require('./mdx');
var path = require('path');
var gen = require('./gen');
var exec = require('child_process').exec;

module.exports = (function () {
  var buildBook = function (options, callback) {
    var config = options.config;
    var htmlBookPath = path.join(__cwd, config.output, config.name + '.html');
    var pdfBookPath = path.join(__cwd, config.output, config.name + '.pdf');
    var epubBookPath = path.join(__cwd, config.output, config.name + '.epub');
    var mdBookPath = path.join(__cwd, config.output, config.name + '.md');
    var mobiBookPath = path.join(config.name + '.mobi');
    var docxBookPath = path.join(__cwd, config.output, config.name + '.docx');
    var texBookPath = path.join(__cwd, config.output, config.name + '.tex');

    var runCallback = function(err, msg) {
      if (callback && typeof callback === 'function') {

        if (err) {
          callback.apply(this, err);
        } else {
          __blogger.log(msg);
          callback.apply(this);
        }
      }
    }

    var mobi = function (options, mobiBookPath) {
      var mobiArgs = [
        'kindlegen',
        path.join(__cwd, config.output, config.name + '.epub'),
        '-c0 -o',
        mobiBookPath
      ];
      var mobiCmCommand = mobiArgs.join(' ');
      exec(mobiCmCommand, function (err, inerr, outerr) {
        if (err) { runCallback(err, 'error occurred'); }
        else { runCallback(null, 'Finished making the .mobi book.'); }
      });
    };
    var isFormat = function (arr, format) { return arr.indexOf(format) !== -1; };

    if (options.isDefault || options.isChaptersOnly) {
      mdx(options, function () {
        chapters(options);
      });
    } else if (options.isRender) {
      ph(options);
    } else if (options.isAll) {
      gen({ settings: options, extension: 'md', extBookPath: mdBookPath });
      mdx(options, function () {
        chapters(options);
        gen({
          settings: options, extension: 'html',
          extBookPath: htmlBookPath, isMdx: true
        });
        gen({
          settings: options, extension: 'epub',
          extBookPath: epubBookPath, isMdx: true
        }, function () {
          mobi(options, mobiBookPath);
        });
        gen({
          settings: options, extension: 'pdf',
          extBookPath: pdfBookPath, isMdx: true
        });
        gen({
          settings: options, extension: 'docx',
          extBookPath: docxBookPath, isMdx: true
        });
        gen({
          settings: options, extension: 'tex',
          extBookPath: texBookPath, isMdx: true
        });
      }, runCallback);
    } else if (options.formats[0]) {
      if ( isFormat(options.formats, 'md') ) {
        gen({
          settings: options,
          extension: 'md',
          extBookPath: mdBookPath
        }, runCallback);
      }
      mdx(options, function () {
        if (isFormat(options.formats, 'html')) {
          gen({
            settings: options, extension: 'html',
            extBookPath: htmlBookPath, isMdx: true
          }, runCallback);
        }
        if ( isFormat(options.formats, 'pdf') ) {
          gen({
            settings: options, extension: 'pdf',
            extBookPath: pdfBookPath, isMdx: true
          }, runCallback);
        }
        if (isFormat(options.formats, 'epub')) {
          gen({
            settings: options, extension: 'epub',
            extBookPath: epubBookPath, isMdx: true
          }, function () {
            return (isFormat(options.formats, 'mobi')) ? (mobi(options, mobiBookPath)) : '';
          });
        }
        if (isFormat(options.formats, 'docx')) {
          gen({
            settings: options, extension: 'docx',
            extBookPath: docxBookPath, isMdx: true
          }, runCallback);
        }
        if (isFormat(options.formats, 'tex')) {
          gen({
            settings: options, extension: 'tex',
            extBookPath: texBookPath, isMdx: true
          }, runCallback);
        }
      });
      __blogger.info('building the book in ' + options.formats.join(', ') + ' format(s)');
    } else {
      __blogger.warn('Option not valid');
    }
  };
  return {
    build: buildBook
  };
})();

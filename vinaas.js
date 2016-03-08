var express = require('express')
var serveStatic = require('serve-static')
var Metalsmith = require('metalsmith');
var branch = require('metalsmith-branch')
var flatten = require('metalsmith-flatten');
var markdown = require('metalsmith-markdown');

var copy = require('metalsmith-copy');
var rootPath = __dirname + '/PROJECTS/anvibaby'
var source = rootPath + '/src'
var admincp = rootPath + '/admincp'

Metalsmith(rootPath)
  .use(markdown())
  .destination(admincp)
  // .use(copy({
  //   pattern: 'documents/*.md',
  //   transform: function (file) {
  //     return file + '.text';
  //   }
  // }))
  //.use(flatten('files'))

  .build(function(err) {
    if (err) throw err;
    console.log('Build to ' + admincp);
  });

// Metalsmith(__dirname)
//   //.use(markdown())
//   //.use(layouts('handlebars'))
//   .source('../src')
//   .use( branch()
//             .pattern('*.js')
//             .use()
//           )
//
//   .build(function(err) {
//     if (err) throw err;
//     console.log('Build finished!');
//   });

var app = express()
var publicPath = source

app.use(serveStatic(publicPath, {'index': ['index.html', 'default.html', 'default.htm']}))
console.log('Run server at port 2000')  //
app.listen(2000)

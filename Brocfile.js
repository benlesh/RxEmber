var compileES6 = require('broccoli-es6-concatenator');

var wrapInEval = !process.env.PRODUCTION_BUILD;

var appTree = compileES6('src', {
  inputFiles: [
    '**/*.js'
  ],
  ignoredModules: [
    'ember'
  ],
  wrapInEval: wrapInEval,
  outputFile: '/rx.ember.js'
});


module.exports = appTree;
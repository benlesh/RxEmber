var AMDFormatter 			= require('es6-module-transpiler-amd-formatter');
var compileModules 		= require('broccoli-compile-modules');
var mergeTrees 				= require('broccoli-merge-trees');

var buildTrees = [];

var bundle = compileModules('lib', {
  inputFiles: ['rx-ember.umd.js'],
  output: '/rx-ember.js',
  formatter: 'bundle',
});

buildTrees.push(bundle);

buildTrees.push(compileModules('lib', {
  inputFiles: ['**/*.js'],
  output: '/amd/',
  formatter: new AMDFormatter()
}));

var buildTree = mergeTrees(buildTrees);

module.exports = buildTree;
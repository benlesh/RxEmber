import Ember from 'ember';
import { observableFrom } from 'ember-cli-rx/helpers';

module('helpers/observable-from');

test('it should observe property changes and emit them via an observable', function() {
	stop();
	var expectedResults = ['Ben', 'Jeff', 'Ranjit'];

	var FooClass = Ember.Object.extend({
		name: null,

		names: observableFrom('name'),
	});

	var foo = FooClass.create();
	var i = 0;

	foo.get('names').forEach(function(x) {
		equal(x, expectedResults[i++]);
		if(i === expectedResults.length) {
			start();
		}
	});

	foo.set('name', 'Ben');
	foo.set('name', 'Jeff');
	foo.set('name', 'Ranjit');
});

test('it should support array.[] observation', function() {
	stop();
	var expectedResults = [['wokka'], ['wokka', 'foo'], ['wokka', 'foo', 'bar']];

	var FooClass = Ember.Object.extend({
		stuff: [],

		names: observableFrom('stuff.[]'),
	});

	var foo = FooClass.create();
	var i = 0;

	foo.get('names').forEach(function(x) {
		deepEqual(x, expectedResults[i++]);
		if(i === expectedResults.length) {
			start();
		}
	});

	foo.set('stuff', ['wokka']);
	foo.get('stuff').pushObject('foo');
	foo.get('stuff').pushObject('bar');
});
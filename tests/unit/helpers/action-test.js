/* globals Rx */
import Ember from 'ember';
import action from 'ember-cli-rx/helpers/action';
import observable from 'ember-cli-rx/helpers/observable';

module('helpers/action');

test('it should create an observable of action arguments', function(){
	stop();

	var expectedResults = [
		[1,2,3],
		['foo', 'bar', 'baz'],
		['Ocelot', 'buyer\'s', 'remorse']
	];

	var FooController = Ember.ObjectController.extend({
		doSomethings: observable(),

		actions: {
			doSomething: action('doSomethings')
		}
	});

	var ctrl = FooController.create({});
	var i = 0;

	ctrl.get('doSomethings').forEach(function(args) {
		deepEqual(args, expectedResults[i++]);

		if(i === expectedResults.length) {
			start();
		}
	});

	Ember.run(function(){
		ctrl.send('doSomething', 1, 2, 3);
	});
	Ember.run(function(){
		ctrl.send('doSomething', 'foo', 'bar', 'baz');
	});
	Ember.run(function(){
		ctrl.send('doSomething', 'Ocelot', 'buyer\'s', 'remorse');
	});
});
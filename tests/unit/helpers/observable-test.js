import Ember from 'ember';
import { observable } from 'ember-cli-rx/helpers';


module('helpers/observable');

test('it should always supply an observable', function(){
	var FooClass = Ember.Object.extend({
		input: observable()
	});

	var foo = FooClass.create();

	ok(foo.get('input') instanceof Rx.Observable);
});

test('it should always give the latest supplied observable and only require one subscription', function(){
	stop();

	var FooClass = Ember.Object.extend({
		input: observable()
	});

	var i = 0;
	var expectedResults = [23, 42, 'banana', 'stand'];

	var foo = FooClass.create({
		input: Rx.Observable.fromArray([23, 42]),
	});

	var subscription = foo.get('input').forEach(function(x) {
		deepEqual(x, expectedResults[i++]);

		if(i === expectedResults.length) {
			start();
		}
	});

	foo.set('input', Rx.Observable.fromArray(['banana', 'stand']));
});
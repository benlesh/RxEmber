import Ember from 'ember';
import { observableFrom } from 'ember-cli-rx/helpers';

module('helpers/observable-from');

function testObservableFromPropertyChanges(useComputedProperty) {
	stop();
	var expectedResults = ['Ben', 'Jeff', 'Ranjit'];

	var FooClass = Ember.Object.extend({
		name: null,
    nameAlias: function() {
      return this.get('name');
    }.property('name'),
		names: observableFrom(useComputedProperty ? 'nameAlias' : 'name'),
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
}

test('it should observe property changes and emit them via an observable (normal properties)', function() {
  testObservableFromPropertyChanges(false);
});

test('it should observe property changes and emit them via an observable (computed properties)', function() {
  testObservableFromPropertyChanges(true);
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


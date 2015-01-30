import Ember from 'ember';

import { bindTo } from 'ember-cli-rx/helpers';

module('helpers/bind-to');

test('it should bind to an observable in the specified property', function(){
  var subject = new Rx.Subject();

  var FooClass = Ember.Object.extend({
    things: function(){
      return subject;
    }.property(),

    thing: bindTo('things'),
  });

  var foo;
  var thing;

  Ember.run(function(){
    foo = FooClass.create();
    thing = foo.get('thing');
  });

  equal(thing, undefined, 'property starts undefined');

  Ember.run(function() {
    subject.onNext('something');
    thing = foo.get('thing');
    equal(thing, undefined, 'immediately after observable emits, the property should not update until actions queue is processed');
  });

  Ember.run(function() {
    thing = foo.get('thing');
    equal(thing, 'something', 'previous actions queue has processed so property has updated');
  });

  equal(typeof foo._thing_disposable, 'object', 'expect a disposable to be tracked on a private property');

  var disposeCalled = false;
  var dispose = foo._thing_disposable.dispose;
  foo._thing_disposable.dispose = function(){
  	disposeCalled = true;
  	return dispose.apply(this, arguments);
  };

  Ember.run(function(){
    equal(disposeCalled, false, 'sanity check, dispose should not have been called yet');
    foo.destroy();
  });

  equal(disposeCalled, true, 'expect destroying the object to dispose of the disposable');
});
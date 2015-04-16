import Ember from 'ember';

import { bindTo } from 'ember-cli-rx/helpers';

module('helpers/bind-to');

test('it should bind to an observable in the specified property', function(){
  var subject = new Rx.Subject();

  var FooClass = Ember.Component.extend(Ember.Evented, {
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

  equal(typeof foo._bindToDisposables, 'object', 'expect a composite disposable to have been registered');

  Ember.run(function(){
    foo.trigger('willDestroyElement');
  });

  equal(foo._thing_disposable.isDisposed, true, 'expect disposal');
});

test('it should assert components only', function(){
  var FooClass = Ember.Object.extend({
    something: Rx.Observable.return(42),
    whatever: bindTo('something')
  });
  
  throws(function(){
    Ember.run(function(){
      var foo = FooClass.create();
      foo.get('whatever');
    });
  }, 'Assertion Failed: Must be applied to components only');
});
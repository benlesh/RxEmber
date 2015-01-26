import Ember from 'ember';

import { bindTo } from 'ember-cli-rx/helpers';

module('helpers/bind-to');

test('it should bind to an observable in the specified property', function(){
  var FooClass = Ember.Object.extend({
    things: function(){
      return Rx.Observable.just('thing 1');
    }.property(),

    thing: bindTo('things'),
  });

  var foo = FooClass.create();
  equal(foo.get('thing'), 'thing 1');
  equal(typeof foo._thing_disposable, 'object');
  equal(typeof foo._thing_disposable.dispose, 'function');

  var disposeCalled = false;
  var dispose = foo._thing_disposable.dispose;
  foo._thing_disposable.dispose = function(){
  	disposeCalled = true;
  	return dispose.apply(this, arguments);
  };
  
  Ember.run(function(){
    foo.destroy();
  });

  equal(disposeCalled, true);
});
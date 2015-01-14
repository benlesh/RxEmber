/*globals Rx, Ember*/

/**
  A set of helpers for wiring up Ember objects and observables
	@module rx-helpers
*/

/**
  Wires up an action to feed an observable property.

  ### Example

        Ember.ObjectController.extend(RxBindings, {
          rxBindings: {
            'fooClickTallies': 'fooClickTally'
          },

          actions: {
            'fooClick': action('fooClicks'),
          },

          fooClicks: observable(),

          fooClickTallies: scan('fooClicks', 0, function(inc) {
            return inc++;
          }),

          fooClickTally: 0,
        });


        <button {{action 'fooClicks'}}>foo {{fooClickTally}}</button>

  @method action
  @param outputProperty {string} the name of the observable (observable) property to feed.
  @return {Function}
*/

var get = Ember.get;
var set = Ember.set;

export function action(outputProperty) {
  var subject;

  return function(){
    if(!subject) {
      subject = new Rx.Subject();
      this.set(outputProperty, subject);
    }
    var args = [].slice.call(arguments);
    subject.onNext(args);
  };
}

export var rxAction = Ember.deprecateFunc('RxEmber.rxAction is deprecated, use RxEmber.action', action);

/**
  Creates a property that accepts Rx.Observables
  and returns a single observable that represents the latest observable
  passed.

  This can be used for any input to a component that is an observable.

  @method observable
  @return Ember.ComputedProperty
*/
export function observable() {
  return function(key, val){
    var backingField = '_' + key;
    if(!this[backingField]) {
      this[backingField] = new Rx.BehaviorSubject(Rx.Observable.empty());
    }

    if(arguments.length > 1) {
      var next = val && val instanceof Rx.Observable ? val : Rx.Observable.empty();
      this[backingField].onNext(next);
    }

    return this[backingField]['switch']();
  }.property();
}

export var rxInput = Ember.deprecateFunc('RxEmber.rxInput is deprecated. Use RxEmber.observable');

/**
  Maps from an observable property into a new observable property.

  This is really shorthand for `this.get('someObservableProp').map(fn)`.

  ### Example

        Ember.ObjectController.extend({
          foos: observable(),

          yelledFoos: map('foos', function(x) {
            return x + '!!!';
          }),
        });

  @method map
  @param sourceProp {string} the name of the source observable property
  @param callback {function} the mapping callback
  @return Ember.ComputedProperty
*/
export function map(sourceProp, callback) {
	return function() {
		return this.get(sourceProp).map(callback.bind(this));
	}.property(sourceProp);
}

export var rxMap = Ember.deprecateFunc('RxEmber.rxMap is deprecated. Use RxEmber.map', map);

/**
  Sets up an observable that is an Rx "scan" on the observable in the source property. 

  A scan is similar to a reduce, except it emits a value each *next*.

  ### Example

    Ember.ObjectController.extend({
      foos: observable(),

      accumulatedFoos: scan('foos', [], function(acc, foo) {
        acc.pushObject(foo);
        return acc;
      }),
    });

  @method scan
  @param sourceProp {string} the name of the property with the source observable
  @param start {any} the starting value of the accumulator
  @param callback {function} the accumulation function, return value should be the accumulated value thus far
  @return Ember.ComputedProperty
*/
export function scan(sourceProp, start, callback) {
  return function(){
  	return this.get(sourceProp).scan(start, callback.bind(this));
  }.property(sourceProp);
}

export var rxScan = Ember.deprecateFunc('RxEmber.rxScan is deprecated. Use RxEmber.scan', scan);

/**
  Performs an Rx "filter" on the source property and returns an observable

  ### Example

        Ember.ObjectController.extend({
          foos: observable(),

          evenFoos: filter('foos', function(x) {
            return x % 2 === 0;
          }),
        });


  @method filter
  @param sourceProp {string} the name of the property with the source observable
  @param callback {function} the filtering predicate
  @return Ember.ComputedProperty
*/
export function filter(sourceProp, callback) {
  return function() {
  	return this.get(sourceProp).filter(callback.bind(this));
  }.property(sourceProp);
}

export var rxFilter = Ember.deprecateFunc('RxEmber.rxFilter is deprecated. Use RxEmber.filter', filter);

/**
  Creates an observable from observed Ember property changes.

  In essence, this sets up an Ember `observes` that supplies values to an observable that this property will return.

  ### Example

        Ember.ObjectController.extend({
          foo: null,

          foos: observableFrom('foo'),

          accumulatedFoos: scan('foos', [], function(acc, foo) {
            acc.pushObject(foo);
            return acc;
          }),
        });

  @method observableFrom
  @param propName {string} the name of the property to observe changes of
  @return Ember.ComputedProperty
*/
export function observableFrom(propName) {
  return function(key, value) {
    return Rx.Observable.create(function(observer) {
      var fn = function() {
        observer.onNext(this.get(propName));
      }.bind(this);

      this.addObserver(propName, fn);

      return function(){
        this.removeObserver(propName, fn);
      }.bind(this);
    }.bind(this));
  }.property();
}

export var rxPropertyChanges = Ember.deprecateFunc('RxEmber.rxPropertyChanges is deprecated, use RxEmber.observableFrom', observableFrom);

/**
  @method bindTo
  @param sourcePropName {String} the name of the property containing the Observable to bind this
    property to.
  @return {Ember.ComputedProperty}
*/
export function bindTo(sourcePropName) {
  return function(key, value) {
    var self = this;
    var backingPropName = '_' + key;
    var subscribedTo = backingPropName + '_observable';
    var observable = this.get(sourcePropName);

    if(this[subscribedTo] !== observable){
      this[subscribedTo] = observable;
      var backingDisposable = backingPropName + '_disposable';
      var disposable = this[backingDisposable];

      if(!disposable) {
        disposable = this[backingDisposable] = new Rx.SerialDisposable();
        var willDestroy = this.willDestroy;

        this.willDestroy = function() {
          disposable.dispose();
          if(willDestroy) {
            return willDestroy.apply(this, arguments);
          }
        };
      }

      disposable.setDisposable(observable.subscribe(function(nextValue) {
        self.set(key, nextValue);
      }, function(err) {
        console.error('Error binding property: %o', err);
        self.set(key, undefined);
      }));
    }

    if(arguments.length > 1) {
      this[backingPropName] = value;
    }

    return this[backingPropName];
  }.property(sourcePropName);
}

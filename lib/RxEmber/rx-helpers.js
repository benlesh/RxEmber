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
            'fooClick': rxAction('fooClicks'),
          },

          fooClicks: rxInput(),

          fooClickTallies: rxScan('fooClicks', 0, function(inc) {
            return inc++;
          }),

          fooClickTally: 0,
        });


        <button {{action 'fooClicks'}}>foo {{fooClickTally}}</button>

  @method rxAction
  @param outputProperty {string} the name of the observable (rxInput) property to feed.
  @return {Function}
*/
export function rxAction(outputProperty) {
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

var backingUUID = 1;

/**
  Creates a property that accepts Rx.Observables 
  and returns a single observable that represents the latest observable 
  passed.

  This can be used for any input to a component that is an observable.

  @method rxInput
  @return Ember.ComputedProperty
*/
export function rxInput() {
  var uuid = backingUUID++;
  var backingField = '_rxInput_' + uuid;
  
  return function(key, val){
    if(!this[backingField]) {
      this[backingField] = new Rx.Subject();
    }    
    
    if(arguments.length > 1) {
      var next = val && val instanceof Rx.Observable ? val : Rx.Observable.empty();
      this[backingField].onNext(next);
    }
      
    return this[backingField]['switch']();
  }.property();
}


/**
  Maps from an observable property into a new observable property.

  This is really shorthand for `this.get('someObservableProp').map(fn)`.

  ### Example

        Ember.ObjectController.extend({
          foos: rxInput(),

          yelledFoos: rxMap('foos', function(x) {
            return x + '!!!';
          }),
        });

  @method rxMap
  @param sourceProp {string} the name of the source observable property
  @param callback {function} the mapping callback
  @return Ember.ComputedProperty
*/
export function rxMap(sourceProp, callback) {
	return function() {
		return this.get(sourceProp).map(callback.bind(this));
	}.property(sourceProp);
}

/**
  Sets up an observable that is an Rx "scan" on the observable in the source property. 

  A scan is similar to a reduce, except it emits a value each *next*.

  ### Example

    Ember.ObjectController.extend({
      foos: rxInput(),

      accumulatedFoos: rxScan('foos', [], function(acc, foo) {
        acc.pushObject(foo);
        return acc;
      }),
    });

  @method rxScan
  @param sourceProp {string} the name of the property with the source observable
  @param start {any} the starting value of the accumulator
  @param callback {function} the accumulation function, return value should be the accumulated value thus far
  @return Ember.ComputedProperty
*/
export function rxScan(sourceProp, start, callback) {
  return function(){
  	return this.get(sourceProp).scan(start, callback.bind(this));
  }.property(sourceProp);
}

/**
  Performs an Rx "filter" on the source property and returns an observable

  ### Example

        Ember.ObjectController.extend({
          foos: rxInput(),

          evenFoos: rxFilter('foos', function(x) {
            return x % 2 === 0;
          }),
        });


  @method rxFilter
  @param sourceProp {string} the name of the property with the source observable
  @param callback {function} the filtering predicate
  @return Ember.ComputedProperty
*/
export function rxFilter(sourceProp, callback) {
  return function() {
  	return this.get(sourceProp).filter(callback.bind(this));
  }.property(sourceProp);
}

/**
  Creates an observable from observed Ember property changes.

  In essence, this sets up an Ember `observes` that supplies values to an observable that this property will return.

  ### Example

        Ember.ObjectController.extend({
          foo: null,

          foos: rxPropertyChanges('foo'),

          accumulatedFoos: rxScan('foos', [], function(acc, foo) {
            acc.pushObject(foo);
            return acc;
          }),
        });

  @method rxPropertyChanges
  @param propName {string} the name of the property to observe changes of
  @return Ember.ComputedProperty
*/
export function rxPropertyChanges(propName) {
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



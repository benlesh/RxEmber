RxEmber
==============

[![Build Status](https://travis-ci.org/blesh/RxEmber.svg?branch=master)](https://travis-ci.org/blesh/RxEmber)

An experimental set of helpers for Ember and RxJS

## RxBindings mixin

Binding an observable to a property on an object using the `RxBindings` mixin is a matter
of adding the mixin, then setting up an `rxBindings` mapping that maps properties that return
Observables, to properties that we want to write their "nexted" values out to. After that a 
call to `subscribe()` will subscribe to all observables, writing out their values to the
specified properties. To tear down these subscriptions, simply call `unsubscribe()`

Generally speaking `subcribe()` and `unsubscribe()` will be called from places like `didInsertElement` 
and `willDestroyElement` in a component, or in the case of a route or controller, they'll be called
in the Route `activate` and `deactivate`.

The example below simplifies this by using actions to call them:


```js
var RxBindings = RxEmber.RxBindings;

// include the RxBindings binding mixin
App.SomeController = Ember.ObjectController.extend(RxBindings, {
	
	// set up bindings. This will `set` values on the object
	// when the observable emits the next value.
	rxBindings: {
		'myObservableProperty': 'outputProperty'
	},

  // a property we're going to set. 
  // this is what you're going to write out to your view.
	outputProperty: null,

  // a property that returns an observable.
  // in this case, it "ticks" once a second
	myObservableProperty: function() {
    return Rx.Observable.interval(1000);
	}.property(),

	actions: {
		start: function(){
			// The RxBindings mixin adds a method to subscribe to all
			// observables specified in the `rxBindings` map
			this.subscribe();
		},

		stop: function(){
			// it also adds a method to unsubscribe from all observables.
			this.unsubscribe();
		}
	}
});

```

And the view:

```hbs
<div>
	output: {{outputProperty}}
</div>
<div>
	<button {{action 'start'}}>Start</button>
	<button {{action 'stop'}}>Stop</button>
</div>

```


## Helper methods

RxEmber features several helper methods for setting up properties that are Observables or making Actions into
Observables.


### rxInput() helper

Usually any observable input to your component or controller would come through a property
that uses `rxInput()`.

```js
myInputProperty: rxInput(),
```

** Why is this used?

One common issue when trying to develop Ember components that expect Observables to be supplied to them is that 
Observable inputs might change dynamically, and often they haven't be supplied yet at the point you're subscribing
to them. 

A way to get around this is by having a property that returns a "switched" Observable. The technicals of this, is that
you have an Observable of Observables, and you `.switch()` to the latest observable supplied.

The code to duplicate the example above looks (somewhat) like this:

```js
myInputProperty: function(key, value) {
  // Make sure there's a BehaviorSubject backing this thing.
  if(!this._myInputProperty) {
	  this._myInputProperty = new Rx.BehaviorSubject();
	}

  // if "setting" the observable, supply it to the subject
  if(arguments.length > 1) {
		this._myInputProperty.onNext(value)
	}

  // return a switched observable of the subject's values
  return this._myInputProperty.switch();
}.property(),
```


### rxAction() helper

The `rxAction(prop)` helper can be used in conjunction with the `rxInput()` helper to convert any 
action in to an observable stream of inputs to your class.

```js
// this is the observable we want to
// stream our action through
// Arguments are "nexted" in as an Array.
clickStream: rxInput(),

actions: {
  // this is the action we'll wire up in the view.
	clicked: rxAction('clickStream'),
}
```

And here's the view:

```hbs
<button {{action 'clicked'}}>click me</button>
```

From there you can of course write out values using the `RxBindings` mixin.

### rxPropertyChange() helper

`rxPropertyChange` converts observed changes to a property on an Ember object into
an Observable stream.

```js
// the property we want to observe
foo: 0,

// an observable stream of changes to `foo`
foos: rxPropertyChange('foo'),
```

### rxMap() helper

`rxMap` is used to map one observable property into a new observable property. It's effectivelly
 a shorthand method.

```js
	intervalStream: function() {
		return Rx.Observable.interval(1000),
	}.property(),

	ticks: rxMap('intervalStream', function(n) {
		return {
			tick: n,
			dt: Date.now()
		};
  }),
```

this is equivalent to:

```js
	intervalStream: function() {
		return Rx.Observable.interval(1000),
	}.property(),

	ticks: function() {
		return this.get('intervalStream').map(function(n) {
			return {
				tick: n,
				dt: Date.now()
			};
	  });
	}.property('intervalStream'),
```

### rxFilter() helper

`rxFilter` is used to filter one observable property into a new observable property. The semantics are
similar to rxMap

```js
	numbers: function(){
		return Rx.Observable.fromArray([1,2,3,4,5]);
	}.property(),

	evens: rxFilter('numbers', function(n) {
		return n % 2 === 0;
	}),
```


### rxScan() helper

`rxScan` is used to perform an RxJS "scan" on an observable and return a new observable. This is good
for accumulating data and emitting that accumulation each "next".

```js
  // emits 1, 2, 3, 4, 5, ...
	ticks: function(){
		return Rx.Observable.interval(1000);
	}.property(),

  // emits 1, 3, 6, 10, 15, ...
	accumulated: rxScan('ticks', 0, function(acc, n) {
		acc += n;
		return acc;
	}),

```
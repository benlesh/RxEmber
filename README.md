RxEmber
==============

[![Build Status](https://travis-ci.org/blesh/RxEmber.svg?branch=master)](https://travis-ci.org/blesh/RxEmber)

An experimental set of helpers for Ember and RxJS

## Installation

Via Bower:

```sh
bower install -S rx-ember
```


## Basic Usage

RxEmber is meant to be used with Components. If you do use RxEmber
helpers with other Ember Object types, you will need to ensure
`.destroy()` is called on those objects.

Basic usage might look something like this:

```js
App.ClockComponent = Ember.Component.extend({
  ticks: Rx.Observable.interval(1000),

  times: RxEmber.map('ticks', function() {
    var d = new Date();
    return (d.getHours() % 12 || 12) + ':' + d.getMinutes() + ':' +
d.getSeconds() + ' ' + (d.getHours() >= 12 ? 'PM' : 'AM');
  }),

  time: RxEmber.bindTo('times')
});
```

And the template:

```hbs
The time is: {{time}}
```

## Helper methods

RxEmber features several helper methods for setting up properties that are Observables or making Actions or property changes into
Observables.


### RxEmber.observable() helper

Usually any observable input to your component or controller would come through a property
that uses `observable()`.

```js
myInputProperty: RxEmber.observable(),
```
**Why is this used?**

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


### RxEmber.action() helper

The `RxEmber.action(prop)` helper can be used in conjunction with the `observable()` helper to convert any 
action in to an observable stream of inputs to your class.

```js
// this is the observable we want to
// stream our action through
// Arguments are "nexted" in as an Array.
clickStream: RxEmber.observable(),

actions: {
  // this is the action we'll wire up in the view.
	clicked: RxEmber.action('clickStream'),
}
```

And here's the view:

```hbs
<button {{action 'clicked'}}>click me</button>
```

From there you can of course write out values using the `RxBindings` mixin.

### RxEmber.observableFrom() helper

`RxEmber.observableFrom` converts observed changes to a property on an Ember object into
an Observable stream.

```js
// the property we want to observe
foo: 0,

// an observable stream of changes to `foo`
foos: RxEmber.observableFrom('foo'),
```

### RxEmber.map() helper

`RxEmber.map` is used to map one observable property into a new observable property. It's effectivelly
 a shorthand method.

```js
intervalStream: function() {
  return Rx.Observable.interval(1000),
}.property(),

ticks: RxEmber.map('intervalStream', function(n) {
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

### RxEmber.filter() helper

`RxEmber.filter` is used to filter one observable property into a new observable property. The semantics are
similar to RxEmber.map

```js
	numbers: function(){
		return Rx.Observable.fromArray([1,2,3,4,5]);
	}.property(),

	evens: RxEmber.filter('numbers', function(n) {
		return n % 2 === 0;
	}),
```


### RxEmber.scan() helper

`RxEmber.scan` is used to perform an RxJS "scan" on an observable and return a new observable. This is good
for accumulating data and emitting that accumulation each "next".

```js
  // emits 1, 2, 3, 4, 5, ...
	ticks: function(){
		return Rx.Observable.interval(1000);
	}.property(),

  // emits 1, 3, 6, 10, 15, ...
	accumulated: RxEmber.scan('ticks', 0, function(acc, n) {
		acc += n;
		return acc;
	}),

```

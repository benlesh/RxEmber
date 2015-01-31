RxEmber
==============

[![Build Status](https://travis-ci.org/blesh/RxEmber.svg?branch=master)](https://travis-ci.org/blesh/RxEmber)

An experimental set of helpers for Ember and RxJS

## Installation

Via Bower:

```sh
bower install -S rx-ember
```

## Ember-CLI 

http://github.com/blesh/ember-cli-rx

An [Ember-CLI](http://www.ember-cli.com) version of this project is now available and is the project development
is primarily done on. The RxEmber project (this one) exists mostly to create a "global" build of rx-ember for 
non-Ember-CLI consumption.


## Basics

RxEmber helpers are used to create and manipulate observables on an
Ember object. This is generally done by creating computed properties
that contain observables, and then chaining them together with other
computed properties that return observables.

The most important helper, though, is `RxEmber.helpers.bindTo`.

`Ember.bindTo` will set up a subscription to the observable in the
property whose name you supply. Because it sets up a subscription, that
subscription needs to be "disposed" of. The disposal is wired up to
happen on `willDestroy` of the object. **RxEmber.bindTo is really meant
to be used with Components.** If you do use the RxEmber bindTo helper with
other Ember Object types, you will need to ensure `.destroy()` is called on
those objects.

Basic usage might look something like this:

```js
var bindTo = Ember.helpers.bindTo;

App.MyClockComponent = Ember.Component.extend({
  times: Rx.Observable.interval(1000).map(function() {
		var d = new Date();
    return (d.getHours() % 12 || 12) + ':' + d.getMinutes() + ':' + 
    	d.getSeconds() + ' ' + (d.getHours() >= 12 ? 'PM' : 'AM');
	}),

  time: bindTo('times')
});
```

And the template:

```hbs
The time is: {{time}}
```

## Helper methods

RxEmber features several helper methods for setting up properties that are Observables or making Actions or property changes into
Observables.

### RxEmber.helpers.bindTo(propName)

As stated above, `RxEmber.helpers.bindTo` is probably the most important helper.
What it does is:

1. Subcribe to the observable in the property name provided.
2. Schedule the emitted events on the Ember "action" queue.
3. Manage that subscription (i.e. if the observable property changes,
   re-subscribe)
4. Set up disposable of the subscription to occur upon destruction of the object.

As such, it is very important that all objects using the bindTo helper
are destroyed.

**It's recommended that RxEmber.bindTo() is used with
Ember.Components!** Ember components and views are destroyed when not
rendered, and will automatically dispose of the subscriptions.
**Otherwise destroy() must be manually called**.

```js
var bindTo = RxEmber.helpers.bindTo;

App.FooBarComponent = Ember.Component.extend({
  // an observable to subscribe to
  foos: Rx.Observable.just('bar'),

  // a property that is bound to the output of our observable
  // on the property `foos`.
  foo: bindTo('foos'),
});
```

and the template:

```hbs
This will say "bar": {{foo}}
```

### RxEmber.helpers.observable() helper

Usually any observable input to your component or controller would come through a property
that uses `observable()`.

```js
myInputProperty: RxEmber.helpers.observable(),
```

**Why is this used?**

One common issue when trying to develop Ember components that expect Observables to be supplied to them is that
Observable inputs might change dynamically, and often they haven't be supplied yet at the point you're subscribing
to them.

A way to get around this is by having a property that is an observable that switches to the 
latest observable supplied to it.

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


### RxEmber.helper.action(propName) helper

`RxEmber.helper.action` can be used in conjunction with the `observable()` helper to convert any
action in to an observable stream of inputs to your class.

```js
// this is the observable we want to
// stream our action through
// Arguments are "nexted" in as an Array.
clickStream: RxEmber.helper.observable(),

actions: {
  // this is the action we'll wire up in the view.
	clicked: RxEmber.helper.action('clickStream'),
}
```

And here's the view:

```hbs
<button {{action 'clicked'}}>click me</button>
```

From there you can of course write out values using the `RxBindings` mixin.

### RxEmber.helpers.observableFrom(args) helper

`RxEmber.helpers.observableFrom` converts observed changes to a property on an Ember object into
an Observable stream.

```js
// the property we want to observe
foo: 0,

// an observable stream of changes to `foo`
foos: RxEmber.helper.observableFrom('foo'),
```

## Schedulers

### RxEmber.schedulers.emberActionScheduler(target)

An Rx.Scheduler for scheduling an observable to emit as part of the Ember "actions" queue. The `target` is the Ember.Object to set as the target for the `Ember.run.schedule('actions', target, fn)` call.


### RxEmber.schedulers.emberScheduler(queueName, target)

An Rx.Scheduler for scheduling an observable to emit as part of the any Ember run queue. The `queueName` is the name of the queue you want to schedule the observable to emit on (e.g. "afterRender" or "actions"). The `target` is the Ember.Object to set as the target for the `Ember.run.schedule('actions', target, fn)` call.

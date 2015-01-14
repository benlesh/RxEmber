define("RxEmber/rx-helpers", ["exports"], function(__exports__) {
  "use strict";

  function __es6_export__(name, value) {
    __exports__[name] = value;
  }

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

  function action(outputProperty) {
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

  __es6_export__("action", action);
  var rxAction = Ember.deprecateFunc('RxEmber.rxAction is deprecated, use RxEmber.action', action);

  __es6_export__("rxAction", rxAction);
  function observable() {
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

  __es6_export__("observable", observable);
  var rxInput = Ember.deprecateFunc('RxEmber.rxInput is deprecated. Use RxEmber.observable');

  __es6_export__("rxInput", rxInput);
  function map(sourceProp, callback) {
      return function() {
          return this.get(sourceProp).map(callback.bind(this));
      }.property(sourceProp);
  }

  __es6_export__("map", map);
  var rxMap = Ember.deprecateFunc('RxEmber.rxMap is deprecated. Use RxEmber.map', map);

  __es6_export__("rxMap", rxMap);
  function scan(sourceProp, start, callback) {
    return function(){
      return this.get(sourceProp).scan(start, callback.bind(this));
    }.property(sourceProp);
  }

  __es6_export__("scan", scan);
  var rxScan = Ember.deprecateFunc('RxEmber.rxScan is deprecated. Use RxEmber.scan', scan);

  __es6_export__("rxScan", rxScan);
  function filter(sourceProp, callback) {
    return function() {
      return this.get(sourceProp).filter(callback.bind(this));
    }.property(sourceProp);
  }

  __es6_export__("filter", filter);
  var rxFilter = Ember.deprecateFunc('RxEmber.rxFilter is deprecated. Use RxEmber.filter', filter);

  __es6_export__("rxFilter", rxFilter);
  function observableFrom(propName) {
    var arrIndex = propName.indexOf('.[]');
    var prop = propName;
    if(arrIndex !== -1) {
      prop = propName.substring(0, arrIndex);
    }

    return function(key, value) {
      return Rx.Observable.create(function(observer) {
        var fn = function() {
          observer.onNext(this.get(prop));
        }.bind(this);

        this.addObserver(propName, fn);

        return function(){
          this.removeObserver(propName, fn);
        }.bind(this);
      }.bind(this));
    }.property();
  }

  __es6_export__("observableFrom", observableFrom);
  var rxPropertyChanges = Ember.deprecateFunc('RxEmber.rxPropertyChanges is deprecated, use RxEmber.observableFrom', observableFrom);

  __es6_export__("rxPropertyChanges", rxPropertyChanges);
  function bindTo(sourcePropName) {
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
  __es6_export__("bindTo", bindTo);
});

//# sourceMappingURL=rx-helpers.js.map
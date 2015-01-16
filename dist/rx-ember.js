(function() {
    "use strict";
    /*globals Rx, Ember*/

    function $$RxEmber$rx$bindings$$noop() {}

    var $$RxEmber$rx$bindings$$default = Ember.Mixin.create({
      /**
        The mappings for binding Rx.Observable properties on the class to output properties on the class.
        @property rxBindings
        @type Object
        @default null
      */
      rxBindings: null,

      /**
        An event hook that will be called just before the subscriptions to
        the rxBinding observables are made.
        @property willSubscribe
        @type Function
        @default noop
      */
      willSubscribe: $$RxEmber$rx$bindings$$noop,

      /**
        An event hook that will be called just after the subscriptions to
        the rxBinding observables are made.
        @property didSubscribe
        @type Function
        @default noop
      */
      didSubscribe: $$RxEmber$rx$bindings$$noop,

      /**
        An event hook that will be called just prior to disposing subscriptions
        @property willDispose
        @type Function
        @default noop
      */
      willDispose: $$RxEmber$rx$bindings$$noop,

      /**
        An event hook that will be called just after disposing subscriptions
        @property didSubscribe
        @type Function
        @default noop
      */
      didDispose: $$RxEmber$rx$bindings$$noop,

      /**
        An composite disposable that can dispose of all subscriptions made
        via `subscribeTo`
        @property instanceDisposable
        @type Rx.CompositeDisposable
        @default null
      */
      instanceDisposable: null,

      /**
        Subscribes to the observable passed and adds the subscription disposable to the composite
        diposable for the instance (`instanceDisposable`)
        @method subscribeTo
        @param observable {Rx.Observable} the observable to subscribe to
        @param next {Function} the required next function that will be called onNext for subscription
        @param err {Function} the function to be call onError for the observable
        @param completed {Function} the function to be called onCompleted for the observable.
        @return {Rx.Disposable} the disposable created by the subscription
      */
      subscribeTo: function(observable, next, err, completed) {
        this.instanceDisposable = this.instanceDisposable || new Rx.CompositeDisposable();
        var disposable = observable.subscribe(next.bind(this), err ? err.bind(this) : undefined, completed ? completed.bind(this) : undefined);
        this.instanceDisposable.add(disposable);
        return disposable;
      },

      /**
        Calls dispose on the instance disposable, ending all subscriptions, then resets the
        instance disposable back to null
        @method dispose
      */
      dispose: function(){
        this.willDispose.apply(this);
        if(this.instanceDisposable) {
          this.instanceDisposable.dispose();
        }
        this.instanceDisposable = null;
        this.didDispose.apply(this);
      },

      //TODO: better explanation of config object.
      /**
        Creates a subscription from the source (observable) property, to update the target property
        @method addRxSubscription
        @param source {string} the name of the observable property to subscribe to
        @param target {string|Object} the name of the property to update, or a configuration object.
        @return {Rx.Disposable} the rx disposable to remove the binding (unsubscribe).
      */
      addRxSubscription: function(source, target) {
        var sourceObs = this.get(source);
        if(!sourceObs) {
          return;
        }
        var key, nextFn;

        if(typeof target === 'string') {
          key = target;
          nextFn = function(d) {
            this.set(key, d);
          };
        }

        if(typeof target === 'object') {
          key = target.key;
          nextFn = target.next;
        }

        return this.subscribeTo(sourceObs, nextFn, function(err) {
          console.error('RxBinding error %s: %O', key, err);
        });
      },

      /**
        Creates subscriptions from all items in `rxBindings` using `addRxSubscription`.
        @method subscribe
      */
      subscribe: function(){
        this.willSubscribe.apply(this);
        var rxBindings = this.get('rxBindings');
        if(rxBindings) {
          Ember.keys(rxBindings).forEach(function(source) {
            var target = rxBindings[source];
            this.addRxSubscription.call(this, source, target);
          }, this);
        }
        this.didSubscribe.apply(this);
      },

      _deprecateRxBindings: function(){
        Ember.deprecate('RxBindings Mixin is deprecated. Use RxEmber.bindTo instead');
      }.on('init')
    });

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

    var $$RxEmber$rx$helpers$$get = Ember.get;
    var $$RxEmber$rx$helpers$$set = Ember.set;

    function $$RxEmber$rx$helpers$$action(outputProperty) {
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

    var $$RxEmber$rx$helpers$$rxAction = Ember.deprecateFunc('RxEmber.rxAction is deprecated, use RxEmber.action', $$RxEmber$rx$helpers$$action);

    function $$RxEmber$rx$helpers$$observable() {
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

    var $$RxEmber$rx$helpers$$rxInput = Ember.deprecateFunc('RxEmber.rxInput is deprecated. Use RxEmber.observable');

    function $$RxEmber$rx$helpers$$computedObservable(mapFn, deps) {
      if(arguments.length > 1) {
        deps = !Array.isArray(deps) ? [].slice.call(arguments, 1) : deps;
      } else {
        deps = [];
      }

      return function(key, value) {
        var backingField = '_' + key;
        if(!this[backingField]) {
          var depProps = deps.map(function(k) {
            var arrayIndex = k.indexOf('.[]');
            return arrayIndex !== -1 ? k.substring(0, arrayIndex) : k;
          });
          
          this[backingField] = new Rx.BehaviorSubject(this.getProperties.apply(this, depProps));
          
          var handler = function(){
            var props = this.getProperties.apply(this, depProps);
            this[backingField].onNext(props);
          };

          deps.forEach(function(depKey) {
            this.addObserver(depKey, this, function(){
              Ember.run.once(this, handler);
            });
          }, this);
        }

        return mapFn(this[backingField].asObservable());
      }.property();
    }

    function $$RxEmber$rx$helpers$$map(sourceProp, callback) {
        return function() {
            return this.get(sourceProp).map(callback.bind(this));
        }.property(sourceProp);
    }

    var $$RxEmber$rx$helpers$$rxMap = Ember.deprecateFunc('RxEmber.rxMap is deprecated. Use RxEmber.map', $$RxEmber$rx$helpers$$map);

    function $$RxEmber$rx$helpers$$scan(sourceProp, start, callback) {
      return function(){
        return this.get(sourceProp).scan(start, callback.bind(this));
      }.property(sourceProp);
    }

    var $$RxEmber$rx$helpers$$rxScan = Ember.deprecateFunc('RxEmber.rxScan is deprecated. Use RxEmber.scan', $$RxEmber$rx$helpers$$scan);

    function $$RxEmber$rx$helpers$$filter(sourceProp, callback) {
      return function() {
        return this.get(sourceProp).filter(callback.bind(this));
      }.property(sourceProp);
    }

    var $$RxEmber$rx$helpers$$rxFilter = Ember.deprecateFunc('RxEmber.rxFilter is deprecated. Use RxEmber.filter', $$RxEmber$rx$helpers$$filter);

    function $$RxEmber$rx$helpers$$observableFrom(propName) {
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

    var $$RxEmber$rx$helpers$$rxPropertyChanges = Ember.deprecateFunc('RxEmber.rxPropertyChanges is deprecated, use RxEmber.observableFrom', $$RxEmber$rx$helpers$$observableFrom);

    function $$RxEmber$rx$helpers$$bindTo(sourcePropName) {
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

    var rx$ember$umd$$RxEmber = {
        RxBindings: $$RxEmber$rx$bindings$$default,
        rxInput: $$RxEmber$rx$helpers$$rxInput,
        rxMap: $$RxEmber$rx$helpers$$rxMap,
        rxFilter: $$RxEmber$rx$helpers$$rxFilter,
        rxScan: $$RxEmber$rx$helpers$$rxScan,
        rxAction: $$RxEmber$rx$helpers$$rxAction,
        rxPropertyChanges: $$RxEmber$rx$helpers$$rxPropertyChanges,
      bindTo: $$RxEmber$rx$helpers$$bindTo,
      action: $$RxEmber$rx$helpers$$action,
      observableFrom: $$RxEmber$rx$helpers$$observableFrom,
      scan: $$RxEmber$rx$helpers$$scan,
      map: $$RxEmber$rx$helpers$$map,
      filter: $$RxEmber$rx$helpers$$filter,
      observable: $$RxEmber$rx$helpers$$observable,
      computedObservable: $$RxEmber$rx$helpers$$computedObservable
    };

    /* global define:true module:true window: true */
    if (typeof define === 'function' && define['amd']) {
      define(function() { return rx$ember$umd$$RxEmber; });
    } else if (typeof module !== 'undefined' && module['exports']) {
      module['exports'] = rx$ember$umd$$RxEmber;
    } else if (typeof this !== 'undefined') {
      this['RxEmber'] = rx$ember$umd$$RxEmber;
    }
}).call(this);

//# sourceMappingURL=rx-ember.js.map
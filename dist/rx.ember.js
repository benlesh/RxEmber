define("main", 
  ["rx-bindings","rx-helpers","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var RxBindings = __dependency1__["default"];
    var rxInput = __dependency2__.rxInput;
    var rxMap = __dependency2__.rxMap;
    var rxFilter = __dependency2__.rxFilter;
    var rxScan = __dependency2__.rxScan;
    var rxPropertyChanges = __dependency2__.rxPropertyChanges;
    var rxAction = __dependency2__.rxAction;

    __exports__["default"] = {
    	RxBindings: RxBindings,
    	rxInput: rxInput,
    	rxMap: rxMap,
    	rxFilter: rxFilter,
    	rxScan: rxScan,
    	rxPropertyChanges: rxPropertyChanges,
    	rxAction: rxAction
    };
  });
;define("rx-bindings", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];

    function noop() {}

    /**
      This mixin adds support for RxJS bindings to properties on an object.

      If you set `rxBindings` on the class to an object, the keys will be used as
      source names for observables, and the string values of those will be used as 
      property names to `set()` with the *"next"* value from the observable.

      It is important to call `subscribe()` on the instance that has been created
      in order to initialize the subscriptions.

      Likewise, `dispose()` should be called when it's desired to unsubscribe from 
      the observables.
      ### Example

            // controllers/foo.js
            export default Ember.Controller.extend(RxBindings, {
              rxBindings: {
                myObservable: 'valueToSet',
              },

              valueToSet: null,

              myObservable: function(){
                return Rx.Observable.range(0, 4);
              }.property(),
            });


            // routes/foo.js
            export default Ember.Route.extend({
              model: function(){
                return {};
              },

              activate: function() {
                this.controllerFor(this.routeName).subscribe();
              },

              deactivate: function(){
                this.controllerFor(this.routeName).dispose();
              },
            });

      @namespace mixins
      @class rx-bindings
    */
    __exports__["default"] = Ember.Mixin.create({
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
      willSubscribe: noop,

      /**
        An event hook that will be called just after the subscriptions to 
        the rxBinding observables are made.
        @property didSubscribe
        @type Function
        @default noop
      */
      didSubscribe: noop,
      
      /**
        An event hook that will be called just prior to disposing subscriptions
        @property willDispose
        @type Function
        @default noop
      */
      willDispose: noop,
      
      /**
        An event hook that will be called just after disposing subscriptions
        @property didSubscribe
        @type Function
        @default noop
      */
      didDispose: noop,
      
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
        @method addRxBinding
        @param source {string} the name of the observable property to subscribe to
        @param target {string|Object} the name of the property to update, or a configuration object.
        @return {Rx.Disposable} the rx disposable to remove the binding (unsubscribe).
      */
      addRxBinding: function(source, target) {
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
        Creates subscriptions from all items in `rxBindings` using `addRxBinding`.
        @method subscribe
      */
      subscribe: function(){
        this.willSubscribe.apply(this);
        var rxBindings = this.get('rxBindings');
        if(rxBindings) {
          Ember.keys(rxBindings).forEach(function(source) {
            var target = rxBindings[source];
            this.addRxBinding.call(this, source, target);
          }, this);
        }
        this.didSubscribe.apply(this);
      },
    });
  });
;define("rx-helpers", 
  [],
  function() {
    "use strict";
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
    function rxAction(outputProperty) {
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
    function rxInput() {
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
          
        return this[backingField].switch();
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
    function rxMap(sourceProp, callback) {
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
    function rxScan(sourceProp, start, callback) {
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
    function rxFilter(sourceProp, callback) {
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
    function rxPropertyChanges(propName) {
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
  });
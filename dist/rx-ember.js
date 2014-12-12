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
      }
    });

    function $$RxEmber$rx$helpers$$rxAction(outputProperty) {
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

    var $$RxEmber$rx$helpers$$backingUUID = 1;

    function $$RxEmber$rx$helpers$$rxInput() {
      var uuid = $$RxEmber$rx$helpers$$backingUUID++;
      var backingField = '_rxInput_' + uuid;
      
      return function(key, val){
        if(!this[backingField]) {
          this[backingField] = new Rx.BehaviorSubject();
        }    
        
        if(arguments.length > 1) {
          var next = val && val instanceof Rx.Observable ? val : Rx.Observable.empty();
          this[backingField].onNext(next);
        }
          
        return this[backingField]['switch']();
      }.property();
    }


    function $$RxEmber$rx$helpers$$rxMap(sourceProp, callback) {
        return function() {
            return this.get(sourceProp).map(callback.bind(this));
        }.property(sourceProp);
    }

    function $$RxEmber$rx$helpers$$rxScan(sourceProp, start, callback) {
      return function(){
        return this.get(sourceProp).scan(start, callback.bind(this));
      }.property(sourceProp);
    }

    function $$RxEmber$rx$helpers$$rxFilter(sourceProp, callback) {
      return function() {
        return this.get(sourceProp).filter(callback.bind(this));
      }.property(sourceProp);
    }

    function $$RxEmber$rx$helpers$$rxPropertyChanges(propName) {
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


    var rx$ember$umd$$RxEmber = {
        RxBindings: $$RxEmber$rx$bindings$$default,
        rxInput: $$RxEmber$rx$helpers$$rxInput,
        rxMap: $$RxEmber$rx$helpers$$rxMap,
        rxFilter: $$RxEmber$rx$helpers$$rxFilter,
        rxScan: $$RxEmber$rx$helpers$$rxScan,
        rxAction: $$RxEmber$rx$helpers$$rxAction,
        rxPropertyChanges: $$RxEmber$rx$helpers$$rxPropertyChanges
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
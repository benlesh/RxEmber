(function() {
    "use strict";
    function $$helpers$action$$action(outputProperty) {
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
    var $$helpers$action$$default = $$helpers$action$$action;
    function $$helpers$observable$$observable() {
      return Ember.computed(function(key, val){
        var backingField = '_' + key;
        if(!this[backingField]) {
          this[backingField] = new Rx.BehaviorSubject(Rx.Observable.empty());
        }

        if(arguments.length > 1) {
          var next = val && val instanceof Rx.Observable ? val : Rx.Observable.empty();
          this[backingField].onNext(next);
        }

        return this[backingField]['switch']();
      });
    }
    var $$helpers$observable$$default = $$helpers$observable$$observable;
    function $$helpers$computed$observable$$computedObservable(mapFn, deps) {
      if(arguments.length > 1) {
        deps = !Array.isArray(deps) ? [].slice.call(arguments, 1) : deps;
      } else {
        deps = [];
      }

      return Ember.computed(function(key) {
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
      });
    }
    var $$helpers$computed$observable$$default = $$helpers$computed$observable$$computedObservable;
    function $$helpers$observable$from$$observableFrom(propName) {
      var arrIndex = propName.indexOf('.[]');
      var prop = propName;
      if(arrIndex !== -1) {
        prop = propName.substring(0, arrIndex);
      }

      return Ember.computed(function() {
        var self = this;
        return Rx.Observable.create(function(observer) {
          var fn = function() {
            observer.onNext(self.get(prop));
          };

          self.addObserver(propName, fn);

          // this eager consumption is necessary due to lazy CP optimization preventing
          // observers from properly attaching unless the property is eagerly consumed
          self.get(propName);

          return function(){
            self.removeObserver(propName, fn);
          };
        });
      });
    }
    var $$helpers$observable$from$$default = $$helpers$observable$from$$observableFrom;
    /* globals Ember */ //HACK: because I'm sharing this with rx-ember

    var $$schedulers$ember$scheduler$$Scheduler = Rx.Scheduler;
    var $$schedulers$ember$scheduler$$SingleAssignmentDisposable = Rx.SingleAssignmentDisposable;

    function $$schedulers$ember$scheduler$$scheduleNow(state, action) {
        var scheduler = this;
        var disposable = new $$schedulers$ember$scheduler$$SingleAssignmentDisposable();
        $$schedulers$ember$scheduler$$scheduleEmberAction(disposable, this._queue, this._target, state, action, scheduler);
        return disposable;
    }

    function $$schedulers$ember$scheduler$$scheduleRelative(state, dueTime, action) {
        var dt = $$schedulers$ember$scheduler$$Scheduler.normalize(dueTime);
        var disposable = new $$schedulers$ember$scheduler$$SingleAssignmentDisposable();
        var target = this._target;
        var scheduler = this;

        setTimeout(function() {
            $$schedulers$ember$scheduler$$scheduleEmberAction(disposable, this._queue, target, state, action, scheduler);
        }, dt);

        return disposable;
    }

    function $$schedulers$ember$scheduler$$scheduleAbsolute(state, dueTime, action) {
        return this.scheduleWithRelativeAndState(state, dueTime - Date.now(), action);
    }

    function $$schedulers$ember$scheduler$$scheduleEmberAction(disposable, queue, target, state, action, scheduler) {
        Ember.run.schedule(queue, target, function() {
            if(!disposable.isDisposed) {
                disposable.setDisposable(action(scheduler, state));
            }
        });
    }

    function $$schedulers$ember$scheduler$$emberScheduler(queue, target) {
        var scheduler = new $$schedulers$ember$scheduler$$Scheduler(Date.now, $$schedulers$ember$scheduler$$scheduleNow, $$schedulers$ember$scheduler$$scheduleRelative, $$schedulers$ember$scheduler$$scheduleAbsolute);
        scheduler._target = target;
        scheduler._queue = queue;
        return scheduler;
    }
    var $$schedulers$ember$scheduler$$default = $$schedulers$ember$scheduler$$emberScheduler;
    function $$schedulers$ember$action$scheduler$$emberActionScheduler(target) {
        return $$schedulers$ember$scheduler$$default('actions', target);
    }
    var $$schedulers$ember$action$scheduler$$default = $$schedulers$ember$action$scheduler$$emberActionScheduler;
    function $$helpers$bind$to$$bindTo(sourcePropName) {
      return Ember.computed(sourcePropName, function(key, value) {
        var self = this;
        var backingPropName = '_' + key;
        var subscribedTo = backingPropName + '_observable';
        var observable = this.get(sourcePropName);

        Ember.assert('Must be applied to components only', this instanceof Ember.Component);

        if(!this._bindToDisposables) {
          this._bindToDisposables = new Rx.CompositeDisposable();

          Ember.addListener(this, 'willDestroyElement', this, function(){
            if(this._bindToDisposables && !this._bindToDisposables.isDisposed) {
              this._bindToDisposables.dispose();
            }
          });
        }

        if(this[subscribedTo] !== observable){
          this[subscribedTo] = observable;
          var backingDisposable = backingPropName + '_disposable';
          var disposable = this[backingDisposable];

          if(!disposable) {
            disposable = this[backingDisposable] = new Rx.SerialDisposable();
            this._bindToDisposables.add(disposable);
          }

          disposable.setDisposable(observable.observeOn($$schedulers$ember$action$scheduler$$default(self)).subscribe(function(nextValue) {
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
      });
    }
    var $$helpers$bind$to$$default = $$helpers$bind$to$$bindTo;

    var $$rx$ember$$RxEmber = {
      helpers: {
        action: $$helpers$action$$default,
        observable: $$helpers$observable$$default,
        computedObservable: $$helpers$computed$observable$$default,
        observableFrom: $$helpers$observable$from$$default,
        bindTo: $$helpers$bind$to$$default
      },

      schedulers: {
        emberScheduler: $$schedulers$ember$scheduler$$default,
        emberActionScheduler: $$schedulers$ember$action$scheduler$$default
      }
    }

    var $$rx$ember$$default = $$rx$ember$$RxEmber;

    /* global define:true module:true window: true */
    if (typeof define === 'function' && define['amd']) {
      define(function() { return $$rx$ember$$default; });
    } else if (typeof module !== 'undefined' && module['exports']) {
      module['exports'] = $$rx$ember$$default;
    } else if (typeof this !== 'undefined') {
      this['RxEmber'] = $$rx$ember$$default;
    }
}).call(this);

//# sourceMappingURL=rx-ember.js.map
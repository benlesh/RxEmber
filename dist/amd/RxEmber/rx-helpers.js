define("RxEmber/rx-helpers", ["exports"], function(__exports__) {
  "use strict";

  function __es6_export__(name, value) {
    __exports__[name] = value;
  }

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

  __es6_export__("rxAction", rxAction);

  var backingUUID = 1;

  function rxInput() {
    var uuid = backingUUID++;
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


  __es6_export__("rxInput", rxInput);
  function rxMap(sourceProp, callback) {
      return function() {
          return this.get(sourceProp).map(callback.bind(this));
      }.property(sourceProp);
  }

  __es6_export__("rxMap", rxMap);
  function rxScan(sourceProp, start, callback) {
    return function(){
      return this.get(sourceProp).scan(start, callback.bind(this));
    }.property(sourceProp);
  }

  __es6_export__("rxScan", rxScan);
  function rxFilter(sourceProp, callback) {
    return function() {
      return this.get(sourceProp).filter(callback.bind(this));
    }.property(sourceProp);
  }

  __es6_export__("rxFilter", rxFilter);
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


  __es6_export__("rxPropertyChanges", rxPropertyChanges);
});

//# sourceMappingURL=rx-helpers.js.map
import Ember from 'ember';

/**
  Creates a a property that returns an observable which is created
  from observed dependent property changes on the Ember object, 
  then mapped to an output observable with the mapping function 
  @method computedObservable
  @param mapFn {Function} the mapping function that receives an observable of dependent properties when changes occur
  @param deps {Array|Arguments} an array, or a series of arguments that are the string names of 
    dependent properties to include in the observed property changes passed to the mapping function.
  @return {Ember.ComputedProperty}
*/
export function computedObservable(mapFn, deps) {
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
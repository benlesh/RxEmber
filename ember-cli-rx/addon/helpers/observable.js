/**
  Creates a property that accepts Rx.Observables
  and returns a single observable that represents the latest observable
  passed.

  This can be used for any input to a component that is an observable.

  @method observable
  @return Ember.ComputedProperty
*/
export default function observable() {
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
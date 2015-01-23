/**
  Creates an observable from observed Ember property changes.

  In essence, this sets up an Ember `observes` that supplies values to an observable that this property will return.

  ### Example

        Ember.ObjectController.extend({
          foo: null,

          foos: observableFrom('foo'),

          accumulatedFoos: scan('foos', [], function(acc, foo) {
            acc.pushObject(foo);
            return acc;
          }),
        });

  @method observableFrom
  @param propName {string} the name of the property to observe changes of
  @return Ember.ComputedProperty
*/
export function observableFrom(propName) {
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
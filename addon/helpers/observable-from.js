/* globals Ember */

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
export default function observableFrom(propName) {
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

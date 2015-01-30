import emberActionScheduler from '../schedulers/ember-action-scheduler';

/**
  @method bindTo
  @param sourcePropName {String} the name of the property containing the Observable to bind this
    property to.
  @return {Ember.ComputedProperty}
*/
export default function bindTo(sourcePropName) {
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

      disposable.setDisposable(observable.observeOn(emberActionScheduler(self)).subscribe(function(nextValue) {
        console.debug('actually setting %s to %o', key, nextValue);
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
/* globals Ember */
import emberActionScheduler from '../schedulers/ember-action-scheduler';

/**
  @method bindTo
  @param sourcePropName {String} the name of the property containing the Observable to bind this
    property to.
  @return {Ember.ComputedProperty}
*/
export default function bindTo(sourcePropName) {
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

      disposable.setDisposable(observable.observeOn(emberActionScheduler(self)).subscribe(function(nextValue) {
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
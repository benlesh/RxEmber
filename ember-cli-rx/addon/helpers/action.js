/* globals Ember */ //HACK: because I'm sharing this with rx-ember

/**
  Wires up an action to feed an observable property.

  ### Example

        Ember.ObjectController.extend(RxBindings, {
          rxBindings: {
            'fooClickTallies': 'fooClickTally'
          },

          actions: {
            'fooClick': action('fooClicks'),
          },

          fooClicks: observable(),

          fooClickTallies: scan('fooClicks', 0, function(inc) {
            return inc++;
          }),

          fooClickTally: 0,
        });


        <button {{action 'fooClicks'}}>foo {{fooClickTally}}</button>

  @method action
  @param outputProperty {string} the name of the observable (observable) property to feed.
  @return {Function}
*/

export default function action(outputProperty) {
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
/* globals Rx, Ember, RxEmber, describe, it, spyOn */

var RxBindings = RxEmber.RxBindings;

describe('RxBindings', function(){
	it('should be an Ember.Mixin object', function(){
		expect(typeof RxBindings).toBe('object');
		expect(RxBindings instanceof Ember.Mixin).toBe(true);
	});

	it('should bind an observable to a property with rxBindings', function(){
		var FooClass = Ember.Object.extend(RxBindings, {
			rxBindings: {
				'stream': 'output'
			},

			stream: function() {
				return Rx.Observable.just(42);
			}.property(),

			output: null,
		});

		var foo = FooClass.create();

		foo.subscribe();

		expect(foo.get('output')).toBe(42);
	});

	it('should bind each "nexted" value into the property with rxBindings', function(){
		var FooClass = Ember.Object.extend(RxBindings, {
			rxBindings: {
				'subject': 'output'
			},

			subject: function() {
				return new Rx.Subject();
			}.property(),

			output: null,
		});

		var foo = FooClass.create();

		foo.subscribe();

		expect(foo.get('output')).toBe(null);

		foo.get('subject').onNext(1);

		expect(foo.get('output')).toBe(1);

		foo.get('subject').onNext(2);

		expect(foo.get('output')).toBe(2);
	});

  it('should be deprecated', function(){
    var FooClass = Ember.Object.extend(RxBindings, {});
    spyOn(Ember, 'deprecate');
    FooClass.create();
    expect(Ember.deprecate).toHaveBeenCalled();
  });
});

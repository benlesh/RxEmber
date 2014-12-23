/* globals Ember, Rx, RxEmber, describe, it, spyOn */

var observable 				= RxEmber.observable;
var filter 			  	= RxEmber.filter;
var map 					  = RxEmber.map;
var scan 					  = RxEmber.scan;
var observableFrom  = RxEmber.observableFrom;
var action 					= RxEmber.action;
var bindTo          = RxEmber.bindTo;

describe('helpers', function(){
	describe('observable', function(){
		it('should always supply an observable', function(){
			var FooClass = Ember.Object.extend({
				input: observable()
			});

			var foo = FooClass.create();

			expect(foo.get('input') instanceof Rx.Observable).toBe(true);
		});

		it('should always give the latest supplied observable and only require one subscription', function(done){
			var FooClass = Ember.Object.extend({
				input: observable()
			});

			var i = 0;
			var expectedResults = [23, 42, 'banana', 'stand'];

			var foo = FooClass.create({
				input: Rx.Observable.fromArray([23, 42]),
			});

			var subscription = foo.get('input').forEach(function(x) {
				console.log(expect);
				expect(x).toBe(expectedResults[i++]);

				if(i === expectedResults.length) {
					done();
				}
			});

			foo.set('input', Rx.Observable.fromArray(['banana', 'stand']));
		});
	});

	describe('filter', function(){
		it('should filter another observable property', function(done){
			var expectedResults = [2,4];

			var FooClass = Ember.Object.extend({
				source: function(){
					return Rx.Observable.fromArray([1,2,3,4,5]);
				}.property(),

				filtered: filter('source', function(n) {
					return n % 2 === 0;
				}),
			});

			var foo = FooClass.create();
			var i = 0;

			foo.get('filtered').forEach(function(n) {
				expect(n).toBe(expectedResults[i++]);

				if(i === expectedResults.length) {
					done();
				}
			});
		});
	});


	describe('map', function(){
		it('should map another observable property', function(done){
			var expectedResults = ['a1', 'a2', 'a3', 'a4', 'a5'];

			var FooClass = Ember.Object.extend({
				source: function(){
					return Rx.Observable.fromArray([1,2,3,4,5]);
				}.property(),

				mapped: map('source', function(n) {
					return 'a' + n;
				}),
			});

			var foo = FooClass.create();
			var i = 0;

			foo.get('mapped').forEach(function(n) {
				expect(n).toBe(expectedResults[i++]);

				if(i === expectedResults.length) {
					done();
				}
			});
		});
	});


	describe('scan', function(){
		it('should perform a scan on another observable property', function(done){
			var expectedResults = [1, 3, 6, 10, 15];

			var FooClass = Ember.Object.extend({
				source: function(){
					return Rx.Observable.fromArray([1,2,3,4,5]);
				}.property(),

				accumulated: scan('source', 0, function(acc, n) {
					return acc + n;
				}),
			});

			var foo = FooClass.create();
			var i = 0;

			foo.get('accumulated').forEach(function(n) {
				expect(n).toBe(expectedResults[i++]);

				if(i === expectedResults.length) {
					done();
				}
			});
		});
	});

	describe('observableFrom', function() {
		it('should observe property changes and emit them via an observable', function(done) {
			var expectedResults = ['Ben', 'Jeff', 'Ranjit'];

			var FooClass = Ember.Object.extend({
				name: null,

				names: observableFrom('name'),
			});

			var foo = FooClass.create();
			var i = 0;

			foo.get('names').forEach(function(x) {
				expect(x).toBe(expectedResults[i++]);
				if(i === expectedResults.length) {
					done();
				}
			});

			foo.set('name', 'Ben');
			foo.set('name', 'Jeff');
			foo.set('name', 'Ranjit');
		});
	});

	describe('action', function(){
    it('should create an observable of action arguments', function(done) {
			var expectedResults = [
				[1,2,3],
				['foo', 'bar', 'baz'],
				['Ocelot', 'buyer\'s', 'remorse']
			];

			var FooController = Ember.ObjectController.extend({
				doSomethings: observable(),

				actions: {
					doSomething: action('doSomethings')
				}
			});

			var ctrl = FooController.create({});
			var i = 0;

			ctrl.get('doSomethings').forEach(function(args) {
				expect(args).toEqual(expectedResults[i++]);

				if(i === expectedResults.length) {
					done();
				}
			});

			Ember.run(function(){
				ctrl.send('doSomething', 1, 2, 3);
			});
			Ember.run(function(){
				ctrl.send('doSomething', 'foo', 'bar', 'baz');
			});
			Ember.run(function(){
				ctrl.send('doSomething', 'Ocelot', 'buyer\'s', 'remorse');
			});
		});
	});

  describe('bindTo', function(){
    it('should bind to an observable in the specified property', function(){
      var FooClass = Ember.Object.extend(Ember.Evented, {
        things: function(){
          return Rx.Observable.just('thing 1');
        }.property(),

        thing: bindTo('things'),
      });

      var foo = FooClass.create();

      expect(foo.get('thing')).toBe('thing 1');
      expect(typeof foo._thing_disposable).toBe('object');
      expect(typeof foo._thing_disposable.dispose).toBe('function');
      spyOn(foo._thing_disposable, 'dispose').and.callThrough();

      foo.trigger('willDestroy');

      expect(foo._thing_disposable.dispose).toHaveBeenCalled();
    });

  });
});






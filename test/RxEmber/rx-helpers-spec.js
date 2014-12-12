/* globals Ember, Rx, RxEmber */

var rxInput = RxEmber.rxInput;
var rxFilter = RxEmber.rxFilter;

describe('helpers', function(){
	describe('rxInput', function(){
		it('should always supply an observable', function(){
			var FooClass = Ember.Object.extend({
				input: rxInput()
			});

			var foo = FooClass.create();

			expect(foo.get('input') instanceof Rx.Observable).toBe(true);
		});

		it('should always give the latest supplied observable and only require one subscription', function(done){
			var FooClass = Ember.Object.extend({
				input: rxInput()
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

	describe('rxFilter', function(){
		it('should filter another observable property', function(done){
			var expectedResults = [2,4];

			var FooClass = Ember.Object.extend({
				source: function(){
					return Rx.Observable.fromArray([1,2,3,4,5]);
				}.property(),

				filtered: rxFilter('source', function(n) {
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
		})
	});
});
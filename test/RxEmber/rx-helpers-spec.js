/* globals Ember, Rx, RxEmber, describe, it, spyOn */

/***********
 * IMPORTANT NOTE: All primary unit tests are part of the ember-cli-rx project
 * which can be found here: http://github.com/blesh/ember-cli-rx
 **********/

var observable 				 = RxEmber.helpers.observable;
var observableFrom  	 = RxEmber.helpers.observableFrom;
var action 						 = RxEmber.helpers.action;
var bindTo          	 = RxEmber.helpers.bindTo;
var computedObservable = RxEmber.helpers.computedObservable;

describe('helpers', function(){
	it('should exist', function(){
		expect(typeof RxEmber.helpers).toBe('object');
	});

	it('should have an observable helper', function(){
		expect(typeof RxEmber.helpers.observable).toBe('function');
	});

	it('should have an observableFrom helper', function(){
		expect(typeof RxEmber.helpers.observableFrom).toBe('function');
	});

	it('should have a bindTo helper', function(){
		expect(typeof RxEmber.helpers.bindTo).toBe('function');
	});

	it('should have an action helper', function(){
		expect(typeof RxEmber.helpers.action).toBe('function');
	});

	it('should have an computedObservable helper', function(){
		expect(typeof RxEmber.helpers.computedObservable).toBe('function');
	});
});

describe('schedulers', function(){
	it('should exist', function(){
		expect(typeof RxEmber.schedulers).toBe('object');
	});

	it('should have an emberScheduler method', function(){
		expect(typeof RxEmber.schedulers.emberScheduler).toBe('function');
	});

	it('should have an emberActionScheduler method', function(){
		expect(typeof RxEmber.schedulers.emberActionScheduler).toBe('function');
	});
});





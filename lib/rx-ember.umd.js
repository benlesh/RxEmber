import {
	RxBindings,
	rxInput,
	rxMap,
	rxFilter,
	rxScan,
	rxAction,
	rxPropertyChanges
} from './rx-ember';

var RxEmber = {
	RxBindings: RxBindings,
	rxInput: rxInput,
	rxMap: rxMap,
	rxFilter: rxFilter,
	rxScan: rxScan,
	rxAction: rxAction,
	rxPropertyChanges: rxPropertyChanges,
};

/* global define:true module:true window: true */
if (typeof define === 'function' && define['amd']) {
  define(function() { return RxEmber; });
} else if (typeof module !== 'undefined' && module['exports']) {
  module['exports'] = RxEmber;
} else if (typeof this !== 'undefined') {
  this['RxEmber'] = RxEmber;
}
import {
	RxBindings,
	rxInput,
	rxMap,
	rxFilter,
	rxScan,
	rxAction,
	rxPropertyChanges,
  bindTo,
  action,
  observableFrom,
  scan,
  map,
  filter,
  observable,
  computedObservable
} from './rx-ember';

var RxEmber = {
	RxBindings: RxBindings,
	rxInput: rxInput,
	rxMap: rxMap,
	rxFilter: rxFilter,
	rxScan: rxScan,
	rxAction: rxAction,
	rxPropertyChanges: rxPropertyChanges,
  bindTo: bindTo,
  action: action,
  observableFrom: observableFrom,
  scan: scan,
  map: map,
  filter: filter,
  observable: observable,
  computedObservable: computedObservable
};

/* global define:true module:true window: true */
if (typeof define === 'function' && define['amd']) {
  define(function() { return RxEmber; });
} else if (typeof module !== 'undefined' && module['exports']) {
  module['exports'] = RxEmber;
} else if (typeof this !== 'undefined') {
  this['RxEmber'] = RxEmber;
}

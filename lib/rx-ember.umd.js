import RxEmber from './rx-ember';

/* global define:true module:true window: true */
if (typeof define === 'function' && define['amd']) {
  define(function() { return RxEmber; });
} else if (typeof module !== 'undefined' && module['exports']) {
  module['exports'] = RxEmber;
} else if (typeof this !== 'undefined') {
  this['RxEmber'] = RxEmber;
}

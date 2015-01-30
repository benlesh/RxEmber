define(
  "rx-ember.umd",
  ["./rx-ember", "exports"],
  function(rx$ember$$, __exports__) {
    "use strict";

    function __es6_export__(name, value) {
      __exports__[name] = value;
    }

    var RxEmber;
    RxEmber = rx$ember$$["default"];

    /* global define:true module:true window: true */
    if (typeof define === 'function' && define['amd']) {
      define(function() { return RxEmber; });
    } else if (typeof module !== 'undefined' && module['exports']) {
      module['exports'] = RxEmber;
    } else if (typeof this !== 'undefined') {
      this['RxEmber'] = RxEmber;
    }
  }
);

//# sourceMappingURL=rx-ember.umd.js.map
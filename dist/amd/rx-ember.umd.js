define(
  "rx-ember.umd",
  ["./rx-ember", "exports"],
  function(rx$ember$$, __exports__) {
    "use strict";

    function __es6_export__(name, value) {
      __exports__[name] = value;
    }

    var RxBindings;
    RxBindings = rx$ember$$["RxBindings"];
    var rxInput;
    rxInput = rx$ember$$["rxInput"];
    var rxMap;
    rxMap = rx$ember$$["rxMap"];
    var rxFilter;
    rxFilter = rx$ember$$["rxFilter"];
    var rxScan;
    rxScan = rx$ember$$["rxScan"];
    var rxAction;
    rxAction = rx$ember$$["rxAction"];
    var rxPropertyChanges;
    rxPropertyChanges = rx$ember$$["rxPropertyChanges"];
    var bindTo;
    bindTo = rx$ember$$["bindTo"];
    var action;
    action = rx$ember$$["action"];
    var observableFrom;
    observableFrom = rx$ember$$["observableFrom"];
    var scan;
    scan = rx$ember$$["scan"];
    var map;
    map = rx$ember$$["map"];
    var filter;
    filter = rx$ember$$["filter"];
    var observable;
    observable = rx$ember$$["observable"];
    var computedObservable;
    computedObservable = rx$ember$$["computedObservable"];

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
  }
);

//# sourceMappingURL=rx-ember.umd.js.map
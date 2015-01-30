define(
  "rx-ember",
  ["../../ember-cli-rx/addon/helpers", "../../ember-cli-rx/addon/schedulers", "exports"],
  function(
    $$$$$$ember$cli$rx$addon$helpers$$,
    $$$$$$ember$cli$rx$addon$schedulers$$,
    __exports__) {
    "use strict";

    function __es6_export__(name, value) {
      __exports__[name] = value;
    }

    var action;
    action = $$$$$$ember$cli$rx$addon$helpers$$["action"];
    var observable;
    observable = $$$$$$ember$cli$rx$addon$helpers$$["observable"];
    var computedObservable;
    computedObservable = $$$$$$ember$cli$rx$addon$helpers$$["computedObservable"];
    var observableFrom;
    observableFrom = $$$$$$ember$cli$rx$addon$helpers$$["observableFrom"];
    var bindTo;
    bindTo = $$$$$$ember$cli$rx$addon$helpers$$["bindTo"];
    var emberScheduler;
    emberScheduler = $$$$$$ember$cli$rx$addon$schedulers$$["emberScheduler"];
    var emberActionScheduler;
    emberActionScheduler = $$$$$$ember$cli$rx$addon$schedulers$$["emberActionScheduler"];

    var RxEmber = {
      helpers: {
        action: action,
        observable: observable,
        computedObservable: computedObservable,
        observableFrom: observableFrom,
        bindTo: bindTo
      },

      schedulers: {
        emberScheduler: emberScheduler,
        emberActionScheduler: emberActionScheduler
      }
    }

    __es6_export__("default", RxEmber);
  }
);

//# sourceMappingURL=rx-ember.js.map
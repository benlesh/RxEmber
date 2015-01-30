import {
  action,
  observable,
  computedObservable, 
  observableFrom,
  bindTo
} from '../../ember-cli-rx/addon/helpers';

import {
  emberScheduler,
  emberActionScheduler
} from '../../ember-cli-rx/addon/schedulers';

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

export default RxEmber;

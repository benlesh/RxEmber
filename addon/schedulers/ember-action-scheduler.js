import emberScheduler from './ember-scheduler';

export default function emberActionScheduler(target) {
	return emberScheduler('action', target);
}
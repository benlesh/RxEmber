import Ember from 'ember';

var Scheduler = Rx.Scheduler;
var SingleAssignmentDisposable = Rx.SingleAssignmentDisposable;

function scheduleNow(state, action) {
	let disposable = new SingleAssignmentDisposable();
	scheduleEmberAction(disposable, this._queue, this._target, state, action);
	return disposable;
}

function scheduleRelative(state, dueTime, action) {
	let dt = Scheduler.normalize(dueTime);
	let disposable = new SingleAssignmentDisposable();
	let target = this._target;

	setTimeout(() => {
		scheduleEmberAction(disposable, this._queue, target, state, action);
	}, dt);

	return disposable;
}

function scheduleAbsolute(state, dueTime, action) {
	return this.scheduleWithRelativeAndState(state, dueTime - Date.now(), action);
}

function scheduleEmberAction(disposable, target, queue, state, action) {
	Ember.run.schedule(queue, target, () => {
		if(!disposable.isDisposed) {
			disposable.setDisposable(action(state));
		}
	});
}

/**
	Creates an Rx Scheduler that uses a specified Ember Run Loop Queue.
	@method emberScheduler
	@param queue {String} the name of the ember queue to create the Rx Scheduler for
	@param target {Ember.Object} the object to use as the context of the Ember run schedule
	@return {Rx.Scheduler}
*/
export default function emberScheduler(queue, target) {
	let scheduler = new Scheduler(Date.now, scheduleNow, scheduleRelative, scheduleAbsolute);
	scheduler._target = target;
	scheduler._queue = queue;
	return scheduler;
}
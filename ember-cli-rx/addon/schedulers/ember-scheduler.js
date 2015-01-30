/* globals Ember */ //HACK: because I'm sharing this with rx-ember

var Scheduler = Rx.Scheduler;
var SingleAssignmentDisposable = Rx.SingleAssignmentDisposable;

function scheduleNow(state, action) {
	var scheduler = this;
	var disposable = new SingleAssignmentDisposable();
	scheduleEmberAction(disposable, this._queue, this._target, state, action, scheduler);
	return disposable;
}

function scheduleRelative(state, dueTime, action) {
	var dt = Scheduler.normalize(dueTime);
	var disposable = new SingleAssignmentDisposable();
	var target = this._target;
	var scheduler = this;

	setTimeout(function() {
		scheduleEmberAction(disposable, this._queue, target, state, action, scheduler);
	}, dt);

	return disposable;
}

function scheduleAbsolute(state, dueTime, action) {
	return this.scheduleWithRelativeAndState(state, dueTime - Date.now(), action);
}

function scheduleEmberAction(disposable, queue, target, state, action, scheduler) {
	Ember.run.schedule(queue, target, function() {
		if(!disposable.isDisposed) {
			disposable.setDisposable(action(scheduler, state));
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
	var scheduler = new Scheduler(Date.now, scheduleNow, scheduleRelative, scheduleAbsolute);
	scheduler._target = target;
	scheduler._queue = queue;
	return scheduler;
}
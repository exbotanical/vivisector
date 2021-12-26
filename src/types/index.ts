// valid state
export type ISubject = any[] | Record<PropertyKey, any>;

// valid subscribable events
export type ISubscriptionEvent = 'add' | 'batched' | 'del' | 'set';

// core Vivisected object API
export type IVivisectorApi<S> = S & {
	readonly subscribe: ISubscription<S>;
	readonly unsubscribe: ISubscription<S>;
};

// Done function for state mutation committal
export interface IDoneFunction {
	(commit: boolean): void;
}

// Subscriber function options
export interface ISubscriptionOpts {
	alwaysCommit?: boolean;
}

// Represents a subscription to an event
export interface ISubscription<S> {
	(
		eventName: ISubscriptionEvent,
		handler: ISubscriptionCallback<S>,
		opts?: ISubscriptionOpts
	): IVivisectorApi<S>;
}

// Store of subscriptions to subscribable events
export type ISubscriptionStore<S> = {
	[key in ISubscriptionEvent]: Set<{
		// TODO tether
		handler: ISubscriptionCallback<S>;
		alwaysCommit: boolean;
	}>;
};

// Callback to be invoked when a subscription is fired
export interface ISubscriptionCallback<S> {
	(e: ISubscriptionEventMetadata<S>, done: IDoneFunction): void;
}

// Subscribable event metadata passed to subscription callbacks
export interface ISubscriptionEventMetadata<S> {
	type: ISubscriptionEvent;
	prevState: S;
	nextState: S;
}

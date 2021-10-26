// valid state
export type ISubject = Record<PropertyKey, any> | any[];

// valid subscribable events
export type ISubscriptionEvent = 'add' | 'del' | 'set' | 'batched';

// core Vivisected object API
export type IVivisectorApi = {
	readonly subscribe: ISubscription;
	readonly unsubscribe: ISubscription;
} & ISubject;

// Done function for state mutation committal
export interface IDoneFunction {
	(commit: boolean): void;
}

// Subscriber function options
export interface ISubscriptionOpts {
	alwaysCommit?: boolean;
}

// Represents a subscription to an event
export interface ISubscription {
	(
		eventName: ISubscriptionEvent,
		handler: ISubscriptionCallback,
		opts?: ISubscriptionOpts
	): IVivisectorApi;
}

// Store of subscriptions to subscribable events
export type ISubscriptionStore = {
	[key in ISubscriptionEvent]: Set<{
		// TODO tether
		handler: ISubscriptionCallback;
		alwaysCommit: boolean;
	}>;
};

// Callback to be invoked when a subscription is fired
export interface ISubscriptionCallback {
	(e: ISubscriptionEventMetadata, done: IDoneFunction): void;
}

// Subscribable event metadata passed to subscription callbacks
export interface ISubscriptionEventMetadata {
	type: ISubscriptionEvent;
	prevState: ISubject;
	nextState: ISubject;
}

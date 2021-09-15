export enum VX_EVENT_TYPE {
	ADD = 'add',
	DEL = 'del',
	SET = 'set',
	BATCHED = 'batched'
}

export enum VX_LISTENER_INTERNALS {
	ADD = 'addEventListener',
	REM = 'removeEventListener'
}

export interface VxEventedObject {
	readonly [VX_LISTENER_INTERNALS.ADD]: VxEventRegistrar;
	readonly [VX_LISTENER_INTERNALS.REM]: VxEventRegistrar;
	[k: string]: any;
}

export interface SourceReference {
	filename: string;
	lineno: number;
}

export interface DoneFunction {
	(commit: boolean): void;
}

export interface DoneBuilder {
	(ret: Function): DoneFunction;
}

export interface VxAddEventListenerOpts {
	alwaysCommit?: boolean;
}

export interface VxEventRegistrar {
	(
		eventName: VX_EVENT_TYPE,
		handler: VxEventHandler,
		opts?: VxAddEventListenerOpts
	): VxEventedObject;
}

export type VxState = object|any[];

export type VxEvent<T extends VxState> = {
	type: VX_EVENT_TYPE;
	prevState: T;
	nextState: T;
};

export type VxEventHandler = (e: VxEvent<VxState>, done: DoneFunction) => void;

export type VxEventHandlerMetaData = {
	alwaysCommit: boolean;
	handler: VxEventHandler;
};

export type VxEventHandlerStore = {
	[key in VX_EVENT_TYPE]: Set<VxEventHandlerMetaData>;
};

export type VxExceptionArguments = {
	reason: string;
	source?: SourceReference;
};

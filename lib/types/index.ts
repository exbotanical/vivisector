export enum VX_EVENT_TYPE {
  ADD = 'add',
  DEL = 'del',
  SET = 'set'
};

export enum VX_LISTENER_INTERNALS {
  ADD = 'addEventListener',
  REM = 'removeEventListener'
};

export type VxState = object|Array<any>; // eslint-disable-line @typescript-eslint/no-explicit-any

export type VxEvent<T> = {
  type: VX_EVENT_TYPE;
  prevState: T;
  nextState: T;
};

export type VxEventHandler = (e: VxEvent<VxState>, done: DoneFunction) => void;

export type VxEventRegistrar = (eventName: VX_EVENT_TYPE, handler: VxEventHandler) => VxEventedObject;

export type VxEventHandlerStore = {
  [key in VX_EVENT_TYPE]: VxEventHandler[];
};

export type VxExceptionArguments = {
	reason: string;
	source?: SourceReference;
};

export interface VxEventedObject {
  readonly [VX_LISTENER_INTERNALS.ADD]: VxEventRegistrar;
  readonly [VX_LISTENER_INTERNALS.REM]: VxEventRegistrar;
	[k: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

export interface SourceReference {
	filename: string;
	lineno: number;
};

export interface DoneFunction {
	(commit: boolean): void;
};

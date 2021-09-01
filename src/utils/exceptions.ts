import {
	SourceReference,
	VxExceptionArguments
} from '../types/base.types';

abstract class BaseVxError extends Error {
	constructor (message: string) {
		super(message);

		// https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
		Object.setPrototypeOf(this, BaseVxError.prototype);
	}
}

class VxError extends BaseVxError {
	constructor (message: string) {
		super(message);

		Object.setPrototypeOf(this, VxError.prototype);
	}
}

export class VxException {
	public reason: string;
	public source?: SourceReference;

	constructor ({ reason, source }: VxExceptionArguments) {
		this.reason = reason;
		this.source = source;
	}

	static create (instance: VxException): VxError {
		return new VxError(instance.serialize());
	}

	serializeSource (): string {
		if (!this.source) return '';

		const { filename, lineno } = this.source;

		return `at ${filename}, Ln ${lineno}`;
	}

	serialize (): string {
		return `${this.reason} ${this.serializeSource()}`;
	}
}

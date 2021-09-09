import {
	SourceReference,
	VxExceptionArguments
} from '../types';

/**
 * @summary Base implementation model for extended errors
 */
abstract class BaseVxError extends Error {
	constructor (message: string) {
		super(message);

		/**
		 * @see https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
		 */
		Object.setPrototypeOf(this, BaseVxError.prototype);
	}
}

/**
 * Base implementation for errors
 */
export class VxError extends BaseVxError {
	constructor (message: string) {
		super(message);

		Object.setPrototypeOf(this, VxError.prototype);
	}
}

/**
 * @summary Exception metadata builder
 */
export class VxException {
	public reason: string;
	public source?: SourceReference;

	constructor ({ reason, source }: VxExceptionArguments) {
		this.reason = reason;
		this.source = source;
	}

	/**
	 * @summary Build an error object with the given exception metadata instance
	 * @param {VxException} instance
	 * @returns {VxError}
	 */
	static create (instance: VxException): VxError {
		return new VxError(instance.serialize());
	}

	/**
	 * @summary Serialize the source metadata into a string
	 * @returns {string}
	 */
	serializeSource (): string {
		if (!this.source) return '';

		const { filename, lineno } = this.source;

		return `at ${filename}, Ln ${lineno}`;
	}

	/**
	 * @summary Serialize the exception metadata into a string
	 * @returns {string}
	 */
	serialize (): string {
		return `${this.reason} ${this.serializeSource()}`;
	}
}

/* eslint-disable max-classes-per-file */
interface ISourceReference {
	filename: string;
	lineno: number;
}

interface IExceptionArguments {
	reason: string;
	source?: ISourceReference;
}

/**
 * Base implementation model for extended errors
 *
 * @internal
 */
abstract class BaseVxError extends Error {
	constructor(message: string) {
		super(message);

		/**
		 * @see https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
		 */
		Object.setPrototypeOf(this, BaseVxError.prototype);
	}
}

/**
 * Base implementation for errors
 *
 * @internal
 */
export class VxError extends BaseVxError {
	constructor(message: string) {
		super(message);

		Object.setPrototypeOf(this, VxError.prototype);
	}
}

/**
 * Exception metadata builder
 *
 * @internal
 */
export class VxException {
	public reason: string;

	public source?: ISourceReference;

	constructor({ reason, source }: IExceptionArguments) {
		this.reason = reason;
		this.source = source;
	}

	/**
	 * Build an error object with the given exception metadata instance
	 * @param instance
	 */
	static create(instance: VxException): VxError {
		return new VxError(instance.serialize());
	}

	/**
	 * Serialize the source metadata into a string
	 */
	serializeSource(): string {
		if (!this.source) return '';

		const { filename, lineno } = this.source;

		return ` at ${filename}, Ln ${lineno}`;
	}

	/**
	 * Serialize the exception metadata into a string
	 */
	serialize(): string {
		return `${this.reason}${this.serializeSource()}`;
	}
}

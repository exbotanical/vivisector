"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.VxException = exports.VxError = void 0;
/**
 * @summary Base implementation model for extended errors
 */
var BaseVxError = /** @class */ (function (_super) {
    __extends(BaseVxError, _super);
    function BaseVxError(message) {
        var _this = _super.call(this, message) || this;
        /**
         * @see https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
         */
        Object.setPrototypeOf(_this, BaseVxError.prototype);
        return _this;
    }
    return BaseVxError;
}(Error));
/**
 * Base implementation for errors
 */
var VxError = /** @class */ (function (_super) {
    __extends(VxError, _super);
    function VxError(message) {
        var _this = _super.call(this, message) || this;
        Object.setPrototypeOf(_this, VxError.prototype);
        return _this;
    }
    return VxError;
}(BaseVxError));
exports.VxError = VxError;
/**
 * @summary Exception metadata builder
 */
var VxException = /** @class */ (function () {
    function VxException(_a) {
        var reason = _a.reason, source = _a.source;
        this.reason = reason;
        this.source = source;
    }
    /**
     * @summary Build an error object with the given exception metadata instance
     * @param {VxException} instance
     * @returns {VxError}
     */
    VxException.create = function (instance) {
        return new VxError(instance.serialize());
    };
    /**
     * @summary Serialize the source metadata into a string
     * @returns {string}
     */
    VxException.prototype.serializeSource = function () {
        if (!this.source)
            return '';
        var _a = this.source, filename = _a.filename, lineno = _a.lineno;
        return "at " + filename + ", Ln " + lineno;
    };
    /**
     * @summary Serialize the exception metadata into a string
     * @returns {string}
     */
    VxException.prototype.serialize = function () {
        return this.reason + " " + this.serializeSource();
    };
    return VxException;
}());
exports.VxException = VxException;

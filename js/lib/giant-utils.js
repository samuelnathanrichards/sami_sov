/*jshint node:true */

/** @namespace */
var $utils = {};

/** @namespace */
var $assertion = $assertion || require('giant-assertion');

/** @namespace */
var $oop = $oop || require('giant-oop');

/**
 * Native string class.
 * @name String
 * @class
 */

/**
 * Native array class.
 * @name Array
 * @class
 */

/**
 * Interface that represents any object, or class that implements a .toString() method.
 * Instances of Stringifiable classes may be passed around like strings where they're expected alongside strings.
 * @name $utils.Stringifiable
 * @class
 * @extends Object.prototype
 * @see $utils.Stringifier
 */

/**
 * @name $utils.Stringifiable#toString
 * @function
 * @returns {string}
 */

$oop.postpone($utils, 'Stringifier', function () {
    "use strict";

    var base = $oop.Base,
        self = base.extend();

    /**
     * Serializes variables. Returns strings unchanged, converts numbers and booleans to string,
     * calls .toString() on Objects, returns empty string for undefined, null, and functions.
     * @class
     * @extends $oop.Base
     */
    $utils.Stringifier = self
        .addMethods(/** @lends $utils.Stringifier# */{
            /**
             * @param {*} [stringifiable]
             * @returns {string}
             */
            stringify: function (stringifiable) {
                switch (typeof stringifiable) {
                case 'string':
                    return stringifiable;
                case 'object':
                    if (stringifiable instanceof Object) {
                        return stringifiable.toString();
                    } else {
                        return '';
                    }
                    break;
                case 'boolean':
                case 'number':
                    return String(stringifiable);
                default:
                case 'function':
                case 'undefined':
                    return '';
                }
            }
        });
});

$oop.postpone($utils, 'StringUtils', function () {
    "use strict";

    var base = $oop.Base,
        self = base.extend();

    /**
     * @class
     * @extends $oop.Base
     */
    $utils.StringUtils = self
        .addMethods(/** @lends $utils.StringUtils */{
            /**
             * @param {number} value
             * @param {number} targetLength
             * @returns {string}
             */
            padLeft: function (value, targetLength) {
                var asString = value.toString(),
                    length = asString.length;

                return length < targetLength ?
                    new Array(targetLength - length + 1).join('0') + asString :
                    asString.substr(-targetLength);
            },

            /**
             * Splits string along delimiter safely, ignoring backslash-escaped versions of the delimiter.
             * @param {string} str
             * @param {string} delimiter
             * @returns {string[]}
             */
            safeSplit: function (str, delimiter) {
                var reComponents = new RegExp(
                        '([^\\\\\\' + delimiter + ']+(\\\\' + delimiter + '|\\\\)*)*(?=' + delimiter + '|$)', 'g'),
                    matched = str.match(reComponents),
                    matchCount = matched.length,
                    result = [],
                    i, match;

                // filtering out extra empty strings introduced by the regex match
                for (i = 0; i < matchCount; i++) {
                    match = matched[i];
                    result.push(match);
                    if (match && !matched[i + 1]) {
                        i++;
                    }
                }

                return result;
            },

            /**
             * Escapes the specified characters with backslash.
             * TODO: Remove string conversion in next minor version.
             * @param {string} str
             * @param {string} charsToEscape
             * @returns {string}
             */
            escapeChars: function (str, charsToEscape) {
                var optionsExpression = charsToEscape.split('').join('|'),
                    reEscape = new RegExp(optionsExpression, 'g');
                return String(str).replace(reEscape, '\\$&');
            },

            /**
             * Un-escapes backslash-escaped characters.
             * TODO: Remove string conversion in next minor version.
             * @param {string} str
             * @param {string} charsToUnescape
             * @returns {string}
             */
            unescapeChars: function (str, charsToUnescape) {
                var optionsExpression = charsToUnescape.split('').join('|'),
                    reEscape = new RegExp('\\\\(\\' + optionsExpression + ')', 'g');
                return String(str).replace(reEscape, '$1');
            }
        });
});

(function () {
    "use strict";

    $oop.extendBuiltIn(Array.prototype, /** @lends Array# */{
        /**
         * URI encodes all items of an array.
         * @returns {string[]} Array of URI-encoded strings
         */
        toUriEncoded: function () {
            var result = [],
                i;
            for (i = 0; i < this.length; i++) {
                result.push(encodeURI(this[i]));
            }
            return result;
        },

        /**
         * URI decodes all items of an array.
         * @returns {string[]} Array of plain strings
         */
        toUriDecoded: function () {
            var result = [],
                i;
            for (i = 0; i < this.length; i++) {
                result.push(decodeURI(this[i]));
            }
            return result;
        }
    });
}());

/**
 * @name $utils.Thenable
 * @class
 * @extends Object
 */

/**
 * @name $utils.Thenable#then
 * @method
 * @param {function} [successHandler]
 * @param {function} [failureHandler]
 * @param {function} [progressHandler]
 * @returns {$utils.Thenable}
 */

(function () {
    "use strict";

    $assertion.addTypes(/** @lends $assertion */{
        /**
         * @param {$utils.Thenable} expr
         */
        isThenable: function (expr) {
            return expr && typeof expr.then === 'function';
        }
    });
}());

$oop.postpone($utils, 'Deferred', function () {
    "use strict";

    var base = $oop.Base,
        self = base.extend();

    /**
     * @name $utils.Deferred.create
     * @function
     * @returns {$utils.Deferred}
     */

    /**
     * @class
     * @extends $oop.Base
     */
    $utils.Deferred = self
        .addMethods(/** @lends $utils.Deferred# */{
            /** @ignore */
            init: function () {
                /**
                 * @type {$utils.Promise}
                 */
                this.promise = $utils.Promise.create();
            },

            /**
             * @returns {$utils.Deferred}
             */
            resolve: function () {
                var deferredArguments = arguments,
                    promise = this.promise;

                if (promise.status === $utils.Promise.PROMISE_STATE_UNFULFILLED) {
                    // setting status
                    promise.status = $utils.Promise.PROMISE_STATE_FULFILLED;

                    // storing arguments
                    promise.deferredArguments = deferredArguments;

                    // calling success handlers
                    promise.successHandlers.forEach(function (handler) {
                        handler.apply(promise, deferredArguments);
                    });
                }

                return this;
            },

            /**
             * @returns {$utils.Deferred}
             */
            reject: function () {
                var deferredArguments = arguments,
                    promise = this.promise;

                if (promise.status === $utils.Promise.PROMISE_STATE_UNFULFILLED) {
                    // setting status
                    promise.status = $utils.Promise.PROMISE_STATE_FAILED;

                    // storing arguments
                    promise.deferredArguments = deferredArguments;

                    // calling failure handlers
                    promise.failureHandlers.forEach(function (handler) {
                        handler.apply(promise, deferredArguments);
                    });
                }

                return this;
            },

            /**
             * @returns {$utils.Deferred}
             */
            notify: function () {
                var args = arguments,
                    promise = this.promise;

                if (promise.status === $utils.Promise.PROMISE_STATE_UNFULFILLED) {
                    // storing arguments
                    promise.notificationArguments.push(args);

                    // calling progress handlers
                    promise.progressHandlers.forEach(function (handler) {
                        handler.apply(promise, args);
                    });
                }

                return this;
            }
        });
});

$oop.postpone($utils, 'Promise', function () {
    "use strict";

    var base = $oop.Base,
        self = base.extend(),
        slice = Array.prototype.slice;

    /**
     * Do not create Promise instances directly. Promises are only to be used in connection with Deferred instances.
     * @name $utils.Promise.create
     * @function
     * @returns {$utils.Promise}
     * @private
     */

    /**
     * Non-interactive synchronous implementation of Promises/A.
     * @link http://wiki.commonjs.org/wiki/Promises/A
     * @class
     * @extends $oop.Base
     * @extends $utils.Thenable
     */
    $utils.Promise = self
        .addConstants(/** @lends $utils.Promise */{
            /** @constant */
            PROMISE_STATE_UNFULFILLED: 'unfulfilled',

            /** @constant */
            PROMISE_STATE_FULFILLED: 'fulfilled',

            /** @constant */
            PROMISE_STATE_FAILED: 'failed'
        })
        .addMethods(/** @lends $utils.Promise# */{
            /** @ignore */
            init: function () {
                /**
                 * @type {string}
                 */
                this.status = self.PROMISE_STATE_UNFULFILLED;

                /**
                 * @type {Array}
                 */
                this.deferredArguments = undefined;

                /**
                 * @type {Arguments[]}
                 */
                this.notificationArguments = [];

                /**
                 * @type {function[]}
                 */
                this.successHandlers = [];

                /**
                 * @type {function[]}
                 */
                this.failureHandlers = [];

                /**
                 * @type {function[]}
                 */
                this.progressHandlers = [];
            },

            /**
             * @param {function} [successHandler]
             * @param {function} [failureHandler]
             * @param {function} [progressHandler]
             * @returns {$utils.Promise}
             */
            then: function (successHandler, failureHandler, progressHandler) {
                if (successHandler) {
                    switch (this.status) {
                    case self.PROMISE_STATE_FULFILLED:
                        successHandler.apply(this, this.deferredArguments);
                        break;
                    case self.PROMISE_STATE_UNFULFILLED:
                        this.successHandlers.push(successHandler);
                        break;
                    }
                }

                if (failureHandler) {
                    switch (this.status) {
                    case self.PROMISE_STATE_FAILED:
                        failureHandler.apply(this, this.deferredArguments);
                        break;
                    case self.PROMISE_STATE_UNFULFILLED:
                        this.failureHandlers.push(failureHandler);
                        break;
                    }
                }

                if (progressHandler) {
                    if (this.status === self.PROMISE_STATE_UNFULFILLED) {
                        // adding progress handler to list of handlers
                        this.progressHandlers.push(progressHandler);

                        // passing previous notifications to new handler
                        this.notificationArguments.forEach(function (args) {
                            progressHandler.apply(this, args);
                        });
                    }
                }

                return this;
            },

            /**
             * Returns a promise that is fulfilled when all passed promises are fulfilled,
             * or fails when one of them fails. Invokes progress on each promise' progress,
             * and when individual promises are fulfilled.
             * The order of invoking the returned promise and the original promises' handlers
             * is not deterministic.
             * @param {...$utils.Promise|*} promise A list of promises. Non-promises will be
             * treated as resolved promises.
             * @returns {$utils.Promise}
             * @memberOf $utils.Promise
             */
            when: function (promise) {
                var deferred = $utils.Deferred.create(),
                    promises = slice.call(arguments),
                    promiseCount = promises.length;

                function tryResolving() {
                    if (--promiseCount === 0) {
                        deferred.resolve.apply(deferred, arguments);
                    } else {
                        deferred.notify.apply(deferred, arguments);
                    }
                }

                promises.forEach(function (promise) {
                    if ($assertion.validators.isPromise(promise)) {
                        promise.then(
                            tryResolving,
                            deferred.reject.bind(deferred),
                            deferred.notify.bind(deferred));
                    } else {
                        tryResolving(promise);
                    }
                });

                return deferred.promise;
            }
        });
});

(function () {
    "use strict";

    $assertion.addTypes(/** @lends $assertion */{
        /**
         * @param {$utils.Promise} expr
         */
        isPromise: function (expr) {
            return $utils.Promise.isBaseOf(expr);
        },

        /**
         * @param {$utils.Promise} expr
         */
        isPromiseOptional: function (expr) {
            return typeof expr === 'undefined' ||
                $utils.Promise.isBaseOf(expr);
        }
    });
}());

/**
 * @name $utils.Timer
 * @interface
 */

/**
 * @name $utils.Timer.create
 * @function
 * @param {function} callback
 * @returns {$utils.Timer}
 */

/**
 * @name $utils.Timer#timerId
 * @type {number}
 */

/**
 * @name $utils.Timer#deferred
 * @type {$utils.Deferred}
 */

/**
 * @name $utils.Timer#clear
 * @function
 * @returns {$utils.Timer}
 */

$oop.postpone($utils, 'Timeout', function () {
    "use strict";

    var base = $oop.Base,
        self = base.extend();

    /**
     * Creates a Timeout instance.
     * @name $utils.Timeout.create
     * @function
     * @param {number} timeoutId
     * @returns {$utils.Timeout}
     */

    /**
     * Represents a timeout ID with promise capabilities.
     * Allows to cancel a timeout via window.clearTimeout.
     * @class
     * @extends $oop.Base
     * @implements $utils.Timer
     */
    $utils.Timeout = self
        .addPrivateMethods(/** @lends $utils.Timeout# */{
            /**
             * @param {number} timeoutId
             * @private
             */
            _clearTimeoutProxy: function (timeoutId) {
                return clearTimeout(timeoutId);
            }
        })
        .addMethods(/** @lends $utils.Timeout# */{
            /**
             * @param {number} timeoutId
             * @ignore
             */
            init: function (timeoutId) {
                $assertion.isNumber(timeoutId, "Invalid timeout ID");

                /**
                 * ID associated with timeout. Comes from Async.setTimeout or window.setTimeout.
                 * @type {number}
                 */
                this.timerId = timeoutId;

                /**
                 * @type {$utils.Deferred}
                 */
                this.deferred = $utils.Deferred.create();
            },

            /**
             * Clears the timeout ID, and rejects the promise.
             * Clearing an already cleared timeout will have no effect.
             * @returns {$utils.Timeout}
             */
            clear: function () {
                var deferred = this.deferred;

                if (deferred.promise.status === $utils.Promise.PROMISE_STATE_UNFULFILLED) {
                    this._clearTimeoutProxy(this.timerId);
                    deferred.reject.apply(deferred, arguments);
                }

                return this;
            }
        });
});

(function () {
    "use strict";

    $oop.extendBuiltIn(Number.prototype, /** @lends Number# */{
        /**
         * Converts `Number` to `Timeout` instance.
         * @returns {$utils.Timeout}
         */
        toTimeout: function () {
            return $utils.Timeout.create(this.valueOf());
        }
    });
}());

$oop.postpone($utils, 'Interval', function () {
    "use strict";

    var base = $oop.Base,
        self = base.extend();

    /**
     * Creates an Interval instance.
     * @name $utils.Interval.create
     * @function
     * @param {number} intervalId
     * @returns {$utils.Interval}
     */

    /**
     * Represents an interval ID with promise capabilities.
     * Allows to cancel an interval timer via window.clearInterval.
     * @class
     * @extends $oop.Base
     * @implements $utils.Timer
     */
    $utils.Interval = self
        .addPrivateMethods(/** @lends $utils.Interval# */{
            /**
             * @param {number} intervalId
             * @private
             */
            _clearIntervalProxy: function (intervalId) {
                return clearInterval(intervalId);
            }
        })
        .addMethods(/** @lends $utils.Interval# */{
            /**
             * @param {number} intervalId
             * @ignore
             */
            init: function (intervalId) {
                $assertion.isNumber(intervalId, "Invalud timeout ID");

                /**
                 * ID associated with interval timer.
                 * Comes from Async.setInterval or window.setInterval.
                 * @type {number}
                 */
                this.timerId = intervalId;

                /**
                 * @type {$utils.Deferred}
                 */
                this.deferred = $utils.Deferred.create();
            },

            /**
             * Clears the interval ID, and rejects the promise.
             * Clearing an already cleared interval timer will have no effect.
             * @returns {$utils.Interval}
             */
            clear: function () {
                var deferred = this.deferred;

                if (deferred.promise.status === $utils.Promise.PROMISE_STATE_UNFULFILLED) {
                    this._clearIntervalProxy(this.timerId);
                    deferred.reject.apply(deferred, arguments);
                }

                return this;
            }
        });
});

(function () {
    "use strict";

    $oop.extendBuiltIn(Number.prototype, /** @lends Number# */{
        /**
         * Converts `Number` to `Interval` instance.
         * @returns {$utils.Interval}
         */
        toInterval: function () {
            return $utils.Interval.create(this.valueOf());
        }
    });
}());

$oop.postpone($utils, 'Async', function () {
    "use strict";

    var base = $oop.Base,
        self = base.extend(),
        slice = Array.prototype.slice;

    /**
     * Static class for running functions asynchronously.
     * @class
     * @extends $oop.Base
     */
    $utils.Async = self
        .addPrivateMethods(/** @lends $utils.Async */{
            /**
             * @param {function} callback
             * @param {number} delay
             * @returns {number}
             * @private
             */
            _setTimeoutProxy: function (callback, delay) {
                return setTimeout.apply(null, arguments);
            },

            /**
             * @param {function} callback
             * @param {number} delay
             * @returns {number}
             * @private
             */
            _setIntervalProxy: function (callback, delay) {
                return setInterval.apply(null, arguments);
            }
        })
        .addMethods(/** @lends $utils.Async */{
            /**
             * Runs a function asynchronously.
             * Similar to window.setTimeout, except that it returns a promise
             * that is resolved when the timeout completes or is rejected when the
             * timeout is canceled.
             * @param {function} callback
             * @param {number} delay
             * @returns {$utils.Promise} Resolution receives callback return value,
             * progress receives Timeout instance.
             * @see window.setTimeout
             * @see $utils.Timeout
             */
            setTimeout: function (callback, delay) {
                var args = [timeoutCallback].concat(slice.call(arguments, 1)),
                    timeout = this._setTimeoutProxy.apply(this, args).toTimeout(),
                    deferred = timeout.deferred;

                function timeoutCallback() {
                    // invoking callback and resolving promise with return value
                    deferred.resolve(callback.apply(null, arguments));
                }

                deferred.notify(timeout);

                return deferred.promise;
            },

            /**
             * Runs function asynchronously, at each delay milliseconds until cleared.
             * Similar to window.setInterval, except that it returns a promise
             * that is rejected when the interval timer is cleared, and is notified
             * at each interval cycle.
             * @param {function} callback
             * @param {number} delay
             * @returns {$utils.Promise} Rejection receives no arguments, progress
             * receives callback return value.
             */
            setInterval: function (callback, delay) {
                var args = [intervalCallback].concat(slice.call(arguments, 1)),
                    interval = this._setIntervalProxy.apply(this, args).toInterval(),
                    deferred = interval.deferred;

                function intervalCallback() {
                    // invoking callback and resolving promise with return value
                    deferred.notify(interval, callback.apply(null, arguments));
                }

                deferred.notify(interval);

                return deferred.promise;
            }
        });
});

/*jshint browser:true, node:true */
$oop.postpone($utils, 'Debouncer', function () {
    "use strict";

    var base = $oop.Base,
        self = base.extend(),
        slice = Array.prototype.slice;

    /**
     * @name $utils.Debouncer.create
     * @function
     * @param {function} callback Function to debounce
     * @returns {$utils.Debouncer}
     */

    /**
     * De-bounces a function. Calls to the specified function via .schedule will be ignored
     * and replaced by subsequent calls being made within the specified time frame.
     * When no new calls were made in the specified time frame, the last call will go through.
     * @class
     * @extends $oop.Base
     * @implements $utils.Scheduler
     */
    $utils.Debouncer = self
        .addMethods(/** @lends $utils.Debouncer# */{
            /**
             * @param {function} callback Function to debounce
             * @ignore
             */
            init: function (callback) {
                $assertion.isFunction(callback, "Invalid callback");

                this.elevateMethods(
                    'onCall',
                    'onTimerCancel',
                    'onTimerStart');

                /**
                 * Function to be de-bounced.
                 * @type {function}
                 */
                this.callback = callback;

                /**
                 * Timer instance representing the countdown to the next outgoing call.
                 * Undefined when the call has been already made.
                 * @type {$utils.Timeout}
                 * @private
                 */
                this._timer = undefined;

                /**
                 * Allows the debouncer cycle to be controlled internally.
                 * @type {$utils.Deferred}
                 * @private
                 */
                this._deferred = undefined;
            },

            /**
             * Starts te scheduler with the specified callback and delay.
             * Will invoke callback within the specified time frame
             * unless a new debounced call is made in the meantime.
             * @returns {$utils.Promise}
             */
            schedule: function (delay) {
                arguments[0] = delay || 0;

                if (!this._deferred) {
                    this._deferred = $utils.Deferred.create();
                }

                if (this._timer) {
                    // existing timer must be cleared
                    this._timer.clear();
                }

                var args = [this.callback].concat(slice.call(arguments));

                $utils.Async.setTimeout.apply($utils.Async, args)
                    .then(this.onCall, this.onTimerCancel, this.onTimerStart);

                return this._deferred.promise;
            },

            /**
             * When the outgoing call was made.
             * @ignore
             */
            onCall: function () {
                var deferred = this._deferred;

                // re-setting debouncer state
                this._deferred = undefined;
                this._timer = undefined;

                deferred.resolve.apply(deferred, arguments);
            },

            /**
             * When the timer gets canceled due to subsequent scheduling.
             * @ignore
             */
            onTimerCancel: function () {
                var deferred = this._deferred;
                deferred.notify.apply(deferred, arguments);
            },

            /**
             * When the timer starts.
             * @param {$utils.Timeout} timeout
             * @ignore
             */
            onTimerStart: function (timeout) {
                this._timer = timeout;
            }
        });
});

(function () {
    "use strict";

    $oop.extendBuiltIn(Function.prototype, /** @lends Function# */{
        /**
         * Converts `Function` to `Debouncer` instance.
         * @returns {$utils.Debouncer}
         */
        toDebouncer: function () {
            return $utils.Debouncer.create(this.valueOf());
        }
    });
}());

$oop.postpone($utils, 'Documented', function () {
    "use strict";

    var base = $oop.Base,
        self = base.extend();

    /**
     * @name $utils.Documented.create
     * @function
     * @returns {$utils.Documented}
     */

    /**
     * Documented trait. Adds meta information to the class, including class name, namespace, and instance ID.
     * @class
     * @extends $oop.Base
     */
    $utils.Documented = self
        .addPublic(/** @lends $utils.Documented */{
            /**
             * Next instance ID.
             * @type {number}
             */
            nextInstanceId: 0
        })
        .addMethods(/** @lends $utils.Documented# */{
            /**
             * Extends class adding meta information.
             * @param {string} className Class name
             * @returns {$oop.Base}
             */
            extend: function (className) {
                $assertion.isString(className, "Invalid class name");

                var result = /** @type {$utils.Documented} */ base.extend.call(this);

                result.addConstants(/** @lends $utils.Documented */{
                    /**
                     * @type {string}
                     */
                    className: className
                });

                return result;
            },

            /**
             * @ignore
             */
            init: function () {
                /**
                 * Instance ID.
                 * @type {number}
                 */
                this.instanceId = self.nextInstanceId++;
            }
        });
});

$oop.postpone($utils, 'Managed', function (ns, className) {
    "use strict";

    var base = $utils.Documented,
        self = base.extend(className);

    /**
     * @name $utils.Managed.create
     * @function
     * @returns {$utils.Managed}
     */

    /**
     * Managed trait, extends `Documented` trait with a dynamic instance registry.
     * @class
     * @extends $utils.Documented
     */
    $utils.Managed = self
        .addPublic(/** @lends $utils.Managed */{
            /**
             * @type {object}
             */
            instanceRegistry: {}
        })
        .addMethods(/** @lends $utils.Managed# */{
            /**
             * @ignore
             */
            init: function () {
                base.init.call(this);
                this.addToRegistry();
            },

            /**
             * Adds instance to registry.
             * @returns {$utils.Managed}
             */
            addToRegistry: function () {
                self.instanceRegistry[this.instanceId] = this;
                return this;
            },

            /**
             * Removes instance from registry.
             * @returns {$utils.Managed}
             */
            removeFromRegistry: function () {
                delete self.instanceRegistry[this.instanceId];
                return this;
            },

            /**
             * Prepares instance for garbage collection. Call it before disposing of instance in order to avoid
             * memory leaks.
             * @example
             * MyManaged = $oop.Base.extend()
             *   .addTrait($utils.Managed)
             *   .addMethods({
             *       init: function () {$utils.Managed.init.call(this);}
             *   });
             * instance = MyManaged.create(); // instance will be added to registry
             * instance.destroy(); // cleans up
             * @returns {$utils.Managed}
             */
            destroy: function () {
                this.removeFromRegistry();
                return this;
            },

            /**
             * Fetches instance by ID.
             * @param {number|string} instanceId
             * @returns {$utils.Managed}
             * @memberOf $utils.Managed
             */
            getInstanceById: function (instanceId) {
                return self.instanceRegistry[instanceId];
            }
        });
});

/*jshint node:true */
if (typeof module === 'object') {
    module.exports = $utils;
}

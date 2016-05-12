/*jshint node:true */

/** @namespace */
var $data = {};

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

$oop.postpone($data, 'DataUtils', function () {
    "use strict";

    var hOP = Object.prototype.hasOwnProperty;

    /**
     * @class
     * @extends $oop.Base
     */
    $data.DataUtils = $oop.Base.extend()
        .addMethods(/** @lends $data.DataUtils */{
            /**
             * Determines whether an object has any enumerable
             * properties.
             * @param {object} obj
             * @returns {boolean}
             */
            isEmptyObject: function (obj) {
                var key;
                for (key in obj) {
                    if (hOP.call(obj, key)) {
                        return false;
                    }
                }
                return true;
            },

            /**
             * Determines whether an object has exactly one
             * enumerable property.
             * @param {object} obj
             * @returns {boolean}
             */
            isSingularObject: function (obj) {
                var count = 0,
                    key;
                for (key in obj) {
                    if (hOP.call(obj, key) && ++count > 1) {
                        return false;
                    }
                }
                return count === 1;
            },

            /**
             * Creates a shallow copy of an object.
             * Property names will be copied, but property values
             * will point to the original references.
             * @param {object|Array} original
             * @returns {object|Array} shallow copy of original
             */
            shallowCopy: function (original) {
                var propertyNames,
                    i, propertyName,
                    result;

                if (original instanceof Array) {
                    // shorthand for arrays
                    result = original.concat([]);
                } else if (typeof original === 'object') {
                    propertyNames = Object.getOwnPropertyNames(original);
                    result = {};
                    for (i = 0; i < propertyNames.length; i++) {
                        propertyName = propertyNames[i];
                        result[propertyName] = original[propertyName];
                    }
                } else {
                    result = original;
                }

                return result;
            }
        });
});

$oop.postpone($data, 'Hash', function () {
    "use strict";

    var hOP = Object.prototype.hasOwnProperty,
        slice = Array.prototype.slice,
        isEmptyObject = $data.DataUtils.isEmptyObject;

    /**
     * Instantiates class.
     * @name $data.Hash.create
     * @function
     * @param {object|Array} items Container for hash items.
     * @returns {$data.Hash}
     */

    /**
     * General wrapper around objects to treat them as hash.
     * Calling `Object.prototype` methods on hash objects is not safe as they may be
     * shadowed by user data, and such cases certainly lead the application to break.
     * Other `Hash`-based classes may delegate conversion methods to this class.
     * @class $data.Hash
     * @extends $oop.Base
     */
    $data.Hash = $oop.Base.extend()
        .addMethods(/** @lends $data.Hash# */{
            /**
             * @param {object|Array} items Container for hash items.
             * @ignore
             */
            init: function (items) {
                $assertion.isObjectOptional(items, "Invalid items");

                /**
                 * Object buffer that stores items. Technically writable and public for performance
                 * and transparency reasons, but should not be changed externally as may lead to inconsistent state
                 * especially in `Hash`-based subclasses.
                 * @type {Object|Array}
                 */
                this.items = items || {};

                /**
                 * Tracks number of distinct keys in the hash. Uninitialized until first queried.
                 * (by either `.getKeys()` or `.getKeyCount()`), therefore it is safer to use its getter
                 * method. Should not be modified externally.
                 * @type {number}
                 */
                this.keyCount = items ? undefined : 0;
            },

            /**
             * Retrieves item from the hash.
             * @param {string} itemKey Item key.
             * @returns {*} Item variable.
             */
            getItem: function (itemKey) {
                return this.items[itemKey];
            },

            /**
             * Clones hash. Creates an instance of the same class (for subclasses of `Hash`)
             * and initializes it with a shallow copy of the current items buffer and item count.
             * @returns {$data.Hash} New hash with identical contents.
             */
            clone: function () {
                var result = /** @type $data.Hash */ this.getBase().create();

                /**
                 * Copying items and count
                 * Other properties added by descendants
                 * must be cloned in override methods
                 */
                result.items = $data.DataUtils.shallowCopy(this.items);
                result.keyCount = this.keyCount;

                return result;
            },

            /**
             * Retrieves the first available key it can find. If hash has more than one items,
             * any of the hash's keys may be returned. Result does not necessarily match up with the return value
             * of `.getFirstValue()`.
             * @returns {string}
             * @see $data.Hash#getFirstValue
             */
            getFirstKey: function () {
                var items = this.items,
                    key;
                for (key in items) {
                    if (hOP.call(items, key)) {
                        return key;
                    }
                }
                return undefined;
            },

            /**
             * Retrieves item keys as an array. The order in which keys appear in the resulting array
             * is not deterministic.
             * @returns {string[]}
             */
            getKeys: function () {
                var result = Object.keys(this.items);
                if (typeof this.keyCount !== 'number') {
                    this.keyCount = result.length;
                }
                return result;
            },

            /**
             * Retrieves item keys wrapped in a hash.
             * @returns {$data.Hash}
             * @see $data.Hash#getKeys
             */
            getKeysAsHash: function () {
                return $data.Hash.create(this.getKeys());
            },

            /**
             * Retrieves the number of keys in hash.
             * @example
             * var c = $data.Hash.create({foo: 1, bar: 2});
             * c.getKeyCount() // 2
             * @returns {number}
             */
            getKeyCount: function () {
                if (typeof this.keyCount !== 'number') {
                    this.keyCount = Object.keys(this.items).length;
                }
                return this.keyCount;
            },

            /**
             * Retrieves the first available value it can find. If hash has more than one items,
             * any value from the hash may be returned. Result does not necessarily match up with the return value
             * of `.getFirstKey()`.
             * @returns {*}
             * @see $data.Hash#getFirstKey
             */
            getFirstValue: function () {
                var items = this.items,
                    key;
                for (key in items) {
                    if (hOP.call(items, key)) {
                        return items[key];
                    }
                }
                return undefined;
            },

            /**
             * Retrieves collection items in an array, without key information. The order in which keys appear
             * in the resulting array is not deterministic.
             * @returns {Array}
             */
            getValues: function () {
                var items = this.items,
                    keys = Object.keys(items),
                    result = [],
                    i;

                for (i = 0; i < keys.length; i++) {
                    result.push(items[keys[i]]);
                }

                return result;
            },

            /**
             * Retrieves item values wrapped in a hash.
             * @returns {$data.Hash}
             * @see $data.Hash#getValues
             */
            getValuesAsHash: function () {
                return $data.Hash.create(this.getValues());
            },

            /**
             * Changes buffer type from Object to Array or vice versa.
             * Changes the current hash instance!
             * @param {function} bufferType=Object `Array` or `Object`, specifying new buffer type.
             * @example
             * $data.Hash.create({0: 'foo', 1: 'bar'}).changeBufferTypeTo(Array).items // ['foo', 'bar']
             * @returns {$data.Hash}
             */
            changeBufferTypeTo: function (bufferType) {
                var items = this.items;

                if (items instanceof Array && bufferType === Array ||
                    !(items instanceof Array) && bufferType === Object
                    ) {
                    return this;
                }

                var buffer = bufferType === Array ? [] : {},
                    keys = Object.keys(items),
                    i, key;

                // adding items to new buffer
                for (i = 0; i < keys.length; i++) {
                    key = keys[i];
                    buffer[key] = items[key];
                }

                // setting new buffer and resetting key count
                this.items = buffer;
                this.keyCount = undefined;

                return this;
            },

            /**
             * Clears hash by replacing items buffer with an empty one.
             * Observes current buffer type, ie. if hash was array based, the new buffer will be also array.
             * @param {function} handler Change handler callback. Receives the new `items` buffer.
             * @returns {$data.Hash}
             */
            clear: function (handler) {
                if (!isEmptyObject(this.items)) {
                    this.items = this.items instanceof Array ? [] : {};
                    this.keyCount = 0;

                    if (handler) {
                        handler(this.items);
                    }
                }
                return this;
            },

            /**
             * Passes the items buffer to the specified function.
             * @param {function} handler External handler accepting the buffer.
             * @param {*} [context] Context in which to call the handler. If handler is a method, the context
             * should be the owner (instance or class) of the method.
             * @param {number} [argIndex=0] Argument index taken by buffer when calling the function.
             * @returns {*} Whatever is returned by the handler.
             */
            passItemsTo: function (handler, context, argIndex) {
                argIndex = argIndex || 0;
                var args = slice.call(arguments, 3);
                $assertion.assert(args.length >= argIndex, "Invalid argument index", argIndex);
                args.splice(argIndex, 0, this.items);
                return handler.apply(context || this, args);
            },

            /**
             * Passes itself to the specified function.
             * @param {function} handler External handler accepting the hash.
             * @param {*} [context] Context in which to call the handler. If handler is a method, the context
             * should be the owner (instance or class) of the method.
             * @param {number} [argIndex=0] Argument index taken by buffer when calling the function.
             * @returns {*} Whatever is returned by the handler.
             */
            passSelfTo: function (handler, context, argIndex) {
                argIndex = argIndex || 0;
                var args = slice.call(arguments, 3);
                $assertion.assert(args.length >= argIndex, "Invalid argument index", argIndex);
                args.splice(argIndex, 0, this);
                return handler.apply(context || this, args);
            }
        });
});

(function () {
    "use strict";

    $assertion.addTypes(/** @lends $data */{
        isHash: function (expr) {
            return $data.Hash.isBaseOf(expr);
        },

        isHashOptional: function (expr) {
            return typeof expr === 'undefined' ||
                $data.Hash.isBaseOf(expr);
        }
    });

    $oop.extendBuiltIn(Array.prototype, /** @lends Array# */{
        /**
         * Creates a new Hash instance based on the current array.
         * @returns {$data.Hash}
         */
        toHash: function () {
            return $data.Hash.create(this);
        }
    });
}());

$oop.postpone($data, 'Dictionary', function () {
    "use strict";

    var base = $data.Hash;

    /**
     * Instantiates class.
     * Constructs a dictionary, initialized with the items passed in the optional argument.
     * @name $data.Dictionary.create
     * @function
     * @param {object} [items]
     * @returns {$data.Dictionary}
     */

    /**
     * Manages key-value pairs. In a dictionary, one item is equivalent to a key-value pair.
     * Internally, `Dictionary` stores key-value pairs in an object hash, its keys being dictionary keys,
     * associated with values or arrays of values.
     * @class $data.Dictionary
     * @extends $data.Hash
     */
    $data.Dictionary = base.extend()
        .addPrivateMethods(/** @lends $data.Dictionary# */{
            /**
             * Counts key-value pairs in dictionary.
             * Since one item may hold multiple values, value count =/= key count.
             * @returns {number}
             * @private
             */
            _countValues: function () {
                var items = this.items,
                    keys = this.getKeys(),
                    result = 0,
                    i, item;

                for (i = 0; i < keys.length; i++) {
                    item = items[keys[i]];
                    result += item instanceof Array ?
                        item.length :
                        1;
                }

                return result;
            }
        })
        .addMethods(/** @lends $data.Dictionary# */{
            /**
             * @param {object} [items]
             * @ignore
             */
            init: function (items) {
                base.init.call(this, items);

                /**
                 * Tracks the number of distinct key-value pairs in the dictionary. Uninitialized until first queried
                 * (by `.getItemCount()`), therefore it is safer to use its getter instead.
                 * Should not be modified externally.
                 * @type {number}
                 */
                this.itemCount = items ? undefined : 0;
            },

            /**
             * Adds key-value pairs to dictionary, where one key, and multiple values may be specified.
             * @example
             * var d = $data.Dictionary.create({foo: "bar"});
             * d.addItem('hello', 'world').items // {foo: "bar", hello: "world"}
             * d.addItem('foo', 'boo').items // {foo: ["bar", "boo"], hello: "world"}
             * @param {string} key Single dictionary key.
             * @param {*|Array} value Value or values to be assigned to the specified key.
             * @returns {$data.Dictionary}
             */
            addItem: function (key, value) {
                var items = this.items,
                    currentValue = items[key],
                    currentValueType = typeof currentValue,
                    valueIsArray = value instanceof Array;

                if (currentValue instanceof Array) {
                    // current item is array
                    if (valueIsArray) {
                        items[key] = currentValue.concat(value);
                    } else {
                        currentValue.push(value);
                    }
                } else if (currentValueType === 'undefined') {
                    // current item does not exist
                    items[key] = valueIsArray ?
                        value.length === 1 ?
                            value[0] :
                            value :
                        value;

                    // updating item count (new key was added)
                    if (typeof this.keyCount === 'number') {
                        this.keyCount++;
                    }
                } else {
                    // current item is single value
                    items[key] = valueIsArray ?
                        [currentValue].concat(value) :
                        [currentValue, value];
                }

                // updating value count
                if (typeof this.itemCount === 'number') {
                    this.itemCount += valueIsArray ?
                        value.length :
                        1;
                }

                return this;
            },

            /**
             * Adds key-value pairs to the dictionary, where multiple keys and values may be specified.
             * All specified keys will be assigned each value listed in `value`.
             * @example
             * var d = $data.Dictionary.create();
             * d.addItems(['hello', 'greetings'], 'world').items // {hello: "world", greetings: "world"}
             * d.addItem(['foo', 'hello'], 'bar').items // {hello: ["world", "bar"], greetings: "world", foo: "bar"}
             * @param {string[]} keys Array of keys.
             * @param {*|Array} value Value or values to be assigned to the specified keys.
             * @returns {$data.Dictionary}
             */
            addItems: function (keys, value) {
                $assertion.isArray(keys, "Invalid keys");

                var i;
                for (i = 0; i < keys.length; i++) {
                    this.addItem(keys[i], value);
                }
                return this;
            },

            /**
             * Removes single key-value pair from dictionary. When `value` is omitted all items matched by `key`
             * will be removed from the dictionary.
             * @example
             * var d = $data.Dictionary.create({
             *     foo: 'bar',
             *     hello: ['world', 'all', 'bar']
             * });
             * d.removeItem('hello', 'bar').items // {foo: 'bar', hello: ['world', 'all']}
             * @param {string} key Key identifying a dictionary item.
             * @param {*} [value] Value (by reference if object) to be removed from the item.
             * @returns {$data.Dictionary}
             */
            removeItem: function (key, value) {
                var items = this.items,
                    currentValue = items[key],
                    currentValueIsArray = currentValue instanceof Array,
                    valueIndex;

                if (currentValueIsArray && typeof value !== 'undefined') {
                    valueIndex = currentValue.indexOf(value);
                    if (valueIndex > -1) {
                        // value is present at specified key
                        if (currentValue.length > 2) {
                            // splicing out value from array
                            currentValue.splice(valueIndex, 1);
                        } else {
                            // replacing array with remaining value
                            items[key] = currentValue[1 - valueIndex];
                        }

                        // updating value counter
                        if (typeof this.itemCount === 'number') {
                            this.itemCount--;
                        }
                    }
                } else {
                    // removing full item
                    delete items[key];

                    // updating counters
                    if (typeof this.keyCount === 'number') {
                        this.keyCount--;
                    }
                    if (typeof this.itemCount === 'number') {
                        this.itemCount -= currentValueIsArray ?
                            currentValue.length :
                            1;
                    }
                }

                return this;
            },

            /**
             * Removes key-value pairs from dictionary matching `value` and any of the keys listed in `key`.
             * When `value` is omitted, all items matching any of `keys` will be removed.
             * @param {string[]} keys Array of keys.
             * @param {*} [value] Value (by reference if object).
             * @returns {$data.Dictionary}
             */
            removeItems: function (keys, value) {
                $assertion.isArray(keys, "Invalid keys");

                var i;
                for (i = 0; i < keys.length; i++) {
                    this.removeItem(keys[i], value);
                }
                return this;
            },

            /**
             * Retrieves the value or values associated with `key`.
             * TODO: make sure single key / array value returns a copy of the array
             * @param {*|Array} key Array of keys matching dictionary items.
             * @returns {*|Array} Array of values matching the specified key(s).
             */
            getItem: function (key) {
                var result,
                    i, item;

                if (typeof key === 'string' ||
                    typeof key === 'number'
                    ) {
                    result = this.items[key];
                } else if (key instanceof Array) {
                    // key may be an array of keys
                    result = [];
                    for (i = 0; i < key.length; i++) {
                        item = this.items[key[i]];
                        if (item) {
                            result = result.concat(item);
                        }
                    }
                    if (!result.length) {
                        result = undefined;
                    }
                } else {
                    $assertion.assert(false, "Invalid key");
                }

                return result;
            },

            /**
             * Retrieves the number of items (key-value pairs) in the dictionary.
             * @example
             * var d = $data.Dictionary.create({
             *     foo: 'bar',
             *     hello: ['world', 'all', 'bar']
             * }).getItemCount() // 4
             * @returns {number}
             */
            getItemCount: function () {
                if (typeof this.itemCount !== 'number') {
                    this.itemCount = this._countValues();
                }
                return this.itemCount;
            },

            /**
             * Clones dictionary.
             * @returns {$data.Dictionary}
             */
            clone: function () {
                var result = /** @type {$data.Dictionary} */base.clone.call(this);

                result.itemCount = this.itemCount;

                return result;
            },

            /**
             * Clears dictionary and resets counters.
             * @returns {$data.Dictionary}
             */
            clear: function () {
                // clearing items buffer
                base.clear.call(this);

                // resetting item counter
                this.itemCount = 0;

                return this;
            }
        });
});

$oop.amendPostponed($data, 'Hash', function () {
    "use strict";

    $data.Hash.addMethods(/** @lends $data.Hash# */{
        /**
         * Reinterprets hash as a dictionary.
         * @returns {$data.Dictionary}
         */
        toDictionary: function () {
            return $data.Dictionary.create(this.items);
        }
    });
});

(function () {
    "use strict";

    $assertion.addTypes(/** @lends $data */{
        isDictionary: function (expr) {
            return $data.Dictionary.isBaseOf(expr);
        },

        isDictionaryOptional: function (expr) {
            return typeof expr === 'undefined' ||
                $data.Dictionary.isBaseOf(expr);
        }
    });

    $oop.extendBuiltIn(Array.prototype, /** @lends Array# */{
        /**
         * Creates a new Dictionary instance based on the current array.
         * @returns {$data.Dictionary}
         */
        toDictionary: function () {
            return $data.Dictionary.create(this);
        }
    });
}());

$oop.postpone($data, 'StringDictionary', function () {
    "use strict";

    /**
     * Instantiates class.
     * Constructs a dictionary, initialized with the items passed in the optional argument.
     * @name $data.StringDictionary.create
     * @function
     * @param {object|Array} items
     * @returns {$data.StringDictionary}
     */

    /**
     * Dictionary for string values specifically. Methods implemented here expect values to be either strings,
     * or other primitives that can be converted to string implicitly (numbers, booleans, etc.).
     * @example
     * {foo: 'bar', 'hello': ['all', 'the', 'world']}
     * @class $data.StringDictionary
     * @extends $data.Dictionary
     */
    $data.StringDictionary = $data.Dictionary.extend()
        .addMethods(/** @lends $data.StringDictionary# */{
            /**
             * Combines current dictionary with another dictionary and returns the combined dictionary
             * in a new instance. The result will contain values from key-value pairs in the remote dictionary
             * where keys match the current dictionary's values.
             * @example
             * var left = $data.StringDictionary.create({foo: 'bar', hello: ['world', 'all']}),
             *     right = $data.StringDictionary.create({bar: 'BAR', all: 'ALL'});
             * left.combineWith(right).items // {foo: "BAR", hello: "ALL"}
             * @param {$data.Dictionary} remoteDict Remote dictionary (doesn't have to be string dictionary)
             * @returns {$data.Dictionary} Dictionary instance with the combined items. When the two dictionaries
             * (current and remote) are of different (sub)classes, the return value will match the class of the
             * remote dictionary. This way, a `StringDictionary` may be combined with a regular dictionary,
             * resulting in a regular dictionary, but not the other way around.
             */
            combineWith: function (remoteDict) {
                $assertion.isDictionary(remoteDict, "Invalid dictionary");

                var items = this.items,
                    resultBuffer = items instanceof Array ? [] : {},
                    result = /** @type {$data.Dictionary} */ remoteDict.getBase().create(resultBuffer),
                    currentKeys = this.getKeys(),
                    i, currentKey, currentValue, remoteValue;

                for (i = 0; i < currentKeys.length; i++) {
                    currentKey = currentKeys[i];
                    currentValue = this.getItem(currentKey);
                    remoteValue = remoteDict.getItem(currentValue);

                    if (typeof remoteValue !== 'undefined') {
                        result.addItem(currentKey, remoteValue);
                    }
                }

                return result;
            },

            /**
             * Combines current dictionary itself.
             * Equivalent to: `stringDictionary.combineWith(stringDictionary)`.
             * @returns {$data.StringDictionary} New dictionary instance with combined items.
             */
            combineWithSelf: function () {
                return /** @type $data.StringDictionary */ this.combineWith(this);
            },

            /**
             * Flips keys and values in the dictionary and returns the results in a new instance. In the reversed
             * dictionary, keys will be the current dictionary's values and vice versa.
             * @example
             * var d = $data.StringDictionary.create({
             *  foo: 'bar',
             *  hello: ['world', 'all', 'bar']
             * });
             * d.reverse().items // {bar: ["foo", "hello"], world: "hello", all: "hello"}
             * @returns {$data.StringDictionary} New dictionary instance with reversed key-value pairs.
             */
            reverse: function () {
                var resultBuffer = {},
                    result = this.getBase().create(resultBuffer),
                    keys = this.getKeys(),
                    i, key, value;

                for (i = 0; i < keys.length; i++) {
                    key = keys[i];
                    value = this.items[key];

                    // flipping value and key in new dictionary
                    if (value instanceof Array) {
                        result.addItems(value, key);
                    } else {
                        result.addItem(value, key);
                    }
                }

                return result;
            },

            /**
             * Retrieves unique values from dictionary.
             * @returns {string[]}
             */
            getUniqueValues: function () {
                return this
                    .reverse()
                    .getKeys();
            },

            /**
             * Retrieves unique values from dictionary wrapped in a hash.
             * @returns {$data.Hash}
             */
            getUniqueValuesAsHash: function () {
                return this
                    .reverse()
                    .getKeysAsHash();
            }

            /**
             * Clears dictionary and resets counters.
             * @name $data.StringDictionary#clear
             * @function
             * @returns {$data.StringDictionary}
             */
        });
});

$oop.amendPostponed($data, 'Hash', function () {
    "use strict";

    $data.Hash.addMethods(/** @lends $data.Hash# */{
        /**
         * Reinterprets hash as a string dictionary.
         * @returns {$data.StringDictionary}
         */
        toStringDictionary: function () {
            return $data.StringDictionary.create(this.items);
        }
    });
});

(function () {
    "use strict";

    $assertion.addTypes(/** @lends $data */{
        isStringDictionary: function (expr) {
            return $data.StringDictionary.isBaseOf(expr);
        },

        isStringDictionaryOptional: function (expr) {
            return typeof expr === 'undefined' ||
                $data.StringDictionary.isBaseOf(expr);
        }
    });

    $oop.extendBuiltIn(Array.prototype, /** @lends Array# */{
        /**
         * Creates a new StringDictionary instance based on the current array.
         * @returns {$data.StringDictionary}
         */
        toStringDictionary: function () {
            return $data.StringDictionary.create(this);
        }
    });
}());

$oop.postpone($data, 'Collection', function () {
    "use strict";

    var hOP = Object.prototype.hasOwnProperty,
        slice = Array.prototype.slice,
        validators = $assertion.validators,
        base = $data.Hash,
        self = base.extend();

    /**
     * Instantiates class.
     * @name $data.Collection.create
     * @function
     * @param {object|Array} [items] Initial contents.
     * @returns {$data.Collection}
     */

    /**
     * Collection offers a way to manage multiple objects or primitives at once.
     * Ordinary collection operations such as content manipulation and filtering may be
     * performed on collections regardless of item types. So called "specified collections"
     * allow however to mix the item's API into the collection and treat collections of
     * objects as if they were a single instance of the same type.
     * @class $data.Collection
     * @extends $data.Hash
     */
    $data.Collection = self
        .addPrivateMethods(/** @lends $data.Collection */{
            /**
             * Generates a shortcut method to be applied to the collection.
             * Shortcut methods traverse the collection and call the
             * invoked method on all items, collecting the return values
             * and returning them as a collection.
             * @param {string} methodName Name of method to make shortcut for.
             * @returns {function}
             * @private
             * @memberOf $data.Collection#
             */
            _genShortcut: function (methodName) {
                /**
                 * @this {$data.Collection} Collection instance.
                 */
                return function () {
                    var items = this.items,
                        result = items instanceof Array ? [] : {},
                        itemKeys = this.getKeys(),
                        i, itemKey, item,
                        itemResult,
                        isChainable = true;

                    // traversing collection items
                    for (i = 0; i < itemKeys.length; i++) {
                        itemKey = itemKeys[i];
                        item = items[itemKey];

                        // delegating method call to item and adding to result collection buffer
                        itemResult = item[methodName].apply(item, arguments);
                        result[itemKey] = itemResult;
                        isChainable = isChainable && itemResult === item;
                    }

                    // chainable collection method for chainable item methods
                    // otherwise returning results as plain collection
                    return isChainable ?
                        this :
                        self.create(result);
                };
            },

            /**
             * Retrieves all method names from plain object.
             * Deals with non-enumerable nature of built-ins' methods.
             * @param {object} obj
             * @returns {string[]}
             * @private
             */
            _getObjectMethodNames: function (obj) {
                var propertyNames = Object.getOwnPropertyNames(obj),
                    methodNames = [],
                    i, propertyName;
                for (i = 0; i < propertyNames.length; i++) {
                    propertyName = propertyNames[i];
                    if (typeof obj[propertyName] === 'function') {
                        methodNames.push(propertyName);
                    }
                }
                return methodNames;
            },

            /**
             * Retrieves all accessible method names from Troop classes.
             * @param {object} obj
             * @returns {string[]}
             * @private
             */
            _getClassMethodNames: function (obj) {
                /*jshint forin:false */
                var methodNames = [],
                    propertyName;
                // iterating over all accessible properties, even inherited ones
                for (propertyName in obj) {
                    if (typeof obj[propertyName] === 'function') {
                        methodNames.push(propertyName);
                    }
                }
                return methodNames;
            }
        })
        .addMethods(/** @lends $data.Collection# */{
            /**
             * Creates a specified collection that is modeled on a template object.
             * Specified collections inherit all methods from the template unless there's a conflict
             * in which case the original `Collection` method wins. Such conflicting methods not available
             * on the specified collection's API may be invoked indirectly through `.callOnEachItem()`.
             * Methods 'inherited' from the template call the corresponding function on each collection item
             * and return a generic collection with the results, except when *all* items return themselves,
             * in which case the original collection is returned. In other words, chainable methods of the
             * template remain chainable on the collection.
             * @example
             * var specified;
             * specified = $data.Collection.of(Array);
             * specified = $data.Collection.of($oop.Base);
             * specified = $data.Collection.of(['foo', 'bar']);
             * specified = $data.Collection.of({
             *  foo: function () {},
             *  bar: function () {}
             * });
             * $data.Collection.of(String).create({
             *  foo: "hello",
             *  bar: "world"
             * }).split().items; // {foo: ['h', 'e', 'l', 'l', 'o'], bar: ['w', 'o', 'r', 'l', 'd']}
             * @param {string[]|object|$oop.Base|function} template
             * Object containing method names either in the form of an array, or as indexes of an object.
             * From `Troop` classes only those methods will be considered that were added by the topmost extension.
             * Functions are treated as constructors, and `.of()` works with their `.prototype` the same way as
             * with any other object passed.
             * @returns {$data.Collection}
             * @memberOf $data.Collection
             */
            of: function (template) {
                // in case methodNames is a fat constructor
                if (typeof template === 'function') {
                    template = template.prototype;
                }

                var methodNames;
                if (validators.isClass(template)) {
                    methodNames = this._getClassMethodNames(template);
                } else if (validators.isObject(template)) {
                    methodNames = this._getObjectMethodNames(template);
                } else {
                    $assertion.isArray(template, "Invalid collection template");
                    methodNames = template;
                }

                // must work on classes derived from Collection, too
                var specifiedCollection = /** @type {$data.Collection} */ $oop.Base.extend.call(this),
                    shortcutMethods = {},
                    i, methodName;

                // adding shortcut methods to temp shortcuts object
                for (i = 0; i < methodNames.length; i++) {
                    methodName = methodNames[i];
                    // template method mustn't override original Collection properties
                    // those (shadowing) methods can still be invoked via .callOnEachItem()
                    if (typeof this[methodName] === 'undefined') {
                        shortcutMethods[methodName] = self._genShortcut(methodName);
                    }
                }

                // adding shortcut methods to extended class
                specifiedCollection.addMethods(shortcutMethods);

                return specifiedCollection;
            },

            /**
             * Sets an item in the collection. Overwrites item if there is already one by the same item key.
             * Increments counter for new items.
             * @example
             * var coll = $data.Collection.create();
             * coll.set('foo', "bar");
             * coll.get('foo'); // "bar"
             * @param {string} itemKey Item key.
             * @param item Item variable / object.
             * @returns {$data.Collection}
             */
            setItem: function (itemKey, item) {
                var isNew = !hOP.call(this.items, itemKey);

                // setting item
                this.items[itemKey] = item;

                // increasing count when new item was added
                if (isNew && typeof this.keyCount === 'number') {
                    this.keyCount++;
                }

                return this;
            },

            /**
             * Deletes item from collection. Decrements counter when an item was in fact deleted.
             * @param {string} itemKey Item key.
             * @returns {$data.Collection}
             */
            deleteItem: function (itemKey) {
                if (hOP.call(this.items, itemKey)) {
                    // removing item
                    delete this.items[itemKey];

                    // decreasing count
                    if (typeof this.keyCount === 'number') {
                        this.keyCount--;
                    }
                }

                return this;
            },

            /**
             * Creates a new collection that is an instance of the specified collection subclass, and is initialized
             * with the current collection's contents BY REFERENCE. Disposing of the current instance is strongly
             * encouraged after calling this method.
             * @example
             * // converts a collection of strings to a string collection
             * var stringCollection = $data.Collection.create(['hello', 'world'])
             *  .asType($data.Collection.of(String));
             * @param {$data.Collection} subClass Subclass of `Collection`
             * @returns {$data.Collection} Instance of the specified collection subclass, initialized with the
             * caller's item buffer and item count.
             */
            asType: function (subClass) {
                $assertion.isCollection(subClass, "Type must be Collection-based");

                var result = /** @type $data.Collection */ subClass.create();

                result.items = this.items;
                result.keyCount = this.keyCount;

                return result;
            },

            /**
             * Merges current collection with another collection. Adds all items from both collections
             * to a new collection instance. Item key conflicts are resolved by a suitable callback, or,
             * when there is none specified, the value from the current collection will be used.
             * @example
             * var merged = stringCollection
             *  .mergeWith(otherStringCollection, function (a, b, conflictingKey) {
             *      return b.getItem(conflictingKey);
             *  });
             * @param {$data.Collection} collection Collection to be merged to current. Must share
             * a common base with the current collection.
             * @param {function} [conflictResolver] Callback for resolving merge conflicts.
             * Callback receives as arguments: current collection, remote collection, and key of
             * the conflicting item, and is expected to return a collection item.
             * @returns {$data.Collection} New collection with items from both collections in it.
             * Return type will be that of the current collection.
             */
            mergeWith: function (collection, conflictResolver) {
                $assertion
                    .isCollection(collection, "Invalid collection")
                    .isFunctionOptional(conflictResolver, "Invalid conflict resolver callback")
                    .assert(collection.isA(this.getBase()), "Collection types do not match");

                var that = this,
                    result = this.clone(),
                    resultItems = result.items;

                collection.forEachItem(function (item, itemKey) {
                    if (!hOP.call(resultItems, itemKey)) {
                        result.setItem(itemKey, item);
                    } else if (conflictResolver) {
                        // resolving conflict with supplied function
                        result.setItem(itemKey, conflictResolver(that, collection, itemKey));
                    }
                });

                return result;
            },

            /**
             * Merges another collection into current collection. Item key conflicts are resolved
             * by a suitable callback, or, when there is none specified, the value from the remote
             * collection will be used.
             * @param {$data.Collection} collection Collection to be merged into current. Must share
             * a common base with the current collection.
             * @param {function} [conflictResolver] Callback for resolving merge conflicts.
             * Callback receives as arguments: current collection, remote collection, and key of
             * the conflicting item, and is expected to return a collection item.
             * @returns {$data.Collection} Current collection instance.
             * @example
             * var merged = stringCollection
             *  .mergeIn(otherStringCollection, function (a, b, conflictingKey) {
             *      return b.getItem(conflictingKey);
             *  });
             */
            mergeIn: function (collection, conflictResolver) {
                $assertion
                    .isCollection(collection, "Invalid collection")
                    .isFunctionOptional(conflictResolver, "Invalid conflict resolver callback")
                    .assert(collection.isA(this.getBase()), "Collection types do not match");

                var that = this,
                    items = this.items;

                collection.forEachItem(function (item, itemKey) {
                    if (!hOP.call(items, itemKey)) {
                        that.setItem(itemKey, item);
                    } else if (conflictResolver) {
                        // resolving conflict with supplied function
                        that.setItem(itemKey, conflictResolver(that, collection, itemKey));
                    }
                });

                return this;
            },

            /**
             * Retrieves item keys as an array, filtered by a prefix. The in which keys appear in the resulting
             * array is not deterministic.
             * @example
             * var c = $data.Collection.create({
             *  foo: 1,
             *  bar: 10,
             *  force: 100
             * });
             * c.getKeysByPrefix('fo'); // ['foo', 'force']
             * @param {string} prefix Item key prefix that keys must match in order to be included in the result.
             * @returns {string[]}
             */
            getKeysByPrefix: function (prefix) {
                $assertion.isString(prefix, "Invalid prefix");

                var result = [],
                    itemKeys = this.getKeys(),
                    i, itemKey;

                for (i = 0; i < itemKeys.length; i++) {
                    itemKey = itemKeys[i];
                    if (itemKey.indexOf(prefix) === 0) {
                        // prefix matches item key
                        result.push(itemKey);
                    }
                }

                return result;
            },

            /**
             * Retrieves item keys as an array, filtered by a prefix, and wrapped in a hash.
             * @param {string} prefix
             * @returns {$data.Hash}
             * @see $data.Collection#getKeysByPrefix
             */
            getKeysByPrefixAsHash: function (prefix) {
                return $data.Hash.create(this.getKeysByPrefix(prefix));
            },

            /**
             * Retrieves item keys as an array, filtered by a RegExp. The in which keys appear in the resulting
             * array is not deterministic.
             * @example
             * var c = $data.Collection.create({
             *  foo: 1,
             *  bar: 10,
             *  force: 100
             * });
             * c.getKeysByRegExp(/^..r/); // ['bar', 'force']
             * @param {RegExp} regExp Regular expression that keys must match in order to be included in the result.
             * @returns {string[]}
             */
            getKeysByRegExp: function (regExp) {
                var result = [],
                    itemKeys = this.getKeys(),
                    i, itemKey;

                for (i = 0; i < itemKeys.length; i++) {
                    itemKey = itemKeys[i];
                    if (regExp.test(itemKey)) {
                        // filter matches item key
                        result.push(itemKey);
                    }
                }

                return result;
            },

            /**
             * Retrieves item keys as an array, filtered by a RegExp, and wrapped in a hash.
             * @param {RegExp} regExp
             * @returns {$data.Hash}
             * @see $data.Collection#getKeysByRegExp
             */
            getKeysByRegExpAsHash: function (regExp) {
                return $data.Hash.create(this.getKeysByRegExp(regExp));
            },

            /**
             * Filters the collection by selecting only the items with the specified keys. Item keys that are not
             * present in the collection will be included in the results, too, as undefined.
             * @param {string[]} itemKeys Keys of items to be included in result.
             * @returns {$data.Collection} New instance of the same collection subclass holding the filtered contents.
             */
            filterByKeys: function (itemKeys) {
                $assertion.isArray(itemKeys, "Invalid item keys");

                var items = this.items,
                    resultItems = items instanceof Array ? [] : {},
                    i, itemKey;

                for (i = 0; i < itemKeys.length; i++) {
                    itemKey = itemKeys[i];
                    if (hOP.call(items, itemKey)) {
                        resultItems[itemKey] = items[itemKey];
                    }
                }

                return this.getBase().create(resultItems);
            },

            /**
             * Filters collection by matching keys against the specified prefix.
             * @param {string} prefix Item key prefix that keys must match in order to be included in the result.
             * @returns {$data.Collection} New instance of the same collection subclass holding the filtered contents.
             */
            filterByPrefix: function (prefix) {
                return this.filterByKeys(this.getKeysByPrefix(prefix));
            },

            /**
             * Filters collection by matching keys against the specified regular expression.
             * @param {RegExp} regExp Regular expression that keys must match in order to be included in the result.
             * @returns {$data.Collection} New instance of the same collection subclass holding the filtered contents.
             */
            filterByRegExp: function (regExp) {
                return this.filterByKeys(this.getKeysByRegExp(regExp));
            },

            /**
             * Filters collection by matching items against specified type.
             * @param {string|function|object} type String, constructor function, or prototype object each item is
             * checked against.
             * @example
             * c.filterByType('string') // fetches string items only
             * c.filterByType($oop.Base) // fetches classes and instances only
             * @returns {$data.Collection}
             */
            filterByType: function (type) {
                var isString = typeof type === 'string',
                    isConstructor = typeof type === 'function',
                    isObject = typeof type === 'object',
                    items = this.items,
                    resultItems = items instanceof Array ? [] : {},
                    itemKeys = this.getKeys(),
                    i, itemKey, item;

                for (i = 0; i < itemKeys.length; i++) {
                    itemKey = itemKeys[i];
                    item = items[itemKey];
                    if (isObject && type.isPrototypeOf(item) ||
                        isString && typeof item === type ||
                        isConstructor && item instanceof type) {
                        resultItems[itemKey] = items[itemKey];
                    }
                }

                return this.getBase().create(resultItems);
            },

            /**
             * Filters collection applying the specified selector function to each item.
             * @example
             * // filters items with value higher than 50
             * c.filterBySelector(function (item, itemKey) {
             *  return item > 50;
             * }).items; // {force: 100}
             * @param {function} selector Selector function. Receives current item as first argument, and the key
             * of the current item as second argument. Expected to return a boolean: true when the item should be
             * included in the result, false if not. (In reality and truthy or falsy value will do.)
             * @param {object} [context=this] Optional selector context. Set to the collection instance by default.
             * @returns {$data.Collection} New instance of the same collection subclass holding the filtered contents.
             */
            filterBySelector: function (selector, context) {
                $assertion
                    .isFunction(selector, "Invalid selector")
                    .isObjectOptional(context, "Invalid context");

                var items = this.items,
                    resultItems = items instanceof Array ? [] : {},
                    itemKeys = this.getKeys(),
                    i, itemKey;

                for (i = 0; i < itemKeys.length; i++) {
                    itemKey = itemKeys[i];
                    if (selector.call(context || this, items[itemKey], itemKey)) {
                        resultItems[itemKey] = items[itemKey];
                    }
                }

                return this.getBase().create(resultItems);
            },

            /**
             * Retrieves collection items values in an array, without key information, ordered by item keys, or,
             * when a comparator function is specified, in the order defined by that.
             * @param {function} [comparator] Optional callback for comparing keys when sorting. The context (`this`)
             * will be set to the collection so item values may be compared too via `this.items`. Expected to return
             * an integer, the same way as in `Array.sort()`
             * @returns {Array} Item values in order of keys.
             * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
             */
            getSortedValues: function (comparator) {
                $assertion.isFunctionOptional(comparator, "Invalid comparator function");

                var keys = this.getKeys().sort(comparator ? comparator.bind(this) : undefined),
                    result = [],
                    i;

                for (i = 0; i < keys.length; i++) {
                    result.push(this.items[keys[i]]);
                }

                return result;
            },

            /**
             * Retrieves sorted item values array wrapped in a hash.
             * @param {function} [comparator] Comparator for sorting keys.
             * @returns {$data.Hash}
             * @see $data.Collection#getSortedValues
             */
            getSortedValuesAsHash: function (comparator) {
                return $data.Hash.create(this.getSortedValues(comparator));
            },

            /**
             * Iterates over collection items and calls the specified handler function on each, until
             * either the iteration completes of handler returns `false`.
             * Iteration order is non-deterministic.
             * Iteration commences according to the initial state of the collection, with regards to
             * item keys and count. Therefore any handler function changing the collection will not thwart the
             * iteration process. However, changing the collection while iterating is strongly discouraged.
             * @example
             * c.forEachItem(function (item, itemKey, extraParam) {
             *  alert(itemKey + item + extraParam);
             * }, 'foo'); // outputs: 'foo1foo', 'bar10foo', 'force100foo'
             * @param {function} handler Function to be called on each item. The handler receives current item
             * as first argument, item key as second argument, and all other arguments passed to `.forEachItem()`
             * as the rest of its arguments.
             * @param {object} [context=this] Optional handler context. Set to the collection instance by default.
             * @returns {$data.Collection}
             */
            forEachItem: function (handler, context) {
                $assertion
                    .isFunction(handler, "Invalid callback function")
                    .isObjectOptional(context, "Invalid context");

                var items = this.items,
                    keys = this.getKeys(),
                    i, itemKey, item;

                for (i = 0; i < keys.length; i++) {
                    itemKey = keys[i];
                    item = items[itemKey];
                    if (handler.call(context || this, item, itemKey) === false) {
                        break;
                    }
                }

                return this;
            },

            /**
             * Iterates over collection items and calls the specified handler function on each in the order of keys.
             * Other than that, the method behaves the same way as `.forEach()`.
             * @param {function} handler @see $data.Collection#forEachItem
             * Iteration breaks when handler returns false.
             * @param {object} [context=this] Optional selector context. Set to the collection instance by default.
             * @param {function} [comparator] Optional callback for comparing keys when sorting. The context (`this`)
             * will be set to the collection so item values may be compared too via `this.items`. Expected to return
             * an integer, the same way as in `Array.sort()`
             * @returns {$data.Collection}
             * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
             */
            forEachItemSorted: function (handler, context, comparator) {
                $assertion
                    .isFunction(handler, "Invalid callback function")
                    .isObjectOptional(context, "Invalid context")
                    .isFunctionOptional(comparator, "Invalid comparator function");

                var items = this.items,
                    keys = this.getKeys().sort(comparator ? comparator.bind(this) : undefined),
                    i, itemKey, item;

                for (i = 0; i < keys.length; i++) {
                    itemKey = keys[i];
                    item = items[itemKey];
                    if (handler.call(context || this, item, itemKey) === false) {
                        break;
                    }
                }

                return this;
            },

            /**
             * Maps collection, changing the keys but keeping the values.
             * @param {function} mapper Mapper function. Takes `item` and `itemKey` as arguments, and is expected
             * to return the mapped item key for the new collection.
             * @param {object} [context=this] Optional handler context. Set to the collection instance by default.
             * @param {function} [conflictResolver] Optional callback that resolves key conflicts.
             * Takes conflicting values and the mapped key associated with them.
             * @param {$data.Collection} [subClass] Optional collection subclass for the output.
             * @returns {$data.Collection} New collection with mapped keys.
             */
            mapKeys: function (mapper, context, conflictResolver, subClass) {
                $assertion
                    .isFunction(mapper, "Invalid mapper function")
                    .isObjectOptional(context, "Invalid context")
                    .isFunctionOptional(conflictResolver, "Invalid conflict resolver function")
                    .isCollectionOptional(subClass, "Invalid collection subclass");

                var items = this.items,
                    keys = this.getKeys(),
                    resultItems = {},
                    i, itemKey, mappedKey, item;

                for (i = 0; i < keys.length; i++) {
                    itemKey = keys[i];
                    item = items[itemKey];
                    mappedKey = mapper.call(context || this, item, itemKey);
                    if (hOP.call(resultItems, mappedKey) && conflictResolver) {
                        // when there's a key conflict and resolver is specified
                        item = conflictResolver.call(this, resultItems[mappedKey], item, mappedKey);
                    }
                    resultItems[mappedKey] = item;
                }

                return (subClass || self).create(resultItems);
            },

            /**
             * Maps collection, changing the values but keeping the keys.
             * @example
             * c.mapValues(function (item) {
             *  return 'hello' + item;
             * }.Collection.of(String));
             * @param {function} mapper Mapper function. Takes `item` and `itemKey` as arguments, and is expected
             * to return the mapped item value for the new collection.
             * @param {object} [context=this] Optional handler context. Set to the collection instance by default.
             * @param {$data.Collection} [subClass] Optional collection subclass for the output.
             * @returns {$data.Collection} New collection instance (of the specified type) containing mapped items.
             */
            mapValues: function (mapper, context, subClass) {
                $assertion
                    .isFunction(mapper, "Invalid mapper function")
                    .isObjectOptional(context, "Invalid context")
                    .isCollectionOptional(subClass, "Invalid collection subclass");

                var items = this.items,
                    keys = this.getKeys(),
                    resultItems = items instanceof Array ? [] : {},
                    i, itemKey, item;

                for (i = 0; i < keys.length; i++) {
                    itemKey = keys[i];
                    item = items[itemKey];
                    resultItems[itemKey] = mapper.call(context || this, item, itemKey);
                }

                return (subClass || self).create(resultItems);
            },

            /**
             * Collects property from each item and packs them into a collection.
             * Equivalent to mapping the collection using a property getter, but
             * saves a function call on each item.
             * @param {string} propertyName Name of property to retrieve from each item.
             * @param {$data.Collection} [subClass] Optional collection subclass for the output.
             * @returns {$data.Collection}
             */
            collectProperty: function (propertyName, subClass) {
                $assertion.isCollectionOptional(subClass, "Invalid collection subclass");

                var items = this.items,
                    keys = this.getKeys(),
                    resultItems = items instanceof Array ? [] : {},
                    i, itemKey, item;

                for (i = 0; i < keys.length; i++) {
                    itemKey = keys[i];
                    item = items[itemKey];
                    if (typeof item !== 'undefined' && item !== null) {
                        resultItems[itemKey] = item[propertyName];
                    }
                }

                return (subClass || self).create(resultItems);
            },

            /**
             * Passes each item to the specified handler as argument, and returns the results packed in a
             * plain collection instance. Similar to `.mapValues`
             * @example
             * var c = $data.Collection.create(['foo', 'bar']);
             * function splitIntoLetters(delim, str) {
             *  return str.split(delim);
             * }
             * c.passEachItemTo(splitIntoLetters, null, 1, '').items; // [['f', 'o', 'o'], ['b', 'a', 'r']]
             * @param {function} handler Any function.
             * @param {*} [context=this] Context in which to call the handler. If handler is a method, the context
             * should be the owner (instance or class) of the method. Set to the collection instance by default.
             * @param {number} [argIndex] Argument index at which collection items will be expected.
             * @returns {$data.Collection}
             */
            passEachItemTo: function (handler, context, argIndex) {
                var args = slice.call(arguments, 3),
                    items = this.items,
                    keys = this.getKeys(),
                    resultItems = items instanceof Array ? [] : {},
                    i, itemKey;

                if (args.length) {
                    // there are additional arguments specified
                    // splicing in placeholder for collection item
                    args.splice(argIndex, 0, null);
                    for (i = 0; i < keys.length; i++) {
                        itemKey = keys[i];
                        args[argIndex] = items[itemKey];
                        resultItems[itemKey] = handler.apply(context || this, args);
                    }
                } else {
                    // no additional arguments
                    // passing items as first argument
                    for (i = 0; i < keys.length; i++) {
                        itemKey = keys[i];
                        resultItems[itemKey] = handler.call(context || this, items[itemKey]);
                    }
                }

                // returning results as plain collection
                return self.create(resultItems);
            },

            /**
             * Creates a new instance of the specified class passing each item to its constructor.
             * @param {$oop.Base} template
             * @param {number} [argIndex=0]
             * @returns {$data.Collection}
             */
            createWithEachItem: function (template, argIndex) {
                $assertion.isClass(template, "Invalid template class");
                return this.passEachItemTo(template.create, template, argIndex);
            },

            /**
             * Calls the specified method on each item (assuming they're objects and have a method by the given name),
             * and gathers their results in a collection. When the specified method was chainable on *all* items,
             * a reference to the original collection is returned, similarly to methods auto-generated by `.of()`.
             * The rest of the arguments are forwarded to the method calls.
             * @example
             * var c = $data.Collection.create({
             *  foo: "bar",
             *  hello: "world"
             * });
             * c.callOnEachItem('split').items; // {foo: ['b', 'a', 'r'], hello: ['h', 'e', 'l', 'l', 'o']}
             * @param {string} methodName Name identifying method on items.
             * @returns {$data.Collection}
             */
            callOnEachItem: function (methodName) {
                $assertion.isString(methodName, "Invalid method name");

                var args = slice.call(arguments, 1),
                    items = this.items,
                    keys = this.getKeys(),
                    resultItems = items instanceof Array ? [] : {},
                    i, itemKey, item,
                    itemMethod, itemResult,
                    isChainable = true;

                for (i = 0; i < keys.length; i++) {
                    itemKey = keys[i];
                    item = items[itemKey];
                    itemMethod = item[methodName];
                    if (typeof itemMethod === 'function') {
                        itemResult = itemMethod.apply(item, args);
                        resultItems[itemKey] = itemResult;
                        isChainable = isChainable && itemResult === item;
                    }
                }

                // chainable collection method for chainable item methods
                // otherwise returning results as plain collection
                return isChainable ?
                    this :
                    self.create(resultItems);
            }
        });
});

$oop.amendPostponed($data, 'Hash', function () {
    "use strict";

    $data.Hash.addMethods(/** @lends $data.Hash# */{
        /**
         * Reinterprets hash as collection, optionally as the specified subclass.
         * @param {$data.Collection} [subClass] Collection subclass.
         * @returns {$data.Collection}
         */
        toCollection: function (subClass) {
            $assertion.isCollectionOptional(subClass);

            if (subClass) {
                return subClass.create(this.items);
            } else {
                return $data.Collection.create(this.items);
            }
        }
    });
});

(function () {
    "use strict";

    $assertion.addTypes(/** @lends $data */{
        isCollection: function (expr) {
            return $data.Collection.isPrototypeOf(expr);
        },

        isCollectionOptional: function (expr) {
            return typeof expr === 'undefined' ||
                $data.Collection.isPrototypeOf(expr);
        }
    });

    $oop.extendBuiltIn(Array.prototype, /** @lends Array# */{
        /**
         * Creates a new Collection instance based on the current array.
         * @returns {$data.Collection}
         */
        toCollection: function () {
            return $data.Collection.create(this);
        }
    });
}());

$oop.postpone($data, 'OrderedList', function () {
    "use strict";

    var base = $data.Hash;

    /**
     * Instantiates class.
     * Sets the list up with initial items.
     * @name $data.OrderedList.create
     * @function
     * @param {string[]|number[]} [items] Initial values: array of strings or numbers.
     * @param {string} [orderType='ascending'] Order type. Either 'ascending' or 'descending'.
     * @returns {$data.OrderedList}
     */

    /**
     * Manages a list of strings or numbers and keeps it prepared for quick access and queries.
     * @class $data.OrderedList
     * @extends $data.Hash
     */
    $data.OrderedList = base.extend()
        .addConstants(/** @lends $data.OrderedList */{
            /**
             * @type {object}
             * @constant
             */
            orderTypes: {
                ascending : 'ascending',
                descending: 'descending'
            }
        })
        .addPrivateMethods(/** @lends $data.OrderedList# */{
            /**
             * Compares numbers in ascending order. To be supplied to Array.sort().
             * @private
             * @memberOf $data.OrderedList
             */
            _compareAscending: function (a, b) {
                return a > b ? 1 : a < b ? -1 : 0;
            },

            /**
             * Compares numbers in descending order. To be supplied to Array.sort().
             * @private
             * @memberOf $data.OrderedList
             */
            _compareDescending: function (a, b) {
                return b > a ? 1 : b < a ? -1 : 0;
            },

            /**
             * Gets splice index for ascending order.
             * @param {string|number} value
             * @param {number} start
             * @param {number} end
             * @returns {number}
             * @private
             */
            _spliceIndexOfAsc: function (value, start, end) {
                var items = this.items,
                    medianPos = Math.floor((start + end) / 2), // position of the median within range
                    medianValue = items[medianPos]; // median value within range

                if (items[start] >= value) {
                    // out of range hit
                    return start;
                } else if (end - start <= 1) {
                    // between two adjacent values
                    return end;
                } else if (medianValue >= value) {
                    // narrowing range to lower half
                    return this._spliceIndexOfAsc(value, start, medianPos);
                } else if (medianValue < value) {
                    // narrowing range to upper half
                    return this._spliceIndexOfAsc(value, medianPos, end);
                }

                // default index, should never be reached
                return -1;
            },

            /**
             * Gets splice index for descending order.
             * Same as $data.OrderedList#_spliceIndexOfAsc but with value comparisons flipped.
             * @param {string|number} value
             * @param {number} start
             * @param {number} end
             * @returns {number}
             * @private
             * @see $data.OrderedList#_spliceIndexOfAsc
             */
            _spliceIndexOfDesc: function (value, start, end) {
                var items = this.items,
                    medianPos = Math.floor((start + end) / 2), // position of the median within range
                    medianValue = items[medianPos]; // median value within range

                if (items[start] <= value) {
                    // out of range hit
                    return start;
                } else if (end - start <= 1) {
                    // between two adjacent values
                    return end;
                } else if (medianValue <= value) {
                    // narrowing range to lower half
                    return this._spliceIndexOfDesc(value, start, medianPos);
                } else if (medianValue > value) {
                    // narrowing range to upper half
                    return this._spliceIndexOfDesc(value, medianPos, end);
                }

                // default index, should never be reached
                return -1;
            }
        })
        .addMethods(/** @lends $data.OrderedList# */{
            /**
             * @param {string[]|number[]} [items]
             * @param {boolean} [orderType='ascending']
             * @ignore
             */
            init: function (items, orderType) {
                $assertion
                    .isArrayOptional(items, "Invalid items")
                    .isOrderTypeOptional(orderType, "Invalid order type");

                // preparing items buffer
                items = items || [];
                if (items.length) {
                    // sorting items
                    items.sort(orderType === this.orderTypes.descending ?
                        this._compareDescending :
                        this._compareAscending);
                }

                /**
                 * @name $data.OrderedList#items
                 * @type {string[]|number[]}
                 */

                base.init.call(this, items);

                /**
                 * Whether list is ordered ascending or descending.
                 * @type {string}
                 */
                this.orderType = orderType || this.orderTypes.ascending;
            },

            //////////////////////////////
            // Querying

            /**
             * Performs binary search on the list's sorted array buffer and returns the lowest index where
             * a given value would be spliced into or out of the list. For exact hits, this is the actual position,
             * but no information is given whether the value is present in the list or not.
             * @example
             * var ol = $data.OrderedList.create(['foo', 'bar', 'bee']);
             * ol.spliceIndexOf('bee') // 1
             * ol.spliceIndexOf('ban') // 0
             * ol.spliceIndexOf('fun') // 3
             * @param {string|number} value List item value.
             * @param {number} [start=0] Start position of search range. Default: 0.
             * @param {number} [end] Ending position of search range. Default: this.items.length - 1.
             * @returns {number}
             */
            spliceIndexOf: function (value, start, end) {
                start = start || 0;
                end = end || this.items.length;

                var orderTypes = this.orderTypes;

                switch (this.orderType) {
                case orderTypes.descending:
                    return this._spliceIndexOfDesc(value, start, end);
                case orderTypes.ascending:
                    return this._spliceIndexOfAsc(value, start, end);
                default:
                    // should not be reached - order is either ascending or descending
                    return -1;
                }
            },

            /**
             * Returns list items in a sorted array starting from `startValue` up to but not including `endValue`.
             * @example
             * var ol = $data.OrderedList.create(['foo', 'bar', 'ban', 'bee']);
             * ol.getRange('bar', 'foo') // ['bar', 'bee', 'foo']
             * ol.getRange('a', 'bee') // ['ban', 'bar', 'bee']
             * ol.getRange('foo', 'fun') // ['foo']
             * @param {string|number} startValue Value marking start of the range.
             * @param {string|number} endValue Value marking end of the range.
             * @param {number} [offset=0] Number of items to skip at start.
             * @param {number} [limit=Infinity] Number of items to fetch at most.
             * @returns {Array} Shallow copy of the array's affected segment.
             */
            getRange: function (startValue, endValue, offset, limit) {
                offset = offset || 0;
                limit = typeof limit === 'undefined' ? Infinity : limit;

                var startIndex = this.spliceIndexOf(startValue),
                    endIndex = this.spliceIndexOf(endValue);

                return this.items.slice(startIndex + offset, Math.min(endIndex, startIndex + offset + limit));
            },

            /**
             * Retrieves a range of values and wraps it in a Hash object.
             * @param {string|number} startValue Value marking start of the range.
             * @param {string|number} endValue Value marking end of the range.
             * @param {number} [offset=0] Number of items to skip at start.
             * @param {number} [limit=Infinity] Number of items to fetch at most.
             * @returns {$data.Hash} Hash with a shallow copy of the array's affected segment.
             * @see $data.OrderedList#getRange
             */
            getRangeAsHash: function (startValue, endValue, offset, limit) {
                var range = this.getRange.apply(this, arguments);
                return $data.Hash.create(range);
            },

            //////////////////////////////
            // Content manipulation

            /**
             * Adds a single value to the list and returns the position where the value was inserted.
             * @example
             * var ol = $data.OrderedList.create(['b', 'c']);
             * var pos = ol.addItem('a');
             * pos // 0
             * ol.items // ['a', 'b', 'c']
             * @param {string|number} value Value to be inserted.
             * @returns {number} Array index of the inserted item.
             */
            addItem: function (value) {
                var spliceIndex = this.spliceIndexOf(value);
                this.items.splice(spliceIndex, 0, value);
                return spliceIndex;
            },

            /**
             * Adds multiple values to the list.
             * @param {string[]|number[]} values Array of values to be inserted.
             * @returns {$data.OrderedList}
             */
            addItems: function (values) {
                $assertion.isArray(values, "Invalid item values");
                var i;
                for (i = 0; i < values.length; i++) {
                    this.addItem(values[i]);
                }
                return this;
            },

            /**
             * Removes the first available item matching the value and returns the affected position.
             * Returns -1 when the value is not present in the list.
             * @example
             * var ol = $data.OrderedList.create(['b', 'c', 'a']);
             * var pos = ol.removeItem('b');
             * pos // 1
             * ol.items // ['a', 'c']
             * @param {string|number} value Value to be removed.
             * @returns {number} The index from which the item was removed. -1 if item was not present.
             */
            removeItem: function (value) {
                var items = this.items,
                    spliceIndex = this.spliceIndexOf(value);

                // must check whether value is present
                if (items[spliceIndex] === value) {
                    items.splice(spliceIndex, 1);
                } else {
                    spliceIndex = -1;
                }

                return spliceIndex;
            },

            /**
             * Removes all items specified in `values`.
             * @param {string[]|number[]} values Array of values to be removed.
             * @returns {$data.OrderedList}
             */
            removeItems: function (values) {
                $assertion.isArray(values, "Invalid item values");
                var i;
                for (i = 0; i < values.length; i++) {
                    this.removeItem(values[i]);
                }
                return this;
            },

            /**
             * Removes a range from the list starting from startValue up to but not including endValue, and
             * returns the index at which actual removal began.
             * Neither `startValue` nor `endValue` has to be present in the list.
             * @param {string|number} startValue Lower bound for range.
             * @param {string|number} endValue Upper bound for range.
             * @returns {number} Actual starting index of removal. -1 if no item matched the specified range.
             */
            removeRange: function (startValue, endValue) {
                var startIndex = this.spliceIndexOf(startValue),
                    endIndex = this.spliceIndexOf(endValue),
                    length = endIndex - startIndex;

                if (length > 0) {
                    this.items.splice(startIndex, length);
                    return startIndex;
                } else {
                    return -1;
                }
            },

            /**
             * Clones OrderedList instance, setting the correct orderType property.
             * @returns {$data.OrderedList}
             */
            clone: function () {
                var result = base.clone.call(this);

                // copying over order type
                result.orderType = this.orderType;

                return result;
            }

            /**
             * Clears the list.
             * @name $data.OrderedList#clear
             * @function
             * @returns {$data.OrderedList}
             */
        });
});

$oop.amendPostponed($data, 'Hash', function () {
    "use strict";

    $data.Hash.addMethods(/** @lends $data.Hash# */{
        /**
         * Converts Hash to OrderedList instance.
         * @param {string} [orderType='ascending']
         * @returns {$data.OrderedList}
         */
        toOrderedList: function (orderType) {
            return $data.OrderedList.create(this.items, orderType);
        }
    });
});

(function () {
    "use strict";

    $assertion.addTypes(/** @lends $data */{
        /** @param {string} expr */
        isOrderType: function (expr) {
            return expr && $data.OrderedList.orderTypes[expr] === expr;
        },

        /** @param {string} [expr] */
        isOrderTypeOptional: function (expr) {
            return $data.OrderedList.orderTypes[expr] === expr;
        }
    });

    $oop.extendBuiltIn(Array.prototype, /** @lends Array# */{
        /**
         * Creates a new OrderedList instance based on the current array.
         * @param {string} [orderType='ascending']
         * @returns {$data.OrderedList}
         */
        toOrderedList: function (orderType) {
            return $data.OrderedList.create(this, orderType);
        }
    });
}());

$oop.postpone($data, 'OrderedStringList', function () {
    "use strict";

    /**
     * Instantiates class.
     * @name $data.OrderedStringList.create
     * @function
     * @param {string[]} [items] Initial values. Array of strings.
     * @param {string} [orderType='ascending'] Order type. Either 'ascending' or 'descending'.
     * @returns {$data.OrderedStringList}
     */

    /**
     * Ordered list extended with string-specific fast, prefix-based search.
     * @class $data.OrderedStringList
     * @extends $data.OrderedList
     */
    $data.OrderedStringList = $data.OrderedList.extend()
        .addPrivateMethods(/** @lends $data.OrderedStringList */{
            /**
             * Calculates range search end value for prefix search based on start value.
             * Increments char code on the string's last character.
             * @param {string} startValue
             * @returns {String} Calculated end value
             * @private
             */
            _getEndValue: function (startValue) {
                return startValue.slice(0, -1) + String.fromCharCode(startValue.substr(-1).charCodeAt(0) + 1);
            },

            /**
             * Returns lowest value string that is higher than the input.
             * @param {string} startValue
             * @returns {string}
             * @private
             */
            _getNextValue: function (startValue) {
                return startValue + String.fromCharCode(0);
            }
        })
        .addMethods(/** @lends $data.OrderedStringList# */{
            /**
             * Retrieves items from the list matching the specified prefix.
             * @example
             * var osl = $data.OrderedStringList(['hi', 'hello', 'hire', 'foo']);
             * osl.getRangeByPrefix('hi') // ['hi', 'hire']
             * osl.getRangeByPrefix('h') // ['hello', 'hi', 'hire']
             * @param {string} prefix Prefix to be matched by list items.
             * @param {boolean} [excludeOriginal=false] Whether to exclude `prefix` from the results
             * @param {number} [offset=0] Number of items to skip at start.
             * @param {number} [limit=Infinity] Number of items to fetch at most.
             * @returns {string[]} Sorted array of matches.
             */
            getRangeByPrefix: function (prefix, excludeOriginal, offset, limit) {
                $assertion
                    .assert(typeof prefix === 'string' && prefix.length > 0, "Empty prefix")
                    .isBooleanOptional(excludeOriginal);

                var startValue = excludeOriginal ?
                        this._getNextValue(prefix) :
                        prefix,
                    endValue = this._getEndValue(prefix);

                return this.getRange(startValue, endValue, offset, limit);
            },

            /**
             * Retrieves items from the list matching the specified prefix, wrapped in a hash.
             * @param {string} prefix Prefix to be matched by list items.
             * @param {boolean} [excludeOriginal=false] Whether to exclude `prefix` from the results
             * @param {number} [offset=0] Number of items to skip at start.
             * @param {number} [limit=Infinity] Number of items to fetch at most.
             * @returns {$data.Hash}
             * @see $data.OrderedList#getRange
             */
            getRangeByPrefixAsHash: function (prefix, excludeOriginal, offset, limit) {
                var range = this.getRangeByPrefix.apply(this, arguments);
                return $data.Hash.create(range);
            },

            /**
             * Removes all occurrences of a specific string from the list.
             * @example
             * var osl = $data.OrderedStringList(['hi', 'hello', 'hire', 'hi', 'foo']);
             * osl.removeAll('hi').items // ['hello', 'hire', 'foo']
             * @param {string} value String value to be removed from list.
             * @returns {$data.OrderedStringList}
             */
            removeEvery: function (value) {
                $assertion.isString(value);
                this.removeRange(value, this._getNextValue(value));
                return this;
            }
        });
});

$oop.amendPostponed($data, 'Hash', function () {
    "use strict";

    $data.Hash.addMethods(/** @lends $data.Hash# */{
        /**
         * Converts Hash to OrderedStringList instance.
         * @param {string} [orderType='ascending']
         * @returns {$data.OrderedStringList}
         */
        toOrderedStringList: function (orderType) {
            return $data.OrderedStringList.create(this.items, orderType);
        }
    });
});

(function () {
    "use strict";

    $oop.extendBuiltIn(Array.prototype, /** @lends Array# */{
        /**
         * Creates a new OrderedStringList instance based on the current array.
         * @param {string} [orderType='ascending']
         * @returns {$data.OrderedStringList}
         */
        toOrderedStringList: function (orderType) {
            return $data.OrderedStringList.create(this, orderType);
        }
    });
}());

$oop.postpone($data, 'Set', function () {
    "use strict";

    var base = $data.Hash,
        self = base.extend(),
        hOP = Object.prototype.hasOwnProperty;

    /**
     * Instantiates class.
     * @name $data.Set.create
     * @function
     * @param {object} items
     * @returns {$data.Set}
     */

    /**
     * Hash-based structure for performing standard set operations such as union, intersection, and difference.
     * @class
     * @extends $data.Hash
     */
    $data.Set = self
        .addMethods(/** @lends $data.Set# */{
            /**
             * Retrieves intersection of two sets.
             * @param {$data.Set} remoteSet
             * @returns {$data.Set} New set instance with items present in both current and remote set.
             */
            intersectWith: function (remoteSet) {
                $assertion.isSet(remoteSet, "Invalid set");

                var currentItems = this.items,
                    remoteItems = remoteSet.items,
                    resultItems = currentItems instanceof Array ? [] : {},
                    itemKey;

                for (itemKey in currentItems) {
                    if (hOP.call(currentItems, itemKey) &&
                        hOP.call(remoteItems, itemKey)) {
                        resultItems[itemKey] = currentItems[itemKey];
                    }
                }

                return this.getBase().create(resultItems);
            },

            /**
             * Extracts symmetric difference of two sets.
             * @param {$data.Set} remoteSet
             * @returns {$data.Set} New set instance with elements only present in either current or remote set.
             */
            differenceWith: function (remoteSet) {
                return this
                    .unionWith(remoteSet)
                    .subtract(this.intersectWith(remoteSet));
            },

            /**
             * Unites two sets.
             * @param {$data.Set} remoteSet
             * @returns {$data.Set} New set instance with items from both current and remote sets.
             */
            unionWith: function (remoteSet) {
                $assertion.isSet(remoteSet, "Invalid set");

                var resultItems = $data.DataUtils.shallowCopy(this.items),
                    currentItems = this.items,
                    remoteItems = remoteSet.items,
                    itemKey;

                for (itemKey in remoteItems) {
                    if (hOP.call(remoteItems, itemKey) && !hOP.call(currentItems, itemKey)) {
                        resultItems[itemKey] = remoteItems[itemKey];
                    }
                }

                return this.getBase().create(resultItems);
            },

            /**
             * Retrieves relative complement of two sets (A\B).
             * @param {$data.Set} remoteSet
             * @returns {$data.Set} New set instance with items from current instance except what's also present in
             * remote set.
             */
            subtract: function (remoteSet) {
                $assertion.isSet(remoteSet, "Invalid set");

                var currentItems = this.items,
                    remoteItems = remoteSet.items,
                    resultItems = currentItems instanceof Array ? [] : {},
                    itemKey;

                for (itemKey in currentItems) {
                    if (hOP.call(currentItems, itemKey) && !hOP.call(remoteItems, itemKey)) {
                        resultItems[itemKey] = currentItems[itemKey];
                    }
                }

                return this.getBase().create(resultItems);
            },

            /**
             * Retrieves relative complement of two sets (B\A).
             * @param {$data.Set} remoteSet
             * @returns {$data.Set} New set instance with items from remote instance except what's also present in
             * current set.
             */
            subtractFrom: function (remoteSet) {
                $assertion.isSet(remoteSet, "Invalid set");

                var currentItems = this.items,
                    remoteItems = remoteSet.items,
                    resultItems = currentItems instanceof Array ? [] : {},
                    itemKey;

                for (itemKey in remoteItems) {
                    if (hOP.call(remoteItems, itemKey) && !hOP.call(currentItems, itemKey)) {
                        resultItems[itemKey] = remoteItems[itemKey];
                    }
                }

                return this.getBase().create(resultItems);
            }
        });
});

$oop.amendPostponed($data, 'Hash', function () {
    "use strict";

    $data.Hash.addMethods(/** @lends $data.Hash# */{
        /**
         * Reinterprets hash as a string dictionary.
         * @returns {$data.Set}
         */
        toSet: function () {
            return $data.Set.create(this.items);
        }
    });
});

(function () {
    "use strict";

    $assertion.addTypes(/** @lends $data */{
        isSet: function (expr) {
            return $data.Set.isBaseOf(expr);
        },

        isSetOptional: function (expr) {
            return typeof expr === 'undefined' ||
                $data.Set.isBaseOf(expr);
        }
    });

    $oop.extendBuiltIn(Array.prototype, /** @lends Array# */{
        /**
         * Creates a new Set instance based on the current array.
         * @returns {$data.Set}
         */
        toSet: function () {
            return $data.Set.create(this);
        }
    });
}());

$oop.postpone($data, 'Link', function () {
    "use strict";

    var base = $oop.Base,
        self = base.extend();

    /**
     * Creates a Link instance.
     * @name $data.Link.create
     * @function
     * @returns {$data.Link}
     */

    /**
     * Basic link, can chain other links to it.
     * @class
     * @extends $oop.Base
     */
    $data.Link = self
        .addMethods(/** @lends $data.Link# */{
            /** @ignore */
            init: function () {
                /**
                 * Link that comes before the current link in the chain.
                 * @type {$data.Link}
                 */
                this.previousLink = undefined;

                /**
                 * Link that comes after the current link in the chain.
                 * @type {$data.Link}
                 */
                this.nextLink = undefined;

                /**
                 * Chain instance the link is associated with.
                 * @type {$data.OpenChain}
                 */
                this.parentChain = undefined;
            },

            /**
             * Adds current unconnected link after the specified link.
             * @param {$data.Link} link
             * @returns {$data.Link}
             */
            addAfter: function (link) {
                $assertion.assert(!this.previousLink && !this.nextLink,
                    "Attempted to connect already connected link");

                // setting links on current link
                this.previousLink = link;
                this.nextLink = link.nextLink;
                this.parentChain = link.parentChain;

                // setting self as previous link on old next link
                if (link.nextLink) {
                    link.nextLink.previousLink = this;
                }

                // setting self as next link on target link
                link.nextLink = this;

                return this;
            },

            /**
             * Adds current link before the specified link.
             * @param {$data.Link} link
             * @returns {$data.Link}
             */
            addBefore: function (link) {
                $assertion.assert(!this.previousLink && !this.nextLink,
                    "Attempted to connect already connected link");

                // setting links on current link
                this.nextLink = link;
                this.previousLink = link.previousLink;
                this.parentChain = link.parentChain;

                // setting self as next link on old previous link
                if (link.previousLink) {
                    link.previousLink.nextLink = this;
                }

                // setting self as previous link on target link
                link.previousLink = this;

                return this;
            },

            /**
             * Removes link from the chain.
             * @returns {$data.Link}
             */
            unlink: function () {
                var nextLink = this.nextLink,
                    previousLink = this.previousLink;

                if (nextLink) {
                    nextLink.previousLink = previousLink;
                }
                if (previousLink) {
                    previousLink.nextLink = nextLink;
                }

                this.previousLink = undefined;
                this.nextLink = undefined;
                this.parentChain = undefined;

                return this;
            },

            /**
             * Sets the parent chain on unconnected links.
             * Fails when called on connected links.
             * @param {$data.OpenChain} parentChain
             * @returns {$data.Link}
             */
            setParentChain: function (parentChain) {
                $assertion.assert(!this.previousLink && !this.nextLink,
                    "Attempted to set parent chain on connected link");
                this.parentChain = parentChain;
                return this;
            }
        });
});

$oop.postpone($data, 'ValueLink', function () {
    "use strict";

    var base = $data.Link,
        self = base.extend();

    /**
     * Creates a ValueLink instance.
     * @name $data.ValueLink.create
     * @function
     * @returns {$data.ValueLink}
     */

    /**
     * Link that carries a value, and has the option to be unlinked.
     * @class
     * @extends $data.Link
     */
    $data.ValueLink = self
        .addMethods(/** @lends $data.ValueLink# */{
            /** @ignore */
            init: function () {
                base.init.call(this);

                /**
                 * Value associated with link.
                 * @type {*}
                 */
                this.value = undefined;
            },

            /**
             * Sets link value.
             * @param {*} value
             * @returns {$data.ValueLink}
             */
            setValue: function (value) {
                this.value = value;
                return this;
            }
        });
});

$oop.postpone($data, 'OpenChain', function () {
    "use strict";

    var base = $oop.Base,
        self = base.extend();

    /**
     * Creates an OpenChain instance.
     * @name $data.OpenChain.create
     * @function
     * @returns {$data.OpenChain}
     */

    /**
     * Chain data structure with two fixed ends and value carrying links in between.
     * OpenChain behaves like a stack in that you may append and prepend the chain
     * using a stack-like API. (push, pop, etc.)
     * @class
     * @extends $oop.Base
     */
    $data.OpenChain = self
        .addMethods(/** @lends $data.OpenChain# */{
            /** @ignore */
            init: function () {
                /**
                 * First (fixed) link in the chain.
                 * @type {$data.ValueLink}
                 */
                this.firstLink = $data.Link.create()
                    .setParentChain(this);

                /**
                 * Last (fixed) link in the chain.
                 * @type {$data.ValueLink}
                 */
                this.lastLink = $data.Link.create()
                    .addAfter(this.firstLink);
            },

            /**
             * Adds link at the end of the chain.
             * @param {$data.Link} link
             */
            pushLink: function (link) {
                link.addBefore(this.lastLink);
                return this;
            },

            /**
             * Adds new link with the specified value at the end of the chain.
             * @param {*} value
             * @returns {$data.OpenChain}
             */
            pushValue: function (value) {
                this.pushLink($data.ValueLink.create()
                    .setValue(value));
                return this;
            },

            /**
             * Removes link from the end of the chain and returns removed link.
             * @returns {$data.Link}
             */
            popLink: function () {
                return this.lastLink.previousLink
                    .unlink();
            },

            /**
             * Adds link at the start of the chain.
             * @param {$data.Link} link
             */
            unshiftLink: function (link) {
                link.addAfter(this.firstLink);
                return this;
            },

            /**
             * Adds new link with the specified value at the start of the chain.
             * @param {*} value
             * @returns {$data.OpenChain}
             */
            unshiftValue: function (value) {
                this.unshiftLink($data.ValueLink.create()
                    .setValue(value));
                return this;
            },

            /**
             * Removes link from the start of the chain and returns removed link.
             * @returns {$data.Link}
             */
            shiftLink: function () {
                return this.firstLink.nextLink
                    .unlink();
            },

            /**
             * Iterates over links from first to last and calls the specified function
             * passing the current link to it.
             * @param {function} handler
             * @param {object} [context=this]
             * @returns {$data.OpenChain}
             */
            forEachLink: function (handler, context) {
                $assertion
                    .isFunction(handler, "Invalid callback function")
                    .isObjectOptional(context, "Invalid context");

                var link = this.firstLink.nextLink,
                    i = 0;

                while (link !== this.lastLink) {
                    if (handler.call(context || this, link, i++) === false) {
                        break;
                    }
                    link = link.nextLink;
                }

                return this;
            },

            /**
             * Retrieves the chain's links as an array.
             * O(n) complexity.
             * @returns {Array}
             */
            getLinks: function () {
                var link = this.firstLink.nextLink,
                    result = [];

                while (link !== this.lastLink) {
                    result.push(link);
                    link = link.nextLink;
                }

                return result;
            },

            /**
             * Retrieves the values stored in the chain's links as an array.
             * O(n) complexity.
             * @returns {Array}
             */
            getValues: function () {
                var link = this.firstLink.nextLink,
                    result = [];

                while (link !== this.lastLink) {
                    result.push(link.value);
                    link = link.nextLink;
                }

                return result;
            }
        });
});

$oop.postpone($data, 'Path', function () {
    "use strict";

    var base = $oop.Base,
        self = base.extend();

    /**
     * Instantiates class.
     * Constructs path instance and populates it with path information. Keys are assumed to be URI-encoded.
     * @name $data.Path.create
     * @function
     * @param {string[]} path Path in array representation (eg. ['this', 'is', 'a', 'path']).
     * @returns {$data.Path}
     */

    /**
     * Unambiguously identifies a node in a tree-like structure. Paths break down to a series of keys, each
     * subsequent key corresponding to a property in the next child node.
     * @class
     * @extends $oop.Base
     */
    $data.Path = self
        .addConstants(/** @lends $data.Path */{
            PATH_SEPARATOR: '>'
        })
        .addMethods(/** @lends $data.Path# */{
            /**
             * @param {string[]} asArray Path in string or array representation
             * @ignore
             */
            init: function (asArray) {
                $assertion.isArray(asArray, "Invalid path array");

                /**
                 * Path in array representation. Keys are unencoded. Not to be modified externally.
                 * @type {Array}
                 */
                this.asArray = asArray;
            },

            /**
             * Fetches the last key from the path.
             * @returns {*}
             */
            getLastKey: function () {
                var asArray = this.asArray;
                return asArray[asArray.length - 1];
            },

            /**
             * Creates a new instance of the same path subclass, initialized with identical path information.
             * @returns {$data.Path}
             */
            clone: function () {
                return /** @type $data.Path */ this.getBase().create(this.asArray.concat());
            },

            /**
             * Trims leading end of path. Alters path buffer!
             * @example
             * var p = 'test>path>it>is'.toPath();
             * p.trimLeft().asArray // ['path', 'it', 'is']
             * @param {number} [count=1] Number of keys to remove from path.
             * @returns {$data.Path}
             */
            trimLeft: function (count) {
                if (typeof count === 'undefined' || count === 1) {
                    this.asArray.shift();
                } else {
                    this.asArray = this.asArray.slice(count);
                }
                return this;
            },

            /**
             * Trims trailing end of path. Alters path buffer!
             * @example
             * var p = 'test>path>it>is'.toPath();
             * p.trimRight().asArray // ['test', 'path', 'it']
             * @param {number} [count=1] Number of keys to remove from path.
             * @returns {$data.Path}
             */
            trimRight: function (count) {
                if (typeof count === 'undefined' || count === 1) {
                    this.asArray.pop();
                } else {
                    this.asArray = this.asArray.slice(0, 0 - count);
                }
                return this;
            },

            /**
             * Appends the specified path to the current path. Alters path buffer!
             * @param {$data.Path} path Path to be appended to the current path.
             * @returns {$data.Path}
             */
            append: function (path) {
                this.asArray = this.asArray.concat(path.asArray);
                return this;
            },

            /**
             * Appends a single key to the current path. Alters path buffer!
             * @param {string} key Key to be appended to the current path.
             * @returns {$data.Path}
             */
            appendKey: function (key) {
                this.asArray.push(key);
                return this;
            },

            /**
             * Prepends the current path with the specified path. Alters path buffer!
             * @example
             * var p = 'test>path'.toPath();
             * p.prepend('foo.bar').asArray // ['foo', 'bar', 'test', 'path']
             * @param {$data.Path} path Path to be prepended to the current path.
             * @returns {$data.Path}
             */
            prepend: function (path) {
                this.asArray = path.asArray.concat(this.asArray);
                return this;
            },

            /**
             * Prepends a single key to the current path. Alters path buffer!
             * @param {string} key Key to be prepended to the current path.
             * @returns {$data.Path}
             */
            prependKey: function (key) {
                this.asArray.unshift(key);
                return this;
            },

            /**
             * Checks whether current path and specified path are identical by value.
             * @example
             * var p = 'foo>bar'.toPath();
             * p.equal('foo.bar') // true
             * p.equal('hello.world') // false
             * @param {$data.Path} remotePath Remote path
             * @returns {boolean}
             */
            equals: function (remotePath) {
                if (!self.isBaseOf(remotePath)) {
                    return false;
                }

                var currentArray = this.asArray,
                    remoteArray = remotePath.asArray,
                    i;

                if (currentArray.length !== remoteArray.length) {
                    return false;
                } else {
                    for (i = 0; i < remoteArray.length; i++) {
                        if (currentArray[i] !== remoteArray[i]) {
                            return false;
                        }
                    }
                }

                return true;
            },

            /**
             * Checks whether current path is relative to the specified root path. Path A is relative to B
             * when A and B have a common base path and that base path is B.
             * @example
             * var p = 'foo>bar'.toPath();
             * p.isRelativeTo('foo') // true
             * p.isRelativeTo('foo.bar.hello') // false
             * @param {$data.Path} rootPath
             * @returns {boolean}
             */
            isRelativeTo: function (rootPath) {
                $assertion.isPath(rootPath, "Invalid path");

                var currentArray = this.asArray,
                    rootArray = rootPath.asArray,
                    i;

                if (rootArray.length > currentArray.length) {
                    return false;
                }

                for (i = 0; i < rootArray.length; i++) {
                    if (currentArray[i] !== rootArray[i]) {
                        return false;
                    }
                }

                return true;
            },

            /**
             * Determines whether current path is root of specified path.
             * @param {$data.Path} relativePath
             * @returns {boolean}
             */
            isRootOf: function (relativePath) {
                $assertion.isPath(relativePath, "Invalid path");
                return relativePath.isRelativeTo(this);
            },

            /**
             * Returns the string representation for the path, keys URI encoded and separated by '>'.
             * @example
             * ['test^', 'path'].toPath().toString() // "test%5E>path"
             * @returns {string}
             */
            toString: function () {
                return this.asArray.toUriEncoded().join(self.PATH_SEPARATOR);
            }
        });
});

(function () {
    "use strict";

    $assertion.addTypes(/** @lends $data */{
        isPath: function (expr) {
            return $data.Path.isBaseOf(expr);
        },

        isPathOptional: function (expr) {
            return typeof expr === 'undefined' ||
                $data.Path.isBaseOf(expr);
        }
    });

    $oop.extendBuiltIn(String.prototype, /** @lends String# */{
        /**
         * Creates a new Path instance based on the current string.
         * Individual keys will be URI decoded.
         * @returns {$data.Path}
         */
        toPath: function () {
            var Path = $data.Path;
            return Path.create(this.split(Path.PATH_SEPARATOR).toUriDecoded());
        }
    });

    $oop.extendBuiltIn(Array.prototype, /** @lends Array# */{
        /**
         * Creates a new Path instance based on the current array.
         * @returns {$data.Path}
         */
        toPath: function () {
            return $data.Path.create(this);
        }
    });
}());

$oop.postpone($data, 'KeyValuePattern', function () {
    "use strict";

    var base = $oop.Base,
        self = base.extend(),
        hOP = Object.prototype.hasOwnProperty,
        validators = $assertion.validators;

    /**
     * Instantiates class
     * @name $data.KeyValuePattern.create
     * @function
     * @param {string|object} pattern
     * @example
     * $data.KeyValuePattern.create('|') // matches any key
     * $data.KeyValuePattern.create(['foo', 'bar']) // matches keys 'foo' and 'bar'
     * $data.KeyValuePattern.create('foo<bar^hello') // matches KV pairs 'foo'-'hello' & 'bar'-'hello'
     * @returns {$data.KeyValuePattern}
     */

    /**
     * Matches a key-value pair. A series of key-value patterns make
     * up a query, which then can be used to traverse tree structures with.
     * @class $data.KeyValuePattern
     * @extends $oop.Base
     */
    $data.KeyValuePattern = self
        .addConstants(/** @lends $data.KeyValuePattern */{
            /**
             * Separates keys from values in string pattern
             * @type {string}
             */
            KEY_VALUE_SEPARATOR: '^',

            /**
             * Separates options within the key part of a string pattern
             * @type {string}
             */
            OPTION_SEPARATOR: '<',

            /**
             * Symbol matching all keys
             * @type {string}
             */
            WILDCARD_SYMBOL: '|',

            /**
             * Symbol matching primitive types (non-objects).
             * @type {string}
             */
            PRIMITIVE_SYMBOL: '"',

            /**
             * Symbol indication skip mode during traversal
             * @type {string}
             */
            SKIP_SYMBOL: '\\',

            /** @type {string} */
            MARKER_BRACKET: '[',

            /** @type {string} */
            MARKER_CURLY: '{',

            /**
             * Extracts markers and content from the string representation of a
             * key value pattern. There are two markers: the bracket and curly brace.
             * A marker is valid when and only when the first and last character is a
             * boundary character, and no boundary characters can be found inside the
             * KVP contents. Does not check for validity otherwise.
             * Markers have no meaning on their own. Their meaning is inferred by the
             * mechanism that uses them, eg. tree traversal.
             * @example
             * "{hello^world}"
             * "[|]"
             * @type {RegExp}
             */
            RE_MARKER_EXTRACTOR: /\[([^\[\]]*)\]|{([^{}]*)}|.*/
        })
        .addPrivateMethods(/** @lends $data.KeyValuePattern */{
            /**
             * URI decodes all items of an array.
             * @param {string[]} strings Array of strings
             * @returns {string[]} Array w/ all strings within URI-encoded
             * @private
             */
            _encodeURI: function (strings) {
                var result = [],
                    i;
                for (i = 0; i < strings.length; i++) {
                    result.push(encodeURI(strings[i]));
                }
                return result;
            },

            /**
             * URI decodes all items of an array.
             * @param {string[]} strings Array of URI-encoded strings
             * @returns {string[]} Array w/ all strings URI-decoded
             * @private
             */
            _decodeURI: function (strings) {
                var result = [],
                    i;
                for (i = 0; i < strings.length; i++) {
                    result.push(decodeURI(strings[i]));
                }
                return result;
            },

            /**
             * Expands descriptor from string to object when necesary.
             * @private
             */
            _expandDescriptor: function () {
                var descriptor = this.descriptor;

                if (typeof descriptor === 'string') {
                    // descriptor is simple string
                    // transforming descriptor to object with key wrapped inside
                    this.descriptor = {
                        key: descriptor
                    };
                }
            },

            /**
             * Parses string representation of pattern
             * @param {string} pattern
             * @returns {string|object}
             * @private
             */
            _parseString: function (pattern) {
                var markerDescriptor = pattern.match(self.RE_MARKER_EXTRACTOR),
                    content = markerDescriptor[2] || markerDescriptor[1] || markerDescriptor[0],
                    marker = markerDescriptor[2] || markerDescriptor[1] ?
                        // pattern is marked, taking first character as marker
                        pattern[0] :
                        // pattern is unmarked
                        undefined,
                    keyValue = content.split(self.KEY_VALUE_SEPARATOR),
                    key = keyValue[0],
                    result;

                // processing key part of pattern
                if (key === self.SKIP_SYMBOL) {
                    // skip pattern can't have other attributes
                    return {
                        symbol: key
                    };
                } else if (key === self.WILDCARD_SYMBOL ||
                    key === self.PRIMITIVE_SYMBOL) {
                    // key is a wildcard symbol, matching any key
                    result = {
                        symbol: key
                    };
                } else if (key.indexOf(self.OPTION_SEPARATOR) > -1) {
                    // optional keys matching those keys only
                    result = {
                        options: this._decodeURI(key.split(self.OPTION_SEPARATOR))
                    };
                } else if (keyValue.length === 1 && !marker) {
                    // string literal key, no value
                    return decodeURI(key);
                } else {
                    // string literal key, has value or marker
                    result = {
                        key: decodeURI(key)
                    };
                }

                if (marker) {
                    // adding marker
                    result.marker = marker;
                }

                // processing value part of pattern
                if (keyValue.length > 1) {
                    // pattern has value bundled
                    result.value = decodeURI(keyValue[1]);
                }

                return result;
            }
        })
        .addMethods(/** @lends $data.KeyValuePattern# */{
            /**
             * @param {string|object} pattern
             * @ignore
             */
            init: function (pattern) {
                /**
                 * Pattern descriptor
                 * @type {string|Object}
                 */
                this.descriptor = undefined;

                if (validators.isString(pattern)) {
                    this.descriptor = this._parseString(pattern);
                } else if (pattern instanceof Array) {
                    this.descriptor = {
                        options: pattern
                    };
                } else if (pattern instanceof Object) {
                    this.descriptor = pattern;
                } else {
                    $assertion.assert(false, "Invalid pattern");
                }
            },

            /**
             * Sets value on query pattern. Pattern with a value will only
             * match nodes with the specified value.
             * @param {*} value
             * @returns {$data.KeyValuePattern}
             */
            setValue: function (value) {
                // making sure descriptor is object
                this._expandDescriptor();

                // adding value to descriptor
                this.descriptor.value = value;

                return this;
            },

            /**
             * Tells whether the current pattern is a skipper
             * @returns {boolean}
             */
            isSkipper: function () {
                return this.descriptor.symbol === self.SKIP_SYMBOL;
            },

            /**
             * Returns marker for key value pattern instance.
             * @returns {string}
             */
            getMarker: function () {
                return this.descriptor.marker;
            },

            /**
             * Sets pattern marker.
             * @param {string} marker Left marker boundary. Either '[' or '{'.
             * @returns {$data.KeyValuePattern}
             */
            setMarker: function (marker) {
                $assertion.assert(
                    marker === self.MARKER_BRACKET || marker === self.MARKER_CURLY,
                    "Invalid marker"
                );

                // making sure descriptor is object
                this._expandDescriptor();

                // adding marker to descriptor
                this.descriptor.marker = marker;

                return this;
            },

            /**
             * Determines whether pattern matches specified key
             * @param {string} key
             * @returns {boolean}
             */
            matchesKey: function (key) {
                var descriptor = this.descriptor;

                if (typeof descriptor === 'string') {
                    // descriptor is string, must match by value
                    return descriptor === key;
                } else if (descriptor instanceof Object) {
                    // descriptor is object, properties tell about match
                    if (hOP.call(descriptor, 'symbol')) {
                        // descriptor is wildcard object
                        return descriptor.symbol === self.WILDCARD_SYMBOL ||
                            descriptor.symbol === self.PRIMITIVE_SYMBOL;
                    } else if (hOP.call(descriptor, 'options')) {
                        // descriptor is list of options
                        return descriptor.options.indexOf(key) > -1;
                    } else if (hOP.call(descriptor, 'key')) {
                        return descriptor.key === key;
                    }
                }

                return false;
            },

            /**
             * Determines whether pattern matches specified value.
             * @param {*} value
             * @returns {boolean}
             */
            matchesValue: function (value) {
                var descriptor = this.descriptor;

                if (descriptor.symbol === self.PRIMITIVE_SYMBOL) {
                    // descriptor expects a primitive type value
                    return typeof value !== 'object';
                } else if (typeof descriptor.value !== 'undefined') {
                    // there is a literal value specified in the descriptor
                    // matching against descriptor's value
                    return descriptor.value === value;
                } else {
                    // no value specified in descriptor
                    return true;
                }
            },

            /**
             * Creates string representation of pattern
             * @returns {string}
             */
            toString: function () {
                var descriptor = this.descriptor,
                    result;

                if (typeof descriptor === 'string') {
                    // descriptor is string literal (key only)
                    result = encodeURI(descriptor);
                } else if (descriptor instanceof Object) {
                    // adding key
                    if (hOP.call(descriptor, 'symbol')) {
                        // descriptor contains symbol
                        result = descriptor.symbol;
                    } else if (hOP.call(descriptor, 'options')) {
                        // descriptor contains key options
                        result = self._encodeURI(descriptor.options)
                            .join(self.OPTION_SEPARATOR);
                    } else if (hOP.call(descriptor, 'key')) {
                        // descriptor contains single key
                        result = encodeURI(descriptor.key);
                    }

                    // adding value
                    if (hOP.call(descriptor, 'value')) {
                        result += self.KEY_VALUE_SEPARATOR + encodeURI(descriptor.value);
                    }
                }

                return result;
            }
        });
});

$oop.postpone($data, 'KeyValuePatternCollection', function () {
    "use strict";

    /**
     * Instantiates class
     * @name $data.KeyValuePatternCollection.create
     * @function
     * @returns {$data.KeyValuePatternCollection}
     */

    /**
     * @name $data.KeyValuePatternCollection#descriptor
     * @ignore
     */

    /**
     * @class $data.KeyValuePatternCollection
     * @extends $data.Collection
     * @extends $data.KeyValuePattern
     */
    $data.KeyValuePatternCollection = $data.Collection.of($data.KeyValuePattern);
});

(function () {
    "use strict";

    $assertion.addTypes(/** @lends $data */{
        isKeyValuePattern: function (expr) {
            return $data.KeyValuePattern.isBaseOf(expr);
        },

        isKeyValuePatternOptional: function (expr) {
            return typeof expr === 'undefined' ||
                $data.KeyValuePattern.isBaseOf(expr);
        }
    });

    $oop.extendBuiltIn(String.prototype, /** @lends String# */{
        /**
         * Creates a new KeyValuePattern instance based on the current string.
         * @returns {$data.KeyValuePattern}
         */
        toKeyValuePattern: function () {
            return /** @type {$data.KeyValuePattern} */ $data.KeyValuePattern.create(this);
        },

        /**
         * Shorthand to String.prototype.toKeyValuePattern().
         * Creates a new KeyValuePattern instance based on the current string.
         * @returns {$data.KeyValuePattern}
         */
        toKVP: function () {
            return /** @type {$data.KeyValuePattern} */ $data.KeyValuePattern.create(this);
        }
    });

    $oop.extendBuiltIn(Array.prototype, /** @lends Array# */{
        /**
         * Creates a new KeyValuePattern instance based on the current array.
         * @returns {$data.KeyValuePattern}
         */
        toKeyValuePattern: function () {
            return /** @type {$data.KeyValuePattern} */ $data.KeyValuePattern.create(this);
        },

        /**
         * Shorthand to Array.prototype.toKeyValuePattern().
         * Creates a new KeyValuePattern instance based on the current array.
         * @returns {$data.KeyValuePattern}
         */
        toKVP: function () {
            return /** @type {$data.KeyValuePattern} */ $data.KeyValuePattern.create(this);
        }
    });
}());

$oop.postpone($data, 'Query', function () {
    "use strict";

    var KeyValuePattern = $data.KeyValuePattern,
        base = $data.Path,
        self = base.extend();

    /**
     * Instantiates class.
     * Constructs query instance and populates it with query information. Keys in the query
     * (except for pattern objects) are assumed to be URI-encoded.
     * @name $data.Query.create
     * @function
     * @param {Array} query Query in array representation (eg. ['this', 'is', '|'.toKeyValuePattern(), 'path']).
     * All patterns should be converted to KeyValuePattern instance.
     * @returns {$data.Query}
     */

    /**
     * An expression that matches several paths.
     * Queries are backwards-compatible in the sense that a path instance may be treated as a query
     * that matches a single path.
     * A series of symbols may be used in specifying a query:
     * There are three symbols that match keys:
     * - '|' (pipe) matches all values on a key. Eg. 'hello>|>world' would match 'hello>dear>world'
     *  as well as 'hello>>world'.
     * - '<' separates optional key values. Eg. 'hello>world<all' would match 'hello>world' and 'hello>all'
     *  but not 'hello>people'.
     * - '\' skips all keys until next pattern in the query is matched. Eg. 'hello>\>world' would match
     * 'hello>people>of>the>world' as well as 'hello>world', but not 'hello>all'.
     * - '^value' is ignored.
     * On top of that, individual key-value patterns may be marked as return values by placing them inside curly braces.
     * @class $data.Query
     * @extends $data.Path
     */
    $data.Query = self
        .addConstants(/** @lends $data.Query */{
            /**
             * Regular expression that tests whether string contains query patterns.
             * Should include all special KeyValuePattern characters.
             * @type {RegExp}
             */
            RE_QUERY_TESTER: new RegExp([
                '\\' + $data.KeyValuePattern.OPTION_SEPARATOR,
                '\\' + $data.KeyValuePattern.KEY_VALUE_SEPARATOR,
                '\\' + $data.KeyValuePattern.WILDCARD_SYMBOL,
                '\\' + $data.KeyValuePattern.PRIMITIVE_SYMBOL,
                '\\' + $data.KeyValuePattern.SKIP_SYMBOL,
                '\\' + $data.KeyValuePattern.MARKER_BRACKET,
                '\\' + $data.KeyValuePattern.MARKER_CURLY
            ].join('|')),

            /**
             * Pattern indicating skip mode. In skip mode, keys are skipped
             * in the path between the previous key and the nearest key matched
             * by the next pattern in the query.
             * @type {$data.KeyValuePattern}
             */
            PATTERN_SKIP: KeyValuePattern.create(KeyValuePattern.SKIP_SYMBOL)
        })
        .addMethods(/** @lends $data.Query# */{
            /**
             * Prepares string query buffer for normalization.
             * @param {string} asString Array of strings
             * @returns {string[]|$data.KeyValuePattern[]}
             * @memberOf $data.Query
             */
            stringToQueryArray: function (asString) {
                var asArray = asString.split(self.PATH_SEPARATOR),
                    result = [],
                    i, pattern;

                for (i = 0; i < asArray.length; i++) {
                    pattern = asArray[i];
                    if (pattern.indexOf(KeyValuePattern.SKIP_SYMBOL) === 0) {
                        // special skipper case
                        result.push(self.PATTERN_SKIP);
                    } else if (self.RE_QUERY_TESTER.test(pattern)) {
                        // pattern is query expression (as in not key literal)
                        // creating pattern instance
                        result.push(KeyValuePattern.create(pattern));
                    } else {
                        // pattern is key literal
                        result.push(decodeURI(pattern));
                    }
                }

                return result;
            },

            /**
             * Normalizes query buffer. Leaves key literals as they are,
             * converts array pattern expressions to actual pattern objects.
             * Makes sure skipper patterns all reference the same instance.
             * @param {string[]|$data.KeyValuePattern[]} asArray
             * @returns {string[]|$data.KeyValuePattern[]}
             * @memberOf $data.Query
             */
            arrayToQueryArray: function (asArray) {
                var result = [],
                    i, pattern;

                for (i = 0; i < asArray.length; i++) {
                    pattern = asArray[i];
                    if (typeof pattern === 'string') {
                        // pattern is key literal
                        result.push(pattern);
                    } else if (pattern instanceof Array) {
                        // array is turned into pattern instance
                        result.push(KeyValuePattern.create(pattern));
                    } else if (KeyValuePattern.isBaseOf(pattern)) {
                        if (pattern.isSkipper()) {
                            // skipper patterns are substituted with constant
                            result.push(self.PATTERN_SKIP);
                        } else {
                            // other patterns are copied 1:1
                            result.push(pattern);
                        }
                    } else {
                        $assertion.assert(false, "Invalid key-value pattern", pattern);
                    }
                }

                return result;
            },

            /**
             * Extracts the longest path from the start of the query.
             * Stem may not contain any wildcards, or other query expressions, only key literals.
             * @example
             * $data.Query.create('hello>world>|>foo>\>bar').getStemPath(); // path 'hello>world'
             * @returns {$data.Path}
             */
            getStemPath: function () {
                var asArray = this.asArray,
                    result = [],
                    i, key;

                // stopping at first non-string key
                for (i = 0; i < asArray.length; i++) {
                    key = asArray[i];
                    if (typeof key === 'string') {
                        result.push(key);
                    } else {
                        break;
                    }
                }

                return $data.Path.create(result);
            },

            /**
             * Determines whether the specified path matches the current query.
             * @param {$data.Path} path Path to be tested against the current query.
             * @returns {boolean}
             */
            matchesPath: function (path) {
                var queryAsArray = this.asArray,
                    pathAsArray = path.asArray,
                    i = 0, currentKey,
                    j = 0, currentPattern,
                    inSkipMode = false;

                // loop goes on until path is fully processed
                // or a hard key mismatch is encountered
                while (i < pathAsArray.length) {
                    currentKey = pathAsArray[i];
                    currentPattern = queryAsArray[j];

                    if (currentPattern === self.PATTERN_SKIP) {
                        // current pattern indicates skip mode 'on'
                        inSkipMode = true;
                        j++;
                    } else {
                        if (KeyValuePattern.isBaseOf(currentPattern) && currentPattern.matchesKey(currentKey) ||
                            currentPattern === currentKey
                            ) {
                            // current key matches current pattern
                            // turning skip mode off
                            inSkipMode = false;
                            j++;
                        } else if (!inSkipMode) {
                            // current key does not match current pattern and not in skip mode
                            // hard key mismatch -> matching failed
                            return false;
                        }

                        // proceeding to next key in path
                        i++;
                    }
                }

                if (j < queryAsArray.length) {
                    // if path reached its end but the query hasn't
                    // seeing if remaining key-value patterns are just skippers
                    while (queryAsArray[j] === self.PATTERN_SKIP) {
                        // skippers at end are allowed
                        j++;
                    }
                }

                // matching was successful when query was fully processed
                // and path was either fully processed or last pattern was continuation
                return j === queryAsArray.length &&
                    (i === pathAsArray.length || currentPattern === self.PATTERN_SKIP);
            },

            /**
             * Determines whether paths matched by current query may be roots of the specified path.
             * @param {$data.Path} relativePath
             * @returns {boolean}
             * @example
             * 'foo>|>bar'.toQuery().isRootOf('foo>baz>bar>hello'.toPath()) // true
             */
            isRootOf: function (relativePath) {
                return this.clone()
                    .appendKey(self.PATTERN_SKIP)
                    .matchesPath(relativePath);
            },

            /**
             * Returns the string representation for the query, keys URI encoded and separated by '>',
             * patterns converted back to their symbol form ('|', '\', '<', and '^').
             * @example
             * $data.Query.create(['test^', '|'.toKeyValuePattern(), 'path']).toString() // "test%5E>|>path"
             * @returns {string}
             */
            toString: function () {
                var asArray = this.asArray,
                    result = [],
                    i;

                for (i = 0; i < asArray.length; i++) {
                    result.push(asArray[i].toString());
                }

                return result.join(self.PATH_SEPARATOR);
            }
        });
});

(function () {
    "use strict";

    var validators = $assertion.validators;

    $assertion.addTypes(/** @lends $data */{
        isQuery: function (expr) {
            return $data.Query.isBaseOf(expr);
        },

        isQueryOptional: function (expr) {
            return typeof expr === 'undefined' ||
                $data.Query.isBaseOf(expr);
        },

        /**
         * Determines whether specified string or array path qualifies as query.
         * @path {string|string[]} Path in string or array representation
         */
        isQueryExpression: function (expr) {
            var i;
            if (expr instanceof Array) {
                for (i = 0; i < expr.length; i++) {
                    // any object in the path qualifies for query
                    if (expr[i] instanceof Object) {
                        return true;
                    }
                }
            } else if (this.isString(expr)) {
                return $data.Query.RE_QUERY_TESTER.test(expr);
            }
            return false;
        }
    });

    $oop.extendBuiltIn(String.prototype, /** @lends String# */{
        /**
         * Creates a new Query instance based on the current string.
         * Keys are URI decoded or translated to the corresponding pattern object before being added to the internal buffer.
         * @returns {$data.Query}
         */
        toQuery: function () {
            var Query = $data.Query;
            return /** @type {$data.Query} */ Query.create(Query.stringToQueryArray(this));
        },

        /**
         * Creates a new Path or Query instance based on the current string, depending on the
         * actual string contents.
         * @returns {$data.Path}
         */
        toPathOrQuery: function () {
            var Query = $data.Query;
            return /** @type {$data.Path} */ validators.isQueryExpression(this) ?
                this.toQuery() :
                this.toPath();
        }
    });

    $oop.extendBuiltIn(Array.prototype, /** @lends Array# */{
        /**
         * Creates a new Query instance based on the current array.
         * @returns {$data.Query}
         */
        toQuery: function () {
            var Query = $data.Query;
            return /** @type {$data.Query} */ Query.create(Query.arrayToQueryArray(this));
        },

        /**
         * Creates a new Path or Query instance based on the current array, depending on the
         * actual contents of the array.
         * @returns {$data.Path}
         */
        toPathOrQuery: function () {
            return /** @type {$data.Path} */ validators.isQueryExpression(this) ?
                this.toQuery() :
                this.toPath();
        }
    });
}());

$oop.postpone($data, 'TreeWalker', function () {
    "use strict";

    /**
     * Base class for tree walker classes.
     * Holds basic properties and state of the tree walker.
     * @class $data.TreeWalker
     * @extends $oop.Base
     */
    $data.TreeWalker = $oop.Base.extend()
        .addMethods(/** @lends $data.TreeWalker# */{
            /**
             * @param {function} handler
             * @ignore
             */
            init: function (handler) {
                $assertion.isFunction(handler, "Invalid walker handler");

                /**
                 * Handler to be called on each relevant node. Receives TreeWalker instance as context
                 * and current node as argument. Returning false interrupts traversal.
                 * @type {Function}
                 * @param {object} currentNode Node currently being traversed.
                 */
                this.handler = handler;

                /**
                 * Key currently being traversed
                 * @type {string}
                 */
                this.currentKey = undefined;

                /**
                 * Node currently being traversed
                 * @type {*}
                 */
                this.currentNode = undefined;

                /**
                 * Path currently being traversed
                 * @type {$data.Path}
                 */
                this.currentPath = undefined;

                /**
                 * Tells whether traversal is terminated.
                 * @type {boolean}
                 */
                this.isTerminated = false;
            },

            /**
             * Sets termination flag.
             * @returns {$data.TreeWalker}
             */
            terminateTraversal: function () {
                this.isTerminated = true;
                return this;
            },

            /**
             * Resets walker state
             * @returns {$data.TreeWalker}
             */
            reset: function () {
                this.currentKey = undefined;
                this.currentNode = undefined;
                this.currentPath = undefined;
                this.isTerminated = false;
                return this;
            }
        });
});

$oop.postpone($data, 'IterativeTreeWalker', function () {
    "use strict";

    /**
     * Instantiates class
     * @name $data.IterativeTreeWalker.create
     * @function
     * @param {function} handler
     * @returns {$data.IterativeTreeWalker}
     */

    /**
     * Traverses tree iteratively, touching all nodes within.
     * @class $data.IterativeTreeWalker
     * @extends $data.TreeWalker
     */
    $data.IterativeTreeWalker = $data.TreeWalker.extend()
        .addMethods(/** @lends $data.IterativeTreeWalker# */{
            /**
             * Traverses all enumerable nodes in object.
             * Iterative implementation.
             * @param node {object} Object to be traversed.
             * @returns {$data.IterativeTreeWalker}
             */
            walk: function (node) {
                // reference to path
                this.currentPath = $data.Path.create([]);

                var keysStack = [Object.keys(node)], // stack of keys associated with each node on current path
                    indexStack = [0], // stack of key indexes on current path
                    nodeStack = [node], // stack of nodes on current path

                    currentPath = this.currentPath.asArray, // key stack, ie. traversal path, calculated

                    currentDepth, // current traversal depth
                    currentParent, // the node we're currently IN (current parent node)
                    currentKeys, // keys in the current parent node
                    currentIndex, // index of key in current parent node
                    currentKey, // key of node we're AT
                    currentNode; // node we're currently AT

                for (; ;) {
                    // determining where we are
                    currentDepth = keysStack.length - 1;
                    currentIndex = indexStack[currentDepth];

                    // testing if current node finished traversal
                    if (currentIndex >= keysStack[currentDepth].length) {
                        // going back a level
                        keysStack.pop();

                        if (!keysStack.length) {
                            // object is fully traversed, exiting
                            break;
                        }

                        nodeStack.pop();
                        indexStack.pop();
                        currentPath.pop();

                        // raising index on parent node
                        indexStack.push(indexStack.pop() + 1);

                        continue;
                    }

                    // obtaining current state as local variables
                    currentKeys = keysStack[currentDepth];
                    this.currentKey = currentKey = currentKeys[currentIndex];
                    currentParent = nodeStack[currentDepth];
                    this.currentNode = currentNode = currentParent[currentKey];
                    currentPath[currentDepth] = currentKey;

                    // calling handler for this node
                    // traversal may be terminated by handler by returning false
                    if (this.handler.call(this, currentNode) === false) {
                        break;
                    }

                    // next step in traversal
                    if (currentNode instanceof Object) {
                        // burrowing deeper - found a node
                        nodeStack.push(currentNode);
                        indexStack.push(0);
                        keysStack.push(Object.keys(currentNode));
                    } else {
                        // moving to next node in parent
                        indexStack[currentDepth]++;
                    }
                }

                // re-setting traversal state
                this.reset();

                return this;
            }
        });
});

$oop.postpone($data, 'RecursiveTreeWalker', function () {
    "use strict";

    var base = $data.TreeWalker,
        self = base.extend(),
        hOP = Object.prototype.hasOwnProperty;

    /**
     * Instantiates class
     * @name $data.RecursiveTreeWalker.create
     * @function
     * @param {function} handler
     * @param {$data.Query} [query]
     * @returns {$data.RecursiveTreeWalker}
     */

    /**
     * Traverses tree recursively, according to a query expression.
     * @class $data.RecursiveTreeWalker
     * @extends $data.TreeWalker
     */
    $data.RecursiveTreeWalker = self
        .addConstants(/** @lends $data.RecursiveTreeWalker */{
            /**
             * Key-value pair marker character for marking return value.
             * Queries will collect leaf nodes unless there's a kvp in the query is marked like this.
             * @example
             * '\\>{world}>\\>|^foo'.toQuery() // query would retrieve "world" nodes w/ "foo" leaf nodes under it
             */
            RETURN_MARKER: '{'
        })
        .addPrivateMethods(/** @lends $data.RecursiveTreeWalker */{
            /**
             * Gathers all indices of specified value from specified array.
             * @param {Array} array
             * @param {*} value
             * @returns {object}
             * @private
             */
            _allIndicesOf: function (array, value) {
                var result = {},
                    nextIndex = -1;
                while ((nextIndex = array.indexOf(value, nextIndex + 1)) > -1) {
                    result[nextIndex] = true;
                }
                return result;
            },

            /**
             * Gathers all keys associated with specified value from specified object
             * @param {object} object
             * @param {*} value
             * @returns {object}
             * @private
             */
            _getKeysByValue: function (object, value) {
                var result = {},
                    keys = Object.keys(object),
                    i, key;
                for (i = 0; i < keys.length; i++) {
                    key = keys[i];
                    if (object[key] === value) {
                        result[key] = true;
                    }
                }
                return result;
            },

            /**
             * Retrieves keys that are associated with traversable values (objects).
             * @param {object} object
             * @returns {object}
             * @private
             */
            _getKeysForObjectProperties: function (object) {
                var result = {},
                    keys = Object.keys(object),
                    i, key;
                for (i = 0; i < keys.length; i++) {
                    key = keys[i];
                    if (object[key] instanceof Object) {
                        result[key] = true;
                    }
                }
                return result;
            },

            /**
             * Retrieves keys for properties with primitive values.
             * @param {object} object
             * @returns {object}
             * @private
             */
            _getKeysForPrimitiveValues: function (object) {
                var result = {},
                    keys = Object.keys(object),
                    i, key;
                for (i = 0; i < keys.length; i++) {
                    key = keys[i];
                    if (typeof object[key] !== 'object') {
                        result[key] = true;
                    }
                }
                return result;
            },

            /**
             * Retrieves an array of keys from the node passed
             * according to the given pattern.
             * @param {object} node Node for which to obtain the keys.
             * @param {string|$data.KeyValuePattern} pattern
             * @returns {object} Lookup of suitable keys
             * @private
             */
            _getKeysByPattern: function (node, pattern) {
                var descriptor = pattern.descriptor,
                    result = {},
                    i, key;

                if (typeof pattern === 'string') {
                    // pattern is key literal
                    if (hOP.call(node, pattern)) {
                        // key is present in node
                        result[pattern] = true;
                    }
                } else if (descriptor instanceof Object) {
                    if (typeof descriptor.key === 'string') {
                        // descriptor has a single key specified
                        key = descriptor.key;
                        if (hOP.call(descriptor, 'value')) {
                            // descriptor has both key and value specified
                            if (descriptor.value === node[key]) {
                                result[key] = true;
                            }
                        } else {
                            // descriptor has only key specified
                            result[key] = true;
                        }
                    } else if (descriptor.options instanceof Array) {
                        // obtaining enumerated keys that are actually present in node
                        if (hOP.call(descriptor, 'value')) {
                            // value also expected to be matched
                            for (i = 0; i < descriptor.options.length; i++) {
                                key = descriptor.options[i];
                                if (node[key] === descriptor.value) {
                                    // key present in node with specified value assigned
                                    result[key] = true;
                                }
                            }
                        } else {
                            // only key is expected to be matched
                            for (i = 0; i < descriptor.options.length; i++) {
                                key = descriptor.options[i];
                                if (hOP.call(node, key)) {
                                    // key present in node
                                    result[key] = true;
                                }
                            }
                        }
                    } else if (descriptor.symbol === $data.KeyValuePattern.WILDCARD_SYMBOL) {
                        if (hOP.call(descriptor, 'value')) {
                            // there's a value specified within pattern
                            if (node instanceof Array) {
                                // obtaining all matching indices from array
                                result = this._allIndicesOf(node, descriptor.value);
                            } else if (node instanceof Object) {
                                // obtaining all matching keys from object
                                result = this._getKeysByValue(node, descriptor.value);
                            }
                        } else {
                            // wildcard pattern
                            result = node;
                        }
                    } else if (descriptor.symbol === $data.KeyValuePattern.PRIMITIVE_SYMBOL) {
                        // obtaining all matching keys from object
                        result = this._getKeysForPrimitiveValues(node, descriptor.value);
                    }
                }

                return result;
            },

            /**
             * Calls handler after creating snapshot of traversal state.
             * @param {string[]} currentPath
             * @param {*} currentNode
             * @private
             */
            _callHandler: function (currentPath, currentNode) {
                // creating snapshot of state
                this.currentKey = currentPath[currentPath.length - 1];
                this.currentNode = currentNode;
                this.currentPath = currentPath.toPath();

                if (this.handler.call(this, currentNode) === false) {
                    this.terminateTraversal();
                }
            },

            /**
             * Traverses a set of keys under the specified parent node.
             * @param {string[]} parentPath
             * @param {*} parentNode
             * @param {$data.Set} keySet
             * @param {number} queryPos Position of the current KPV in the query.
             * @param {boolean} isInSkipMode
             * @param {boolean} hasMarkedParent
             * @returns {boolean} Whether there was a hit under the current parentNode
             * @private
             */
            _traverseKeys: function (parentPath, parentNode, keySet, queryPos, isInSkipMode, hasMarkedParent) {
                var currentKeys = keySet.getKeys(),
                    result = false,
                    i, currentKey, currentNode;

                for (i = 0; i < currentKeys.length; i++) {
                    if (this.isTerminated) {
                        break;
                    }

                    currentKey = currentKeys[i];
                    currentNode = parentNode[currentKey];
                    result = this._walk(
                        parentPath.concat(currentKey),
                        currentNode,
                        queryPos,
                        isInSkipMode,
                        hasMarkedParent
                    ) || result;
                }

                return result;
            },

            /**
             * Traverses specified node recursively, according to the query assigned to the walker.
             * @param {string[]} currentPath
             * @param {*} currentNode
             * @param {number} queryPos Position of the current KPV in the query.
             * @param {boolean} isInSkipMode
             * @param {boolean} isUnderMarkedNode
             * @returns {boolean} Indicates whether there were any matching nodes under the current node.
             * @memberOf $data.RecursiveTreeWalker#
             * @private
             */
            _walk: function (currentPath, currentNode, queryPos, isInSkipMode, isUnderMarkedNode) {
                var queryAsArray = this.query.asArray,
                    currentKvp = queryAsArray[queryPos],
                    result = false;

                if (currentKvp === $data.Query.PATTERN_SKIP) {
                    // current pattern is skipper
                    // setting skip mode on, and moving on to next KVP in query
                    isInSkipMode = true;
                    queryPos++;
                    currentKvp = queryAsArray[queryPos];
                }

                if (queryPos >= queryAsArray.length) {
                    // query is done;
                    // by the time we get here, all preceding query patterns have been matched

                    if (!isUnderMarkedNode) {
                        // not under marked node, so current match can be registered
                        this._callHandler(currentPath, currentNode);
                    }

                    // indicating match
                    return true;
                }

                var matchingKeySet = $data.Set.create(this._getKeysByPattern(currentNode, currentKvp)),
                    parentKvp = queryAsArray[queryPos - 1],
                    hasMarkedParent = $data.KeyValuePattern.isBaseOf(parentKvp) &&
                                      parentKvp.getMarker() === self.RETURN_MARKER;

                if (matchingKeySet.getKeyCount()) {
                    // there is at leas one matching key in the current node

                    // traversing matching properties
                    result = this._traverseKeys(
                        currentPath,
                        currentNode,
                        matchingKeySet,
                        queryPos + 1,   // goes on to next KVP
                        false,          // matching key resets skip mode
                        hasMarkedParent || isUnderMarkedNode
                    ) || result;
                }

                var objectKeySet,
                    traversableKeySet;

                if (isInSkipMode) {
                    // we're in skip mode so rest of the keys under the current node must be traversed

                    // obtaining keys for properties that can be traversed
                    objectKeySet = $data.Set.create(this._getKeysForObjectProperties(currentNode));
                    traversableKeySet = matchingKeySet.subtractFrom(objectKeySet);

                    if (traversableKeySet.getKeyCount()) {
                        result = this._traverseKeys(
                            currentPath,
                            currentNode,
                            traversableKeySet,
                            queryPos,   // continues to look for current KVP
                            true,       // keeps skip mode switched on
                            hasMarkedParent || isUnderMarkedNode
                        ) || result;
                    }
                }

                if (hasMarkedParent && result) {
                    // there was a hit under the current node,
                    // and immediate parent is marked for return
                    this._callHandler(currentPath, currentNode);
                }

                return result;
            }
        })
        .addMethods(/** @lends $data.RecursiveTreeWalker# */{
            /**
             * @param {function} handler
             * @param {$data.Query} [query]
             * @ignore
             */
            init: function (handler, query) {
                $assertion.isQueryOptional(query, "Invalid query");

                base.init.call(this, handler);

                /**
                 * Query guiding the traversal.
                 * @type {$data.Query}
                 */
                this.query = query || '\\>"'.toQuery();
            },

            /**
             * Walks the specified node according to query
             * @param {*} node
             * @returns {$data.RecursiveTreeWalker}
             */
            walk: function (node) {
                // initializing traversal path state
                this.currentPath = $data.Path.create([]);

                // walking node
                this._walk([], node, 0, false, false);

                // traversal finished, resetting traversal state
                this.reset();

                return this;
            }
        });
});

$oop.postpone($data, 'Tree', function () {
    "use strict";

    var hop = Object.prototype.hasOwnProperty,
        Hash = $data.Hash;

    /**
     * Instantiates class
     * @name $data.Tree.create
     * @function
     * @param {object} [items]
     * @returns {$data.Tree}
     */

    /**
     * Accesses, traverses, and modifies tree-like object structures.
     * @class $data.Tree
     * @extends $data.Hash
     */
    $data.Tree = Hash.extend()
        .addMethods(/** @lends $data.Tree# */{
            /**
             * Retrieves the value at the specified path.
             * @param {$data.Path} path Path to node
             * @returns {*} Whatever value is found at path
             */
            getNode: function (path) {
                var asArray = path.asArray,
                    result = this.items,
                    i;

                for (i = 0; i < asArray.length; i++) {
                    result = result[asArray[i]];
                    if (typeof result === 'undefined') {
                        break;
                    }
                }

                return result;
            },

            /**
             * Retrieves object at the specified path wrapped in a Hash object.
             * @param {$data.Path} path Path to node
             * @returns {$data.Hash}
             */
            getNodeAsHash: function (path) {
                return Hash.create(this.getNode(path));
            },

            /**
             * Retrieves the value at the specified path, or
             * when the path does not exist, creates path and
             * assigns an empty object.
             * @param {$data.Path} path
             * @param {function} [handler] Callback receiving the path and value affected by change.
             * @returns {object}
             */
            getSafeNode: function (path, handler) {
                var asArray = path.asArray,
                    hasChanged = false,
                    result = this.items,
                    i, key;

                for (i = 0; i < asArray.length; i++) {
                    key = asArray[i];
                    if (typeof result[key] !== 'object') {
                        hasChanged = true;
                        result[key] = {};
                    }
                    result = result[key];
                }

                if (hasChanged && handler) {
                    handler(path, result);
                }

                return result;
            },

            /**
             * Retrieves safe value at path, wrapped in a hash.
             * @param {$data.Path} path
             * @param {function} [handler] Callback receiving the path and value affected by change.
             * @returns {$data.Hash}
             */
            getSafeNodeAsHash: function (path, handler) {
                return Hash.create(this.getSafeNode(path, handler));
            },

            /**
             * Sets the node at the specified path to the given value.
             * @param {$data.Path} path Path to node
             * @param {*} value Node value to set
             * @param {function} [handler] Called on change
             * @returns {$data.Tree}
             */
            setNode: function (path, value, handler) {
                var parentPath = path.clone().trimRight(),
                    parentNode = this.getSafeNode(parentPath),
                    propertyName = path.getLastKey(),
                    hadPropertyBefore = hop.call(parentNode, propertyName);

                if (parentNode[propertyName] !== value) {
                    parentNode[propertyName] = value;

                    if (handler) {
                        if (hadPropertyBefore) {
                            // changing existing property on parent
                            handler(path, value);
                        } else {
                            // adding new property to parent
                            handler(parentPath, parentNode);
                        }
                    }
                }

                return this;
            },

            /**
             * Appends the node with the specified value.
             * In case of conflict the new value wins.
             * @param {$data.Path} path Path to node
             * @param {Object|Array} value Value to append to node
             * @param {function} [handler] Called on change
             * @returns {$data.Tree}
             */
            appendNode: function (path, value, handler) {
                var node = this.getNode(path),
                    keys, keyCount,
                    start, i, key,
                    changed = false;

                if (node instanceof Object) {
                    if (node instanceof Array) {
                        if (value instanceof Array) {
                            if (value.length > 0) {
                                // appending non-empty array to array
                                start = node.length;
                                keyCount = value.length;
                                node.length = start + keyCount;
                                for (i = 0; i < keyCount; i++) {
                                    node[start + i] = value[i];
                                }
                                changed = true;
                            }
                        } else {
                            // appending non-array to array
                            node.push(value);
                            changed = true;
                        }
                    } else {
                        // appending object to object
                        keys = Object.keys(value);
                        keyCount = keys.length;
                        for (i = 0; i < keyCount; i++) {
                            key = keys[i];
                            if (!changed && node[key] !== value[key]) {
                                changed = true;
                            }
                            node[key] = value[key];
                        }
                    }

                    if (changed && handler) {
                        handler(path, node);
                    }
                } else if (value !== node) {
                    // node is either undefined or primitive
                    // replacing node
                    this.setNode(path, value, handler);
                }

                return this;
            },

            /**
             * Retrieves the value at the specified path, or
             * when the path does not exist, creates path and
             * assigns the return value of the generator.
             * @param {$data.Path} path Path to node
             * @param {function} generator Generator function returning value to be set.
             * @param {function} [handler] Callback receiving the path and value affected by change.
             * @returns {*}
             */
            getOrSetNode: function (path, generator, handler) {
                var parentPath = path.clone().trimRight(),
                    targetKey = path.getLastKey(),
                    targetParent = this.getSafeNode(parentPath),
                    result;

                if (targetParent.hasOwnProperty(targetKey)) {
                    result = targetParent[targetKey];
                } else {
                    result = targetParent[targetKey] = generator();
                    if (handler) {
                        handler(path, result);
                    }
                }

                return result;
            },

            /**
             * Removes node from the specified path, ie.
             * the node will be overwritten with an undefined value.
             * @param {$data.Path} path
             * @returns {$data.Tree}
             */
            unsetNode: function (path) {
                if (!path.asArray.length) {
                    // empty path equivalent to clear
                    this.clear();
                    return this;
                }

                var targetParent = this.getNode(path.clone().trimRight());

                if (targetParent instanceof Object) {
                    // concerns existing parent nodes only
                    targetParent[path.getLastKey()] = undefined;
                }

                return this;
            },

            /**
             * Removes key from the specified path.
             * @param {$data.Path} path Path to node
             * @param {boolean} [splice=false] Whether to use splice when removing key from array.
             * @param {function} [handler] Callback receiving the path affected by change.
             * @returns {$data.Tree}
             */
            unsetKey: function (path, splice, handler) {
                if (!path.asArray.length) {
                    // empty path equivalent to clear
                    this.clear(handler && function (items) {
                        handler(path, items);
                    });
                    return this;
                }

                var parentPath = path.clone().trimRight(),
                    propertyName = path.getLastKey(),
                    targetParent = this.getNode(parentPath),
                    changed = false;

                if (targetParent instanceof Object) {
                    // concerns existing parent nodes only
                    if (splice && targetParent instanceof Array) {
                        // removing marked node by splicing it out of array
                        targetParent.splice(path.getLastKey(), 1);
                        changed = true;
                    } else {
                        // deleting marked node
                        if (hop.call(targetParent, propertyName)) {
                            delete targetParent[propertyName];
                            changed = true;
                        }
                    }

                    if (changed && handler) {
                        handler(parentPath, targetParent);
                    }
                }

                return this;
            },

            /**
             * Removes nodes from tree that have no children
             * other than the one specified by the path.
             * @param {$data.Path} path Datastore path
             * @param {boolean} [splice=false] Whether to use splice when removing key from array.
             * @param {function} [handler] Callback receiving the path affected by change.
             * @returns {$data.Tree}
             */
            unsetPath: function (path, splice, handler) {
                if (!path.asArray.length) {
                    this.clear(handler && function (items) {
                        handler(path, items);
                    });
                    return this;
                }

                var asArray = path.asArray,
                    parentNode = null, // parent node of current node
                    parentNodeSingle, // whether parent node has one child
                    currentKey = null, // key associated with current node in parent node
                    currentNode = this.items, // node currently processed
                    currentNodeSingle, // whether current node has one child
                    i, nextKey, // next key to be processed within current node

                    targetLevel, // position of target key in path
                    targetParent, // parent node in which to delete
                    targetKey; // key in parent node to be deleted

                // determining deletion target
                for (i = 0; i < asArray.length; i++) {
                    nextKey = asArray[i];

                    if (typeof currentNode === 'undefined') {
                        // current node is undefined
                        // breaking target search
                        break;
                    }

                    currentNodeSingle = $data.DataUtils.isSingularObject(currentNode);
                    if (currentNodeSingle && parentNode !== null) {
                        // current node has exactly one child
                        // and is not root node
                        if (!parentNodeSingle) {
                            // ...but parent had more
                            // marking current node for deletion
                            targetLevel = i;
                            targetKey = currentKey;
                            targetParent = parentNode;
                        }
                    } else {
                        // current node has more than one child
                        // marking next node for deletion
                        targetLevel = i + 1;
                        targetKey = nextKey;
                        targetParent = currentNode;
                    }

                    // changing state for next iteration
                    currentKey = nextKey;
                    parentNode = currentNode;
                    currentNode = parentNode[nextKey];
                    parentNodeSingle = currentNodeSingle;
                }

                if (splice && targetParent instanceof Array) {
                    // removing marked node by splicing it out of array
                    // and setting target to parent (indicates update un that level)
                    targetParent.splice(targetKey, 1);
                    targetLevel--;
                    currentNode = targetParent;
                } else {
                    // deleting marked node and setting target to undefined (indicates removal)
                    delete targetParent[targetKey];
                    currentNode = undefined;
                }

                if (handler) {
                    // calling handler with affected path
                    handler(asArray.slice(0, targetLevel).toPath(), currentNode);
                }

                return this;
            },

            /**
             * Moves node from one path to another.
             * @param {$data.Path} fromPath
             * @param {$data.Path} toPath
             * @param {function} [handler]
             * @returns {$data.Tree}
             */
            moveNode: function (fromPath, toPath, handler) {
                var node = this.getNode(fromPath);

                this
                    .unsetNode(fromPath)
                    .setNode(toPath, node, handler);

                return this;
            },

            /**
             * Traverses tree recursively, guided by the specified query array
             * @param {$data.Query} query
             * @param {function} handler
             * @returns {$data.Tree}
             */
            traverseByQuery: function (query, handler) {
                // recursive tree walker may be guided by query expression
                $data.RecursiveTreeWalker.create(handler, query)
                    .walk(this.items);

                return this;
            },

            /**
             * Traverses tree iteratively, calling handler on every node
             * unless interrupted by returning false from handler.
             * @param {function} handler
             * @returns {$data.Tree}
             */
            traverseAllNodes: function (handler) {
                // iterative walker operates unguided,
                // touching all nodes along traversal
                $data.IterativeTreeWalker.create(handler)
                    .walk(this.items);

                return this;
            },

            /**
             * Queries node values from tree
             * @param {$data.Query} query
             * @returns {Array}
             */
            queryValues: function (query) {
                var result = [];

                function handler(node) {
                    result.push(node);
                }

                // creating tree walker and walking tree buffer
                $data.RecursiveTreeWalker.create(handler, query)
                    .walk(this.items);

                return result;
            },

            /**
             * Queries node values from tree wrapped in a hash
             * @param {$data.Query} query
             * @returns {$data.Hash}
             */
            queryValuesAsHash: function (query) {
                return Hash.create(this.queryValues(query));
            },

            /**
             * Queries node keys from tree
             * @param {$data.Query} query
             * @returns {Array}
             */
            queryKeys: function (query) {
                /*jshint validthis:true */
                var result = [];

                function handler() {
                    result.push(this.currentKey);
                }

                // creating tree walker and walking tree buffer
                $data.RecursiveTreeWalker.create(handler, query)
                    .walk(this.items);

                return result;
            },

            /**
             * Queries node keys from tree wrapped in a hash
             * @param {$data.Query} query
             * @returns {$data.Hash}
             */
            queryKeysAsHash: function (query) {
                return Hash.create(this.queryKeys(query));
            },

            /**
             * Queries paths from tree
             * @param {$data.Query} query
             * @returns {Array}
             */
            queryPaths: function (query) {
                /*jshint validthis:true */
                var result = [];

                function handler() {
                    result.push(this.currentPath.clone());
                }

                // creating tree walker and walking tree buffer
                $data.RecursiveTreeWalker.create(handler, query)
                    .walk(this.items);

                return result;
            },

            /**
             * Queries paths from tree wrapped in a hash
             * @param {$data.Query} query
             * @returns {$data.Hash}
             */
            queryPathsAsHash: function (query) {
                return Hash.create(this.queryPaths(query));
            },

            /**
             * Queries key-value associations from tree as an object
             * @param {$data.Query} query
             * @returns {object}
             */
            queryKeyValuePairs: function (query) {
                /*jshint validthis:true */
                var result = {};

                function handler(node) {
                    result[this.currentKey] = node;
                }

                // creating tree walker and walking tree buffer
                $data.RecursiveTreeWalker.create(handler, query)
                    .walk(this.items);

                return result;
            },

            /**
             * Queries key-value associations from tree as an object wrapped in a hash
             * @param {$data.Query} query
             * @returns {$data.Hash}
             */
            queryKeyValuePairsAsHash: function (query) {
                return Hash.create(this.queryKeyValuePairs(query));
            },

            /**
             * Queries pat-value associations from tree as object
             * @param {$data.Query} query
             * @returns {object}
             */
            queryPathValuePairs: function (query) {
                /*jshint validthis:true */
                var result = {};

                function handler(node) {
                    result[this.currentPath.toString()] = node;
                }

                // creating tree walker and walking tree buffer
                $data.RecursiveTreeWalker.create(handler, query)
                    .walk(this.items);

                return result;
            },

            /**
             * Queries pat-value associations from tree as object wrapped in a hash
             * @param {$data.Query} query
             * @returns {$data.Hash}
             */
            queryPathValuePairsAsHash: function (query) {
                return Hash.create(this.queryPathValuePairs(query));
            }
        });
});

$oop.amendPostponed($data, 'Hash', function () {
    "use strict";

    $data.Hash.addMethods(/** @lends $data.Hash# */{
        /**
         * Reinterprets hash as a tree.
         * @returns {$data.Tree}
         */
        toTree: function () {
            return $data.Tree.create(this.items);
        }
    });
});

(function () {
    "use strict";

    $assertion.addTypes(/** @lends $data */{
        isTree: function (expr) {
            return $data.Tree.isBaseOf(expr);
        },

        isTreeOptional: function (expr) {
            return typeof expr === 'undefined' ||
                $data.Tree.isBaseOf(expr);
        }
    });

    $oop.extendBuiltIn(Array.prototype, /** @lends Array# */{
        /**
         * Creates a new Tree instance based on the current array.
         * @returns {$data.Tree}
         */
        toTree: function () {
            return $data.Tree.create(this);
        }
    });
}());

$oop.postpone($data, 'ArrayCollection', function () {
    "use strict";

    /**
     * @name $data.ArrayCollection.create
     * @function
     * @param {object} [items] Initial contents.
     * @returns {$data.ArrayCollection}
     */

    /**
     * General collection for managing multiple arrays.
     * @class $data.ArrayCollection
     * @extends $data.Collection
     * @extends Array
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
     */
    $data.ArrayCollection = $data.Collection.of(Array);
});

$oop.amendPostponed($data, 'Hash', function () {
    "use strict";

    $data.Hash.addMethods(/** @lends $data.Hash# */{
        /**
         * Reinterprets hash as array collection.
         * @returns {$data.ArrayCollection}
         */
        toArrayCollection: function () {
            return $data.ArrayCollection.create(this.items);
        }
    });
});

(function () {
    "use strict";

    $oop.extendBuiltIn(Array.prototype, /** @lends Array# */{
        /**
         * Creates a new ArrayCollection instance based on the current array.
         * @returns {$data.ArrayCollection}
         */
        toArrayCollection: function () {
            return $data.ArrayCollection.create(this);
        }
    });
}());

$oop.postpone($data, 'DateCollection', function () {
    "use strict";

    /**
     * @name $data.DateCollection.create
     * @function
     * @param {object} [items] Initial contents.
     * @returns {$data.DateCollection}
     */

    /**
     * General collection for managing multiple date objects.
     * @class $data.DateCollection
     * @extends $data.Collection
     * @extends Date
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
     */
    $data.DateCollection = $data.Collection.of(Date);
});

$oop.amendPostponed($data, 'Hash', function () {
    "use strict";

    $data.Hash.addMethods(/** @lends $data.Hash# */{
        /**
         * Reinterprets hash as date collection.
         * @returns {$data.DateCollection}
         */
        toDateCollection: function () {
            return $data.DateCollection.create(this.items);
        }
    });
});

(function () {
    "use strict";

    $oop.extendBuiltIn(Array.prototype, /** @lends Array# */{
        /**
         * Creates a new DateCollection instance based on the current array.
         * @returns {$data.DateCollection}
         */
        toDateCollection: function () {
            return $data.DateCollection.create(this);
        }
    });
}());

$oop.postpone($data, 'StringCollection', function () {
    "use strict";

    /**
     * @name $data.StringCollection.create
     * @function
     * @param {object} [items] Initial contents.
     * @returns {$data.StringCollection}
     */

    /**
     * General collection for managing multiple strings.
     * @class $data.StringCollection
     * @extends $data.Collection
     * @extends String
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String
     */
    $data.StringCollection = $data.Collection.of(String);
});

$oop.amendPostponed($data, 'Hash', function () {
    "use strict";

    $data.Hash.addMethods(/** @lends $data.Hash# */{
        /**
         * Reinterprets hash as string collection.
         * @returns {$data.StringCollection}
         */
        toStringCollection: function () {
            return $data.StringCollection.create(this.items);
        }
    });
});

(function () {
    "use strict";

    $oop.extendBuiltIn(Array.prototype, /** @lends Array# */{
        /**
         * Creates a new StringCollection instance based on the current array.
         * @returns {$data.StringCollection}
         */
        toStringCollection: function () {
            return $data.StringCollection.create(this);
        }
    });
}());

/*jshint node:true */
if (typeof module === 'object') {
    module.exports = $data;
}

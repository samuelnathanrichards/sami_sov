/*jshint node:true */

/** @namespace */
var $oop = {};

/** @namespace */
var $assertion = $assertion || require('giant-assertion');

(function () {
    "use strict";

    /**
     * Implements methods to detect environment features relevant to OOP and testing.
     * @class
     */
    $oop.Feature = {
        /**
         * Determines whether read-only properties may be covered up by assignment.
         * @returns {boolean}
         */
        canAssignToReadOnly: function () {
            var base, child;

            // creating base object with read-only property
            base = Object.defineProperty({}, 'p', {
                writable: false,
                value   : false
            });

            // deriving object
            child = Object.create(base);

            // attempting to change read-only property on base
            try {
                child.p = true;
            } catch (e) {
                // change failed, property is RO
                return false;
            }

            // determining whether change was successful
            return child.p === true;
        },

        /**
         * Determines whether ES5 property attributes are available.
         * @returns {boolean}
         */
        hasPropertyAttributes: function () {
            // creating object with read-only property
            var o = Object.defineProperty({}, 'p', {
                writable: false,
                value   : false
            });

            // attempting to change property
            try {
                o.p = true;
            } catch (e) {
                // change failed, property is RO
                return true;
            }

            // when property can be changed, defineProperty is sure to be polyfill
            return !o.p;
        }
    };

    /**
     * Whether methods should be writable (environmental)
     * @type {boolean}
     */
    $oop.writable = !$oop.Feature.canAssignToReadOnly();

    /**
     * Whether Giant OOP is in testing mode (application state)
     * TODO: Rename to something more specific.
     * @type {boolean}
     */
    $oop.testing = false;
}());

(function () {
    "use strict";

    $assertion.addTypes(/** @lends $oop */{
        /**
         * Checks whether properties of `expr` are *all* functions.
         * @param {object} expr
         */
        isAllFunctions: function (expr) {
            var methodNames,
                i;

            if (!this.isObject(expr)) {
                return false;
            }

            methodNames = Object.keys(expr);
            for (i = 0; i < methodNames.length; i++) {
                if (!this.isFunctionOptional(expr[methodNames[i]])) {
                    return false;
                }
            }

            return true;
        },

        /**
         * Verifies if `expr` is a Giant class.
         * @param {$oop.Base} expr
         */
        isClass: function (expr) {
            return self.isPrototypeOf(expr);
        },

        /**
         * Verifies if `expr` is a Giant class or is not defined.
         * @param {$oop.Base} expr
         */
        isClassOptional: function (expr) {
            return typeof expr === 'undefined' ||
                   self.isPrototypeOf(expr);
        }
    });

    /**
     * @name $oop.Base.extend
     * @function
     * @returns {$oop.Base}
     */

    /**
     * Base class. Implements tools for building, instantiating and testing classes.
     * @class
     */
    $oop.Base = {
        /**
         * Disposable method for adding further (public) methods.
         * Will be replaced by Properties.
         * @param {object} methods Object of methods.
         * @ignore
         */
        addMethods: function (methods) {
            $assertion.isAllFunctions(methods, "Some methods are not functions.");

            var methodNames = Object.keys(methods),
                i, methodName;
            for (i = 0; i < methodNames.length; i++) {
                methodName = methodNames[i];
                Object.defineProperty(this, methodName, {
                    value       : methods[methodName],
                    enumerable  : true,
                    writable    : false,
                    configurable: false
                });
            }

            return this;
        }
    };

    var self = $oop.Base;

    self.addMethods(/** @lends $oop.Base# */{
        /**
         * Extends class. Extended classes may override base class methods and properties according to
         * regular OOP principles.
         * @example
         * var MyClass = $oop.Base.extend();
         * @returns {$oop.Base}
         */
        extend: function () {
            var result = Object.create(this);

            /**
             * Extending once more with no own properties
             * so that methods may be mocked on a static level.
             */
            if ($oop.testing === true) {
                result = Object.create(result);
            }

            return result;
        },

        /**
         * Determines target object of method addition.
         * In testing mode, each class has two prototype levels and methods should go to the lower one
         * so they may be covered on the other. Do not use in production, only testing.
         * @returns {$oop.Base}
         */
        getTarget: function () {
            return /** @type {$oop.Base} */ $oop.testing === true ?
                Object.getPrototypeOf(this) :
                this;
        },

        /**
         * Retrieves the base class of the current class.
         * @example
         * var MyClass = $oop.Base.extend();
         * MyClass.getBase() === $oop.Base; // true
         * @returns {$oop.Base}
         */
        getBase: function () {
            return /** @type {$oop.Base} */ $oop.testing === true ?
                Object.getPrototypeOf(Object.getPrototypeOf(this)) :
                Object.getPrototypeOf(this);
        },

        /**
         * Tests whether the current class or instance is a descendant of base.
         * @example
         * var MyClass = $oop.Base.extend();
         * MyClass.isA($oop.Base) // true
         * MyClass.isA(MyClass) // false
         * @param {$oop.Base} base
         * @returns {boolean}
         */
        isA: function (base) {
            return base.isPrototypeOf(this);
        },

        /**
         * Tests whether the current class is base of the provided object.
         * @method
         * @returns {boolean}
         * @example
         * var MyClass = $oop.Base.extend();
         * MyClass.isA($oop.Base) // true
         * MyClass.isA(MyClass) // false
         */
        isBaseOf: Object.prototype.isPrototypeOf,

        /**
         * Tests whether the current class or instance is the direct extension or instance
         * of the specified class.
         * @param {$oop.Base} base
         * @example
         * var ClassA = $oop.Base.extend(),
         *     ClassB = ClassA.extend();
         * ClassA.instanceOf($oop.Base) // true
         * ClassB.instanceOf($oop.Base) // false
         * ClassB.instanceOf(ClassA) // true
         * @returns {Boolean}
         */
        instanceOf: function (base) {
            return self.getBase.call(this) === base;
        }
    });
}());

(function () {
    "use strict";

    var hOP = Object.prototype.hasOwnProperty;

    /**
     * @class
     * @ignore
     */
    $oop.Memoization = {
        /**
         * Adds instance to registry. Must be called on class object!
         * @this {$oop.Base} Giant class
         * @param {string} key Instance key
         * @param {$oop.Base} instance Instance to be memoized
         */
        addInstance: function (key, instance) {
            this.instanceRegistry[key] = instance;
        },

        /**
         * Fetches a memoized instance from the registry.
         * @param {string} key
         * @returns {$oop.Base}
         */
        getInstance: function (key) {
            var instanceRegistry = this.instanceRegistry;
            return instanceRegistry ? instanceRegistry[key] : undefined;
        },

        /**
         * Maps instance to registry
         * Receives constructor arguments
         * @returns {string} Instance key
         */
        mapInstance: function () {
            return this.instanceMapper.apply(this, arguments);
        }
    };

    $oop.Base.addMethods(/** @lends $oop.Base# */{
        /**
         * Assigns instance key calculator to class. Makes class memoized.
         * @param {function} instanceMapper Instance key mapper function.
         * @example
         * var MyClass = $oop.Base.extend()
         *     .setInstanceMapper(function (arg) {return '' + arg;})
         *     .addMethods({
         *         init: function () {}
         *     }),
         *     myInstance1 = MyClass.create('foo'),
         *     myInstance2 = MyClass.create('foo');
         * MyClass.isMemoized() // true
         * myInstance 1 === myInstance2 // true
         * @returns {$oop.Base}
         */
        setInstanceMapper: function (instanceMapper) {
            $assertion
                .isFunction(instanceMapper, "Invalid instance key calculator")
                .assert(!hOP.call(this, 'instanceMapper'), "Instance mapper already set");

            this
                .addMethods(/** @lends $oop.Base# */{
                    /**
                     * Maps constructor arguments to instance keys in the registry.
                     * Added to class via .setInstanceMapper().
                     * @function
                     * @returns {string}
                     */
                    instanceMapper: instanceMapper
                })
                .addPublic(/** @lends $oop.Base# */{
                    /**
                     * Lookup registry for instances of the memoized class.
                     * Has to be own property as child classes may put their instances here, too.
                     * Added to class via .setInstanceMapper().
                     * @type {object}
                     */
                    instanceRegistry: {}
                });

            return this;
        },

        /**
         * Tells whether the current class (or any of its base classes) is memoized.
         * @returns {boolean}
         * @see $oop.Base.setInstanceMapper
         */
        isMemoized: function () {
            return typeof this.instanceMapper === 'function';
        },

        /**
         * Clears instance registry. After the registry is cleared, a new set of instances will be created
         * for distinct constructor arguments.
         * @returns {$oop.Base}
         * @see $oop.Base.setInstanceMapper
         */
        clearInstanceRegistry: function () {
            $assertion.assert(hOP.call(this, 'instanceRegistry'), "Class doesn't own an instance registry");
            this.instanceRegistry = {};
            return this;
        }
    });
}());

(function () {
    "use strict";

    var hOP = Object.prototype.hasOwnProperty;

    /**
     * @class
     * @ignore
     */
    $oop.Surrogate = {
        /**
         * Adds surrogates buffer to class.
         * @this $oop.Base
         */
        initSurrogates: function () {
            this.addConstants(/** @lends $oop.Base# */{
                /**
                 * Container for surrogate info. Added to class via .initSurrogates().
                 * @type {object}
                 */
                surrogateInfo: {
                    /**
                     * @type {function}
                     */
                    preparationHandler: undefined,

                    /**
                     * @type {object[]}
                     */
                    descriptors: []
                }
            });
        },

        /**
         * Retrieves first surrogate fitting constructor arguments.
         * @this $oop.Base
         * @returns {$oop.Base}
         */
        getSurrogate: function () {
            /**
             * Surrogate info property must be the class' own property
             * otherwise surrogates would be checked on instantiating
             * every descendant of the current class, too.
             * This would be wasteful, unnecessary, and confusing.
             */
            if (!hOP.call(this, 'surrogateInfo')) {
                // class has no surrogate
                return this;
            }

            var surrogateInfo = this.surrogateInfo,
                preparationHandler = surrogateInfo.preparationHandler,
                descriptorArguments = preparationHandler && preparationHandler.apply(this, arguments) ||
                    arguments,
                descriptors = surrogateInfo.descriptors,
                descriptorCount = descriptors.length,
                i, descriptor;

            // going through descriptors and determining surrogate
            for (i = 0; i < descriptorCount; i++) {
                descriptor = descriptors[i];

                // determining whether arguments fit next filter
                if (descriptor.filter.apply(this, descriptorArguments)) {
                    return descriptor.namespace[descriptor.className];
                }
            }

            // returning caller as fallback
            return this;
        },

        /**
         * Compares surrogate descriptors for sorting.
         * @param {object} a
         * @param {object} b
         * @returns {number}
         */
        surrogateDescriptorComparer: function (a, b) {
            var priorityA = a.priority,
                priorityB = b.priority;

            return priorityA > priorityB ? -1 : priorityB > priorityA ? 1 : 0;
        }
    };

    $oop.Base.addMethods(/** @lends $oop.Base# */{
        /**
         * Adds a handler to be called before evaluating any of the surrogate filters.
         * The specified handler receives the original constructor arguments and is expected to
         * return a modified argument list (array) that will be passed to the surrogate filters.
         * @param {function} handler
         * @returns {$oop.Base}
         * @see $oop.Base.addSurrogate
         */
        prepareSurrogates: function (handler) {
            $assertion.isFunction(handler, "Invalid handler");

            if (!hOP.call(this, 'surrogateInfo')) {
                $oop.Surrogate.initSurrogates.call(this);
            }

            this.surrogateInfo.preparationHandler = handler;

            return this;
        },

        /**
         * Adds a surrogate class to the current class. Instantiation is forwarded to the first surrogate where
         * the filter returns true. Surrogates are processed in order of descending priority values.
         * @param {object} namespace Namespace in which the surrogate class resides.
         * @param {string} className Surrogate class name. The class the namespace / class name point to does not
         * have to exist (or be resolved when postponed) at the time of adding the filter.
         * @param {function} filter Function evaluating whether the surrogate class specified by the namespace
         * and class name fits the arguments.
         * @param {number} [priority=0] When to evaluate the surrogate among all surrogates applied to a class.
         * Surrogates with higher priority values are processed first.
         * @example
         * var ns = {}; // namespace
         * ns.Horse = $oop.Base.extend()
         *     .prepareSurrogates(function (height) {
         *         return [height < 5]; // isPony
         *     })
         *     .addSurrogate(ns, 'Pony', function (isPony) {
         *         return isPony;
         *     })
         *     .addMethods({ init: function () {} });
         * ns.Pony = ns.Horse.extend()
         *     .addMethods({ init: function () {} });
         * var myHorse = ns.Horse.create(10), // instance of ns.Horse
         *     myPony = ns.Horse.create(3); // instance of ns.Pony
         * @returns {$oop.Base}
         */
        addSurrogate: function (namespace, className, filter, priority) {
            priority = priority || 0;

            $assertion
                .isObject(namespace, "Invalid namespace object")
                .isString(className, "Invalid class name")
                .isFunction(filter, "Invalid filter function");

            if (hOP.call(this, 'instanceRegistry')) {
                // clearing cached instances making sure the surrogate will not be bypassed
                this.clearInstanceRegistry();
            }

            if (!hOP.call(this, 'surrogateInfo')) {
                // initializing surrogate info container
                $oop.Surrogate.initSurrogates.call(this);
            }

            var descriptors = this.surrogateInfo.descriptors;

            // adding descriptor to container
            descriptors.push({
                namespace: namespace,
                className: className,
                filter   : filter,
                priority : priority
            });

            // sorting descriptors so they are in order of (descending) priority
            // (sorting might take O(n*logn), but it's altogether cheaper to sort on addition than on iteration)
            descriptors.sort($oop.Surrogate.surrogateDescriptorComparer);

            return this;
        }
    });
}());

(function () {
    "use strict";

    var Memoization = $oop.Memoization,
        Surrogate = $oop.Surrogate,
        Base = $oop.Base;

    $oop.Base.addMethods(/** @lends $oop.Base# */{
        /**
         * Creates a new instance of the class it was called on. Arguments passed to .create will be handed over
         * to the user-defined .init method, which will decorate the new instance with properties.
         * @see $oop.Base.setInstanceMapper
         * Instantiation might create a new instance of a subclass if the current class has surrogates.
         * @see $oop.Base.addSurrogate
         * @example
         * var MyClass = $oop.Base.extend({
         *         init: function (foo) {
         *            this.foo = 'bar';
         *         }
         *     }),
         *     myInstance = MyClass.create("bar");
         * myInstance.foo // "bar"
         * @returns {$oop.Base}
         */
        create: function () {
            var self = this.surrogateInfo && Surrogate.getSurrogate.apply(this, arguments) ||
                       this,
                instanceMapper = self.instanceMapper,
                instanceKey,
                that;

            // attempting to fetch memoized instance
            if (instanceMapper) {
                instanceKey = Memoization.mapInstance.apply(self, arguments);
                that = Memoization.getInstance.call(self, instanceKey);
                if (that) {
                    return that;
                }
            }

            // instantiating class
            that = Base.extend.call(self);

            // initializing instance properties
            if (typeof self.init === 'function') {
                // running instance initializer
                self.init.apply(that, arguments);
            }

            // storing instance for memoized class
            if (instanceMapper && typeof instanceKey !== 'undefined') {
                Memoization.addInstance.call(self, instanceKey, that);
            }

            return that;
        }
    });
}());

(function () {
    "use strict";

    var hOP = Object.prototype.hasOwnProperty,
        validators = $assertion.validators;

    $assertion.addTypes(/** @lends $oop */{
        /**
         * Checks whether host object has propertyName defined as its
         * own property.
         * @param {string} propertyName
         * @param {object} host
         */
        isPropertyNameAvailable: function (propertyName, host) {
            return !hOP.call(host, propertyName);
        },

        /**
         * Checks property names against prefix.
         * @param {object} expr Host object.
         * @param {string} prefix Prefix.
         */
        isAllPrefixed: function (expr, prefix) {
            var propertyNames,
                i;

            if (!this.isString(prefix) || !this.isPlainObject(expr)) {
                return false;
            }

            propertyNames = Object.keys(expr);
            for (i = 0; i < propertyNames.length; i++) {
                if (propertyNames[i].substr(0, prefix.length) !== prefix) {
                    // prefix doesn't match property name
                    return false;
                }
            }

            return true;
        },

        /**
         * Tells whether an object holds a getter / setter pair.
         * @param {object} expr Host object.
         */
        isAccessor: function (expr) {
            var accessorMethods = {
                'get'    : true,
                'set'    : true,
                'get,set': true,
                'set,get': true
            };

            return this.isPlainObject(expr) &&
                this.isAllFunctions(expr) &&
                Object.getOwnPropertyNames(expr).join(',') in accessorMethods;
        }
    });

    /**
     * Allows properties to be added to arbitrary objects as if they were Giant classes.
     * The Giant base class uses these methods internally. They are exposed however due to their usefulness in testing.
     * @class
     */
    $oop.Properties = {
        /**
         * Retrieves the object from the host's prototype chain that owns the specified property.
         * @param {string} propertyName
         * @param {object} host
         * @returns {object|undefined}
         */
        getOwnerOf: function (host, propertyName) {
            var owner = host;

            while (owner !== Object.prototype) {
                if (hOP.call(owner, propertyName)) {
                    return owner;
                } else {
                    owner = Object.getPrototypeOf(owner);
                }
            }
        },

        /**
         * Collects all property names (including non-enumerable ones) from the entire prototype chain.
         * Always excludes the properties of Object.prototype.
         * @param {object} host
         * @param {object} [base=Object.prototype]
         */
        getPropertyNames: function (host, base) {
            base = base || Object.prototype;

            var propertyNameLookup = {},
                currentLevel = host,
                propertyNames,
                i;

            while (currentLevel !== base) {
                propertyNames = Object.getOwnPropertyNames(currentLevel);
                for (i = 0; i < propertyNames.length; i++) {
                    propertyNameLookup[propertyNames[i]] = true;
                }
                currentLevel = Object.getPrototypeOf(currentLevel);
            }

            // flipping lookup
            return Object.keys(propertyNameLookup);
        },

        /**
         * Retrieves the property descriptor of the specified property regardless of its position
         * on the prototype chain.
         * @param {object} host
         * @param {string} propertyName
         * @returns {object|undefined}
         * @see Object.getOwnPropertyDescriptor
         */
        getPropertyDescriptor: function (host, propertyName) {
            var owner = this.getOwnerOf(host, propertyName);

            if (owner) {
                return Object.getOwnPropertyDescriptor(owner, propertyName);
            }
        },

        /**
         * Adds single value property to the context.
         * @this {$oop.Base}
         * @param {string} propertyName Property name.
         * @param value {*} Property value to be assigned.
         * @param {boolean} [isWritable]
         * @param {boolean} [isEnumerable]
         * @param {boolean} [isConfigurable]
         */
        addProperty: function (propertyName, value, isWritable, isEnumerable, isConfigurable) {
            $assertion
                .isString(propertyName, "Invalid property name")
                .isBooleanOptional(isWritable)
                .isBooleanOptional(isEnumerable)
                .isBooleanOptional(isConfigurable);

            Object.defineProperty(this, propertyName, {
                value       : value,
                writable    : isWritable || $oop.messy,
                enumerable  : isEnumerable,
                configurable: isConfigurable
            });
        },

        /**
         * Adds single accessor property to the context.
         * @this {$oop.Base}
         * @param {string} propertyName Property name.
         * @param {function} [getter] Property getter.
         * @param {function} [setter] Property setter.
         * @param {boolean} [isEnumerable]
         * @param {boolean} [isConfigurable]
         */
        addAccessor: function (propertyName, getter, setter, isEnumerable, isConfigurable) {
            $assertion
                .isString(propertyName, "Invalid property name")
                .isFunctionOptional(getter)
                .isFunctionOptional(setter)
                .isBooleanOptional(isEnumerable)
                .isBooleanOptional(isConfigurable);

            Object.defineProperty(this, propertyName, {
                get         : getter,
                set         : setter,
                enumerable  : isEnumerable,
                configurable: isConfigurable
            });
        },

        /**
         * Adds a block of properties to the context having the specified attributes.
         * @this {$oop.Base}
         * @param {object|function} properties Property object or its generator function.
         * @param {boolean} [isWritable]
         * @param {boolean} [isEnumerable]
         * @param {boolean} [isConfigurable]
         * @returns {$oop.Base}
         */
        addProperties: function (properties, isWritable, isEnumerable, isConfigurable) {
            var propertyNames = Object.keys(properties),
                i, propertyName, property;

            for (i = 0; i < propertyNames.length; i++) {
                // making sure property name is available
                propertyName = propertyNames[i];
                $assertion.isPropertyNameAvailable(propertyName, this, "Direct property conflict");

                // adding accessor / property
                property = properties[propertyName];
                if (validators.isAccessor(property)) {
                    self.addAccessor.call(this,
                        propertyName,
                        property.get,
                        property.set,
                        isEnumerable,
                        isConfigurable
                    );
                } else {
                    self.addProperty.call(this,
                        propertyName,
                        property,
                        isWritable,
                        isEnumerable,
                        isConfigurable
                    );
                }
            }

            return this;
        }
    };

    var self = $oop.Properties;

    $oop.Base.addMethods(/** @lends $oop.Base# */{
        /**
         * Adds a block of public read-only methods to the class it's called on.
         * When $oop.testing is on, methods will be placed on the class differently than other properties,
         * therefore it is important to use .addMethods and .addPrivateMethods for method addition.
         * @param {object} methods Name - value pairs of methods to apply. Values must be functions,
         * or objects implementing a pair of get and set functions.
         * @example
         * var myClass = $oop.extend()
         *    .addMethods({
         *        foo: function () {alert("Foo");},
         *        bar: {get: function () {return "Bar";}
         *    });
         * @returns {$oop.Base}
         */
        addMethods: function (methods) {
            $assertion.isAllFunctions(methods, "Invalid methods object");

            self.addProperties.call($oop.Base.getTarget.call(this), methods, false, true, false);

            return this;
        },

        /**
         * Adds a block of private (non-enumerable) read-only methods to the class it's called on.
         * Method names must match the private prefix rule set by `$oop.privatePrefix`.
         * When $oop.testing is on, methods will be placed on the class differently than other properties,
         * therefore it is important to use .addMethods and .addPrivateMethods for method addition.
         * @param {object} methods Name - value pairs of methods to apply. Values must be functions,
         * or objects implementing a pair of get and set functions.
         * @example
         * var myClass = $oop.extend()
         *    .addMethods({
         *        _foo: function () {alert("Foo");},
         *        _bar: {get: function () {return "Bar";}
         *    });
         * @returns {$oop.Base}
         */
        addPrivateMethods: function (methods) {
            $assertion
                .isAllFunctions(methods, "Some private methods are not functions.")
                .isAllPrefixed(methods, $oop.privatePrefix, "Some private method names do not match the required prefix.");

            self.addProperties.call($oop.Base.getTarget.call(this), methods);

            return this;
        },

        /**
         * Adds a trait to the current class.
         * A trait may be as simple as a plain object holding properties and methods to be copied over to the
         * current class. More often however, a trait is a Giant class, through which, Giant realizes a form of
         * multiple inheritance. There will still be just one prototype from which the current class stems, but
         * methods delegated by the trait class will be used the same way as if they were implemented on the current
         * class.
         * Trait addition preserves ES5 attributes of copied properties, but skips property named `init`.
         * Each trait must be initialized manually.
         * @param {object|$oop.Base} trait Trait object
         * @example
         * MyTrait = $oop.Base.extend()
         *    .addMethods({
         *        init: function () { alert("trait init"); }
         *        foo: function () { alert("hello"); }
         *    });
         * MyClass = $oop.Base.extend()
         *    .addTrait(MyTrait)
         *    .addMethods({ init: function () { MyTrait.init.call(this); } });
         * myInstance = MyClass.create(); // alerts "trait init"
         * myInstance.foo(); // alerts "hello"
         * @returns {$oop.Base}
         */
        addTrait: function (trait) {
            $assertion.isObject(trait, "Invalid trait descriptor");

            // obtaining all property names (including non-enumerable)
            // for $oop classes, only those above the base class will be considered
            var hostTarget = $oop.Base.getTarget.call(this),
                propertyNames = $oop.Properties.getPropertyNames(
                    trait,
                    $oop.Base.isBaseOf(trait) ?
                        $oop.Base :
                        Object.prototype
                ),
                i, propertyName, property;

            for (i = 0; i < propertyNames.length; i++) {
                propertyName = propertyNames[i];

                if (propertyName === 'init') {
                    // skipping 'init'
                    continue;
                }

                // trait properties must not collide w/ host's
                $assertion.isPropertyNameAvailable(propertyName, this, "Direct property conflict");

                // copying property over w/ original attributes
                property = trait[propertyName];
                Object.defineProperty(
                    typeof property === 'function' ?
                        hostTarget :
                        this,
                    propertyName,
                    $oop.Properties.getPropertyDescriptor(trait, propertyName)
                );
            }

            return this;
        },

        /**
         * Adds trait to current class then extends it, allowing subsequently added methods to override
         * the trait's methods.
         * @param {object|$oop.Base} trait
         * @returns {$oop.Base}
         * @see $oop.Base.addTrait
         */
        addTraitAndExtend: function (trait) {
            return this
                .addTrait(trait)
                .extend();
        },

        /**
         * Adds a block of public (enumerable) writable properties to the current class or instance.
         * @param {object} properties Name-value pairs of properties.
         * @returns {$oop.Base}
         */
        addPublic: function (properties) {
            self.addProperties.call(this, properties, true, true, false);
            return this;
        },

        /**
         * Adds a block of private (non-enumerable) writable properties to the current class or instance.
         * Property names must match the private prefix rule set by `$oop.privatePrefix`.
         * @param {object} properties Name-value pairs of properties.
         * @returns {$oop.base}
         */
        addPrivate: function (properties) {
            $assertion.isAllPrefixed(properties, $oop.privatePrefix, "Some private property names do not match the required prefix.");

            self.addProperties.call(this, properties, true, false, false);

            return this;
        },

        /**
         * Adds a block of public (enumerable) constant (read-only) properties to the current class or instance.
         * @param {object} properties Name-value pairs of constant properties
         * @returns {$oop.Base}
         */
        addConstants: function (properties) {
            self.addProperties.call(this, properties, false, true, false);
            return this;
        },

        /**
         * Adds a block of private (non-enumerable) constant (read-only) properties to the current class or instance.
         * Property names must match the private prefix rule set by `$oop.privatePrefix`.
         * @param {object} properties Name-value pairs of private constant properties.
         * @returns {$oop.Base}
         */
        addPrivateConstants: function (properties) {
            $assertion.isAllPrefixed(properties, $oop.privatePrefix, "Some private constant names do not match the required prefix.");

            self.addProperties.call(this, properties);

            return this;
        },

        /**
         * Elevates method from class level to instance level. (Or from base class to current class.)
         * Ties context to the object it was elevated to, so methods may be safely passed as event handlers.
         * @param {string} methodName Name of method to elevate.
         * @example
         * ClassA = $oop.Base.extend()
         *    .addMethods({
         *        init: function () {},
         *        foo: function () { alert(this.bar); }
         *    });
         * ClassB = ClassA.extend()
         *     .addMethods({
         *         init: function () {
         *             this.bar = "hello";
         *             this.elevateMethod('foo');
         *         }
         *     });
         * foo = ClassB.create().foo; // should lose context
         * foo(); // alerts "hello", for context was preserved
         * @returns {$oop.Base}
         */
        elevateMethod: function (methodName) {
            $assertion.isString(methodName, "Invalid method name");

            var base = this.getBase(), // class or base class
                baseMethod = base[methodName],
                elevatedMethod;

            $assertion.isFunction(baseMethod, "Attempted to elevate non-method.", methodName);

            elevatedMethod = {};
            elevatedMethod[methodName] = baseMethod.bind(this);
            $oop.Base.addMethods.call(this, elevatedMethod);

            return this;
        },

        /**
         * Elevates multiple methods. Method names are expected to be passed as individual arguments.
         * (In no particular order.)
         * @returns {$oop.Base}
         * @see $oop.Base#elevateMethod
         */
        elevateMethods: function () {
            var base = this.getBase(),
                elevatedMethods = {},
                i, methodName, baseMethod;

            for (i = 0; i < arguments.length; i++) {
                methodName = arguments[i];
                baseMethod = base[methodName];
                elevatedMethods[methodName] = baseMethod.bind(this);
            }

            $assertion.isAllFunctions(elevatedMethods, "Attempted to elevate non-method");
            $oop.Base.addMethods.call(this, elevatedMethods);

            return this;
        },

        /**
         * Adds a block of public (enumerable) mock methods (read-only, but removable) to the current instance or class.
         * @param {object} methods Name-value pairs of methods. Values must be functions or getter-setter objects.
         * @example
         * $oop.testing = true;
         * MyClass = $oop.Base.extend()
         *      .addMethods({
         *          init: function () {},
         *          foo: function () {}
         *      });
         * myInstance = MyClass.create();
         * MyClass.addMocks({
         *     foo: function () {return 'FOO';}
         * });
         * myInstance.foo() // returns 'FOO'
         * @see $oop.Base#addMethods
         * @returns {$oop.Base}
         */
        addMocks: function (methods) {
            $assertion
                .assert($oop.testing, "Giant is not in testing mode.")
                .isAllFunctions(methods, "Some mock methods are not functions.");

            self.addProperties.call(this, methods, false, true, true);

            return this;
        },

        /**
         * Removes all mock methods from the current class or instance.
         * @returns {$oop.Base}
         */
        removeMocks: function () {
            var propertyNames = Object.keys(this),
                i, propertyName, property;

            for (i = 0; i < propertyNames.length; i++) {
                propertyName = propertyNames[i];
                property = this[propertyName];
                if (typeof property === 'function' && !(property instanceof RegExp)) {
                    /**
                     * All enumerable function properties are considered mocks
                     * and will be removed (unless non-configurable).
                     * RegExp check: in older browsers (eg. Safari 4.0.5) typeof /regexp/
                     * evaluates to 'function' and should be excluded.
                     */
                    delete this[propertyName];
                }
            }

            return this;
        }
    });

    $oop.Base.addPublic.call($oop, /** @lends $oop */{
        /**
         * Prefix applied to names of private properties and methods.
         * @type {string}
         */
        privatePrefix: '_',

        /**
         * When true, all properties are writable, so they can be
         * modified through assignment.
         * @type {boolean}
         */
        messy: false
    });
}());

(function () {
    "use strict";

    /**
     * @class
     * @ignore
     */
    $oop.AmendUtils = {
        /**
         * Retrieves amendments from postponed definition.
         * Returns empty array when argument is not property descriptor or descriptor has no amendments assigned.
         * @param {object} [propertyDescriptor]
         * @returns {Array}
         */
        getAmendments: function (propertyDescriptor) {
            return $assertion.validators.isSetterGetterDescriptor(propertyDescriptor) &&
                   propertyDescriptor.get.amendments ||
                   [];
        },

        /**
         * Sets amendments on postponed definition. Overwrites previous amendments.
         * @param {object} propertyDescriptor
         * @param {object[]} amendments
         */
        setAmendments: function (propertyDescriptor, amendments) {
            var propertyGetter = propertyDescriptor.get;
            propertyGetter.amendments = amendments;
        },

        /**
         * @param {object} propertyDescriptor
         * @param {function} modifier
         * @param {Array} modifierArguments
         */
        addAmendment: function (propertyDescriptor, modifier, modifierArguments) {
            var propertyGetter = propertyDescriptor.get;

            propertyGetter.amendments = propertyGetter.amendments || [];

            propertyGetter.amendments.push({
                modifier: modifier,
                args    : modifierArguments
            });
        },

        /**
         * Applies specified amendments to the specified property descriptor.
         * @param {object} propertyDescriptor
         * @param {object[]} amendments
         */
        applyAmendments: function (propertyDescriptor, amendments) {
            var i, amendment;

            if (amendments instanceof Array) {
                for (i = 0; i < amendments.length; i++) {
                    amendment = amendments[i];
                    amendment.modifier.apply($oop, amendment.args);
                }
            }
        }
    };
}());
(function () {
    "use strict";

    $oop.Properties.addProperties.call($oop, /** @lends $oop */{
        /**
         * @param {object} functions
         * @returns {$oop}
         */
        addGlobalFunctions: function (functions) {
            $assertion.isAllFunctions(functions, "Invalid functions object");
            $oop.Properties.addProperties.call(this, functions, false, true, false);
            return this;
        },

        /**
         * Adds constants to the global $oop namespace.
         * @param {object} constants Constants to be added. Should include primitive values only.
         * @returns {$oop}
         */
        addGlobalConstants: function (constants) {
            $oop.Properties.addProperties.call(this, constants, false, true, false);
            return this;
        }
    });
}());

(function () {
    "use strict";

    /**
     * Extends built-in objects, like String.prototype, with custom conversion methods.
     * Restricts extension to conversion methods, ie. all such methods should take the instance
     * of the built-in object and convert that to something else. Consequentially, all extension
     * methods must obey the naming convention "to....".
     * @param {object} builtInPrototype prototype object to extend.
     * @param {object} methods Override methods. All method names must be prefixed with "to".
     */
    $oop.extendBuiltIn = function (builtInPrototype, methods) {
        $assertion
            .isAllFunctions(methods, "Invalid methods")
            .isAllPrefixed(methods, 'to', "Invalid method names");

        $oop.Properties.addProperties.call(builtInPrototype, methods, false, false, false);
    };
}());

(function () {
    "use strict";

    var hOP = Object.prototype.hasOwnProperty,
        slice = Array.prototype.slice,
        validators = $assertion.validators;

    $assertion.addTypes(/** @lends $oop */{
        /**
         * Determines whether a property descriptor is a getter-setter.
         * @param {object} propertyDescriptor
         */
        isSetterGetterDescriptor: function (propertyDescriptor) {
            return propertyDescriptor instanceof Object &&
                   hOP.call(propertyDescriptor, 'get') &&
                   hOP.call(propertyDescriptor, 'set') &&
                   hOP.call(propertyDescriptor, 'enumerable') &&
                   hOP.call(propertyDescriptor, 'configurable');
        },

        /**
         * Determines whether a property descriptor is a value property.
         * @param {object} propertyDescriptor
         */
        isValueDescriptor: function (propertyDescriptor) {
            return propertyDescriptor instanceof Object &&
                   hOP.call(propertyDescriptor, 'value') &&
                   hOP.call(propertyDescriptor, 'writable') &&
                   hOP.call(propertyDescriptor, 'enumerable') &&
                   hOP.call(propertyDescriptor, 'configurable');
        }
    });

    $oop.addGlobalFunctions(/** @lends $oop */{
        /**
         * Postpones a property definition on the specified object until first access.
         * Initially assigns a special getter to the property, then, when the property is accessed for the first time,
         * the property is assigned the return value of the generator function, unless a value has been assigned from
         * within the generator.
         * @param {object} host Host object.
         * @param {string} propertyName Property name.
         * @param {function} generator Generates (and returns) property value. Arguments: host object, property name,
         * plus all extra arguments passed to .postpone().
         * @example
         * var obj = {};
         * $oop.postpone(obj, 'foo', function () {
         *    return "bar";
         * });
         * obj.foo // runs generator and alerts "bar"
         */
        postpone: function (host, propertyName, generator) {
            $assertion
                .isObject(host, "Host is not an Object")
                .isString(propertyName, "Invalid property name")
                .isFunction(generator, "Invalid generator function");

            var Amendments = $oop.AmendUtils,
                propertyDescriptorBefore = Object.getOwnPropertyDescriptor(host, propertyName),
                propertyDescriptorAfter,
                generatorArguments = slice.call(arguments);

            // preparing generator argument list
            generatorArguments.splice(2, 1);

            // placing class placeholder on namespace as getter
            propertyDescriptorAfter = {
                get: function getter() {
                    // NOTE: some browsers (like Firefox 11) can't handle the configurable property setting,
                    //       so remove the temporary property before overriding it
                    delete host[propertyName];

                    // obtaining property value
                    var value = generator.apply(this, generatorArguments),
                        amendments = getter.amendments,
                        propertyDescriptor;

                    if (typeof value !== 'undefined') {
                        // generator returned a property value
                        // overwriting placeholder with actual property value
                        Object.defineProperty(host, propertyName, {
                            value       : value,
                            writable    : false,
                            enumerable  : true,
                            configurable: false
                        });
                    } else {
                        // fetching descriptor for resolved property
                        // when descriptor is still a getter-setter, the postpone has not been resolved correctly
                        propertyDescriptor = Object.getOwnPropertyDescriptor(host, propertyName);

                        if (!validators.isSetterGetterDescriptor(propertyDescriptor)) {
                            // no return value
                            // generator supposedly assigned value to property
                            value = host[propertyName];
                        }
                    }

                    // applying amendments
                    Amendments.applyAmendments(propertyDescriptorAfter, amendments);

                    return value;
                },

                set: function (value) {
                    // overwriting placeholder with property value
                    Object.defineProperty(host, propertyName, {
                        value       : value,
                        writable    : false,
                        enumerable  : true,
                        configurable: false
                    });
                },

                enumerable  : true,
                configurable: true  // must be configurable in order to be re-defined
            };

            // copying over amendments from old getter-setter
            Amendments.setAmendments(propertyDescriptorAfter, Amendments.getAmendments(propertyDescriptorBefore));

            Object.defineProperty(host, propertyName, propertyDescriptorAfter);
        },

        /**
         * Applies a modifier to the postponed property to be called AFTER the property is resolved.
         * Amendments are resolved in the order they were applied. Amendments should not expect other amendments
         * to be applied.
         * Amendments may be applied before the corresponding .postpone().
         * @param {object} host Host object.
         * @param {string} propertyName Property name.
         * @param {function} modifier Amends property value. Arguments: host object, property name,
         * plus all extra arguments passed to .amendPostponed(). Return value is discarded.
         * @example
         * var ns = {};
         * $oop.postpone(ns, 'foo', function () {
         *  ns.foo = {hello: "World"};
         * });
         * //...
         * $oop.amendPostponed(ns, 'foo', function () {
         *  ns.foo.howdy = "Fellas";
         * });
         * // howdy is not added until first access to `ns.foo`
         */
        amendPostponed: function (host, propertyName, modifier) {
            $assertion
                .isObject(host, "Host is not an Object")
                .isString(propertyName, "Invalid property name")
                .isFunction(modifier, "Invalid generator function");

            var modifierArguments = slice.call(arguments),
                propertyDescriptor = Object.getOwnPropertyDescriptor(host, propertyName);

            // removing modifier from argument list
            modifierArguments.splice(2, 1);

            if (!propertyDescriptor) {
                // there is no value nor setter-getter defined on property
                // we're trying to amend before postponing
                // postponing with dummy generator function
                $oop.postpone(host, propertyName, function () {
                });

                // re-evaluating property descriptor
                propertyDescriptor = Object.getOwnPropertyDescriptor(host, propertyName);
            }

            if (validators.isSetterGetterDescriptor(propertyDescriptor)) {
                // property is setter-getter, ie. unresolved
                // adding generator to amendment functions
                $oop.AmendUtils.addAmendment(propertyDescriptor, modifier, modifierArguments);
            } else if (propertyDescriptor) {
                // property is value, assumed to be a resolved postponed property

                // calling modifier immediately
                modifier.apply($oop, modifierArguments);
            }
        }
    });
}());

/*jshint node:true */
if (typeof module === 'object') {
    module.exports = $oop;
}

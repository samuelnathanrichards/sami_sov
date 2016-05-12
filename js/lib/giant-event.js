/*jshint node:true */

/** @namespace */
var $event = {};

/** @namespace */
var $assertion = $assertion || require('giant-assertion');

/** @namespace */
var $oop = $oop || require('giant-oop');

/** @namespace */
var $utils = $utils || require('giant-utils');

/** @namespace */
var $data = $data || require('giant-data');

/**
 * Interface that marks a class as an event spawner. Event spawners create and prepare instances of $event.Event.
 * @name $event.EventSpawner
 * @class
 * @extends $oop.Base
 */

/**
 * Creates and prepares and event with the specified name.
 * @name $event.EventSpawner#spawnEvent
 * @function
 * @param {string} eventName
 * @returns {$event.Event}
 */

/**
 * Interface that marks a class as a source of events, ie. triggering and broadcasting events.
 * @name $event.EventSource
 * @class
 * @extends $oop.Base
 */

/**
 * Triggers an event of a specific type on a specific path in a specific event space.
 * These parameters may be passed to this method, or defined elsewhere depending on the implementation.
 * Triggered events are unidirectional, optionally bubbling towards the root path.
 * @name $event.EventSource#triggerSync
 * @function
 * @returns {$event.EventSource}
 */

/**
 * Broadcasts an event of a specific type on a specific path in a specific event space.
 * These parameters may be passed to this method, or defined elsewhere depending on the implementation.
 * Broadcast events will call all handlers subscribed at a path relative to the broadcast path.
 * @name $event.EventSource#broadcastSync
 * @function
 * @returns {$event.EventSource}
 */

/**
 * Interface that marks a class as target for events. Event targets may subscribe to events.
 * @name $event.EventTarget
 * @class
 * @extends $oop.Base
 */

/**
 * Subscribes a handler to the specified event, in a specific event space.
 * @name $event.EventTarget#subscribeTo
 * @function
 * @param {string} eventName
 * @returns {$event.EventTarget}
 */

/**
 * Unsubscribes a handler from the specified event, in a specific event space.
 * @name $event.EventTarget#unsubscribeFrom
 * @function
 * @param {string} eventName
 * @returns {$event.EventTarget}
 */

/**
 * Subscribes a handler to the specified event, in a specific event space, and unsubscribes after the first time it was triggered.
 * @name $event.EventTarget#subscribeToUntilTriggered
 * @function
 * @param {string} eventName
 * @returns {$event.EventTarget}
 */

/**
 * Subscribes a handler to the specified event, in a specific event space, but only if the event's original path matches a specified Query.
 * @name $event.EventTarget#delegateSubscriptionTo
 * @function
 * @param {string} eventName
 * @returns {$event.EventTarget}
 */

$oop.postpone($event, 'PathCollection', function () {
    "use strict";

    /**
     * @name $event.PathCollection.create
     * @function
     * @param {object} [items] Initial contents.
     * @returns {$event.PathCollection}
     */

    /**
     * @name $event.PathCollection#asArray
     * @ignore
     */

    /**
     * @class $event.PathCollection
     * @extends $data.Collection
     * @extends $data.Path
     */
    $event.PathCollection = $data.Collection.of($data.Path);
});

$oop.postpone($event, 'Event', function () {
    "use strict";

    var base = $oop.Base,
        self = base.extend();

    /**
     * Instantiates class.
     * @name $event.Event.create
     * @function
     * @param {string} eventName Event name
     * @param {$event.EventSpace} eventSpace Event space associated with event
     * @returns {$event.Event}
     */

    /**
     * An event is an object that may traverse in an event space.
     * Events carry all information regarding their position & properties.
     * @class
     * @extends $oop.Base
     * @extends $event.EventSource
     */
    $event.Event = self
        .addPrivateMethods(/** @lends $event.Event# */{
            /**
             * Creates a new event instance and prepares it to be triggered.
             * @param {$data.Path} targetPath
             * @returns {$event.Event}
             * @private
             */
            _spawnMainBroadcastEvent: function (targetPath) {
                return self.create(this.eventName, this.eventSpace)
                    .setBroadcastPath(targetPath)
                    .setTargetPath(targetPath);
            },

            /**
             * Creates a new event instance and prepares it to be broadcast.
             * Broadcast events do not bubble.
             * @param {$data.Path} broadcastPath
             * @param {$data.Path} targetPath
             * @returns {$event.Event}
             * @private
             */
            _spawnBroadcastEvent: function (broadcastPath, targetPath) {
                return self.create(this.eventName, this.eventSpace)
                    .allowBubbling(false)
                    .setBroadcastPath(broadcastPath)
                    .setTargetPath(targetPath);
            }
        })
        .addMethods(/** @lends $event.Event# */{
            /**
             * @param {string} eventName Event name
             * @param {$event.EventSpace} eventSpace Event space associated with event
             * @ignore
             */
            init: function (eventName, eventSpace) {
                $assertion
                    .isString(eventName, "Invalid event name")
                    .isEventSpace(eventSpace, "Invalid event space");

                /**
                 * @type {string}
                 * @constant
                 */
                this.eventName = eventName;

                /**
                 * @type {$event.EventSpace}
                 * @constant
                 */
                this.eventSpace = eventSpace;

                /**
                 * Whether the current event can bubble
                 * @type {boolean}
                 */
                this.canBubble = true;

                /**
                 * Giant event or DOM event that led to triggering the current event.
                 * In most cases, this property is set automatically.
                 * @type {$event.Event|*}
                 */
                this.originalEvent = undefined;

                /**
                 * Whether the event's default behavior was prevented.
                 * @type {boolean}
                 */
                this.defaultPrevented = false;

                /**
                 * Whether event was handled. (A subscribed handler ran.)
                 * @type {boolean}
                 */
                this.handled = false;

                /**
                 * Identifies the sender of the event.
                 * @type {*}
                 */
                this.sender = undefined;

                /**
                 * Custom payload to be carried by the event.
                 * In most cases, this property is not modified directly, but through
                 * $event.setNextPayloadItem()
                 * @type {object}
                 * @see $event.setNextPayloadItem
                 */
                this.payload = {};

                /**
                 * Path reflecting current state of bubbling
                 * @type {$data.Path}
                 */
                this.currentPath = undefined;

                /**
                 * Path on which the event was originally triggered
                 * @type {$data.Path}
                 */
                this.originalPath = undefined;

                /**
                 * Reference to the original target path if
                 * the event was triggered as part of a broadcast.
                 * @type {$data.Path}
                 */
                this.broadcastPath = undefined;
            },

            /**
             * Clones event and optionally sets its currentPath property to
             * the one specified by the argument.
             * Override in subclasses to clone additional properties.
             * @param {$data.Path} [currentPath]
             * @returns {$event.Event}
             */
            clone: function (currentPath) {
                $assertion.isPathOptional(currentPath, "Invalid current event path");

                var result = this.getBase().create(this.eventName, this.eventSpace);

                // transferring paths
                result.originalPath = this.originalPath;
                result.currentPath = currentPath ?
                    currentPath.clone() :
                    this.currentPath.clone();
                result.broadcastPath = this.broadcastPath;

                // transferring event state
                result.originalEvent = this.originalEvent;
                result.defaultPrevented = this.defaultPrevented;
                result.handled = this.handled;

                // transferring load
                result.sender = this.sender;
                result.payload = this.payload;

                return result;
            },

            /**
             * Sets whether the event can bubble
             * @param {boolean} value Bubbling flag
             * @returns {$event.Event}
             */
            allowBubbling: function (value) {
                $assertion.isBoolean(value, "Invalid bubbling flag");
                this.canBubble = value;
                return this;
            },

            /**
             * Sets original event that led to triggering the current event.
             * @param {$event.Event|*} originalEvent
             * @returns {$event.Event}
             */
            setOriginalEvent: function (originalEvent) {
                this.originalEvent = originalEvent;
                return this;
            },

            /**
             * Retrieves event from chain of original events by type.
             * @param {function|$oop.Base} eventType
             * @returns {$event.Event|*} Original event matching the specified type.
             */
            getOriginalEventByType: function (eventType) {
                var that = this.originalEvent,
                    result;

                if (typeof eventType === 'function') {
                    while (that) {
                        if (that instanceof eventType) {
                            result = that;
                            break;
                        } else {
                            that = that.originalEvent;
                        }
                    }
                } else if ($oop.Base.isBaseOf(eventType)) {
                    while (that) {
                        if (eventType.isBaseOf(that)) {
                            result = that;
                            break;
                        } else {
                            that = that.originalEvent;
                        }
                    }
                }

                return result;
            },

            /**
             * Retrieves event from chain of original events by the name of the event.
             * @param {string} eventName
             * @returns {$event.Event|*} Original event matching the specified name.
             */
            getOriginalEventByName: function (eventName) {
                var that = this.originalEvent,
                    result;

                while (that) {
                    if (that.eventName === eventName) {
                        result = that;
                        break;
                    } else {
                        that = that.originalEvent;
                    }
                }

                return result;
            },

            /**
             * Sets flag for default behavior prevention to true.
             * @returns {$event.Event}
             */
            preventDefault: function () {
                this.defaultPrevented = true;
                return this;
            },

            /**
             * Assigns paths to the event.
             * @param {$data.Path} targetPath Path on which to trigger event.
             * @returns {$event.Event}
             */
            setTargetPath: function (targetPath) {
                $assertion.isPath(targetPath, "Invalid target path");
                this.originalPath = targetPath;
                this.currentPath = targetPath.clone();
                return this;
            },

            /**
             * Assigns a broadcast path to the event.
             * @param {$data.Path} broadcastPath Path associated with broadcasting.
             * @returns {$event.Event}
             */
            setBroadcastPath: function (broadcastPath) {
                $assertion.isPath(broadcastPath, "Invalid broadcast path");
                this.broadcastPath = broadcastPath;
                return this;
            },

            /**
             * Sets event sender reference.
             * @param {*} sender
             * @returns {$event.Event}
             */
            setSender: function (sender) {
                this.sender = sender;
                return this;
            },

            /**
             * Sets an item on the event payload.
             * An event may carry multiple payload items set by multiple sources.
             * User payloads are usually set via $event.setNextPayloadItem.
             * @param {string} payloadName
             * @param {*} payloadValue
             * @returns {$event.Event}
             * @see $event.EventSpace#setNextPayloadItem
             */
            setPayloadItem: function (payloadName, payloadValue) {
                this.payload[payloadName] = payloadValue;
                return this;
            },

            /**
             * Sets multiple payload items in the current event's payload.
             * An event may carry multiple payload items set by multiple sources.
             * User payloads are usually set via $event.setNextPayloadItems.
             * @param {object} payloadItems
             * @returns {$event.Event}
             */
            setPayloadItems: function (payloadItems) {
                var payload = this.payload,
                    payloadNames = Object.keys(payloadItems),
                    i, payloadName;

                for (i = 0; i < payloadNames.length; i++) {
                    payloadName = payloadNames[i];
                    payload[payloadName] = payloadItems[payloadName];
                }

                return this;
            },

            /**
             * Triggers event.
             * Event handlers are assumed to be synchronous. Event properties change
             * between stages of bubbling, hence holding on to an event instance in an async handler
             * may not reflect the current paths and payload carried.
             * @param {$data.Path} [targetPath] Path on which to trigger event.
             * @returns {$event.Event}
             */
            triggerSync: function (targetPath) {
                $assertion.isPathOptional(targetPath, "Invalid target path");

                // preparing event for trigger
                if (targetPath) {
                    this.setTargetPath(targetPath);
                }

                var currentPath = this.currentPath,
                    eventSpace = this.eventSpace,
                    handlerCount;

                if (!this.canBubble || this.originalPath.isA($data.Query)) {
                    // event can't bubble because it's not allowed to
                    // or because path is a query and queries shouldn't bubble
                    // calling subscribed handlers once
                    eventSpace.callHandlers(this);
                } else {
                    // bubbling and calling handlers
                    while (currentPath.asArray.length) {
                        handlerCount = eventSpace.callHandlers(this);
                        if (handlerCount === false) {
                            // bubbling was deliberately stopped
                            // getting out of the bubbling loop
                            break;
                        } else {
                            if (handlerCount > 0) {
                                // setting handled flag
                                this.handled = true;
                            }
                            currentPath.asArray.pop();
                        }
                    }
                }

                return this;
            },

            /**
             * Broadcasts the event to all subscribed paths branching from the specified path.
             * Events spawned by a broadcast do not bubble except for the one that is triggered
             * on the specified broadcast path. It is necessary for delegates to react to
             * broadcasts.
             * @param {$data.Path} [broadcastPath] Target root for broadcast.
             * @returns {$event.Event}
             */
            broadcastSync: function (broadcastPath) {
                $assertion.isPathOptional(broadcastPath, "Invalid broadcast path");

                // defaulting to current path in case broadcast path was omitted
                broadcastPath = broadcastPath || this.currentPath;

                var mainEvent = this._spawnMainBroadcastEvent(broadcastPath),
                    broadcastEvents = this.eventSpace
                        // obtaining subscribed paths relative to broadcast path
                        .getPathsRelativeTo(this.eventName, broadcastPath)
                        // spawning an event for each subscribed path
                        .passEachItemTo(this._spawnBroadcastEvent, this, 1, broadcastPath)
                        .asType($event.EventCollection)
                        // adding main event
                        .setItem('main', mainEvent);

                // triggering all affected events
                broadcastEvents
                    .setSender(this.sender)
                    .setPayloadItems(this.payload)
                    .setOriginalEvent(this.originalEvent)
                    .triggerSync();

                return this;
            }
        });
});

(function () {
    "use strict";

    $assertion.addTypes(/** @lends $event */{
        /** @param {$event.Event} expr */
        isEvent: function (expr) {
            return $event.Event.isBaseOf(expr);
        },

        /** @param {$event.Event} expr */
        isEventOptional: function (expr) {
            return typeof expr === 'undefined' ||
                $event.Event.isBaseOf(expr);
        }
    });
}());

$oop.postpone($event, 'EventCollection', function () {
    "use strict";

    /**
     * @name $event.EventCollection.create
     * @function
     * @param {object} [items] Initial contents.
     * @returns {$event.EventCollection}
     */

    /**
     * @name $event.EventCollection#eventName
     * @ignore
     */

    /**
     * @name $event.EventCollection#eventSpace
     * @ignore
     */

    /**
     * @name $event.EventCollection#canBubble
     * @ignore
     */

    /**
     * @name $event.EventCollection#payload
     * @ignore
     */

    /**
     * @name $event.EventCollection#currentPath
     * @ignore
     */

    /**
     * @name $event.EventCollection#originalPath
     * @ignore
     */

    /**
     * @name $event.EventCollection#broadcastPath
     * @ignore
     */

    /**
     * @class $event.EventCollection
     * @extends $data.Collection
     * @extends $event.Event
     */
    $event.EventCollection = $data.Collection.of($event.Event);
});

$oop.postpone($event, 'EventSpace', function () {
    "use strict";

    var base = $oop.Base,
        self = base.extend();

    /**
     * Instantiates an EventSpace.
     * @name $event.EventSpace.create
     * @function
     * @returns {$event.EventSpace}
     */

    /**
     * Events traverse within a confined event space.
     * @class
     * @extends $oop.Base
     * @extends $event.EventSpawner
     * @extends $event.EventTarget
     */
    $event.EventSpace = self
        .addPrivateMethods(/** @lends $event.EventSpace */{
            /**
             * Generates a stub for event handlers. (An empty array)
             * @returns {Array}
             * @private
             */
            _generateHandlersStub: function () {
                return [];
            },

            /**
             * Prepares spawned event for triggering.
             * @param {$event.Event} event
             * @private
             */
            _prepareEvent: function (event) {
                var nextPayloadItems = $event.nextPayloadStore.getPayload(event.eventName),
                    nextOriginalEvent = $event.originalEventStack.getLastEvent();

                if (nextPayloadItems) {
                    // applying next payload on spawned event
                    event.setPayloadItems(nextPayloadItems);
                }

                if (nextOriginalEvent) {
                    // setting next original event on spawned event
                    event.setOriginalEvent(nextOriginalEvent);
                }
            }
        })
        .addMethods(/** @lends $event.EventSpace# */{
            /** @ignore */
            init: function () {
                /**
                 * Lookup for subscribed event handlers. Indexed by event name, then event path (stringified), then handler index.
                 * @type {$data.Tree}
                 * @constant
                 * TODO: Rename to subscriptionRegistry. Breaking.
                 */
                this.eventRegistry = $data.Tree.create();
            },

            /**
             * @param {string} eventName
             * @returns {$event.Event}
             */
            spawnEvent: function (eventName) {
                var event = $event.Event.create(eventName, this);
                this._prepareEvent(event);
                return event;
            },

            /**
             * Subscribes to event.
             * TODO: Switch eventPath / eventName arguments. Breaking.
             * @param {string} eventName Name of event to be triggered.
             * @param {$data.Path} eventPath Path we're listening to
             * @param {function} handler Event handler function that is called when the event
             * is triggered on (or bubbles to) the specified path.
             * @returns {$event.EventSpace}
             */
            subscribeTo: function (eventName, eventPath, handler) {
                $assertion.isFunction(handler, "Invalid event handler function");

                var eventRegistry = this.eventRegistry,
                    eventPathString = eventPath.toString(),
                    handlers = eventRegistry.getOrSetNode(
                        [eventPathString, eventName].toPath(),
                        this._generateHandlersStub);

                // adding handler to handlers
                handlers.push(handler);

                return this;
            },

            /**
             * Unsubscribes from event. Removes entries associated with subscription
             * from event registry, both from the list of handlers and the list of
             * subscribed paths.
             * TODO: Switch eventPath / eventName arguments. Breaking.
             * TODO: Consider changing unsetKey to unsetPath. Measure performance impact.
             * @param {string} [eventName] Name of event to be triggered.
             * @param {$data.Path} [eventPath] Path we're listening to
             * @param {function} [handler] Event handler function
             * @returns {$event.EventSpace}
             */
            unsubscribeFrom: function (eventName, eventPath, handler) {
                $assertion.isFunctionOptional(handler, "Invalid event handler function");

                var eventRegistry = this.eventRegistry,
                    handlers,
                    handlerIndex;

                if (eventPath) {
                    if (eventName) {
                        if (handler) {
                            handlers = eventRegistry.getNode([eventPath, eventName].toPath());
                            if (handlers) {
                                // there are subscriptions on event/path
                                if (handlers.length > 1) {
                                    handlerIndex = handlers.indexOf(handler);
                                    if (handlerIndex > -1) {
                                        // specified handler is subscribed
                                        handlers.splice(handlerIndex, 1);
                                    }
                                } else {
                                    // removing last handler
                                    eventRegistry.unsetKey([eventPath, eventName].toPath());
                                }
                            }
                        } else {
                            // removing all handlers
                            eventRegistry.unsetKey([eventPath, eventName].toPath());
                        }
                    } else {
                        // removing all handlers for specified path
                        eventRegistry.unsetKey([eventPath].toPath());
                    }
                } else {
                    // removing all event bindings
                    this.eventRegistry.clear();
                }

                return this;
            },

            /**
             * Subscribes to event and unsubscribes after first trigger.
             * @param {string} eventName Name of event to be triggered.
             * @param {$data.Path} eventPath Path we're listening to
             * @param {function} handler Event handler function that is called when the event
             * is triggered on (or bubbles to) the specified path.
             * @returns {function} Event handler actually subscribed. Use this for unsubscribing.
             */
            subscribeToUntilTriggered: function (eventName, eventPath, handler) {
                /**
                 * Handler wrapper for events that automatically unsubscribe
                 * after the first trigger.
                 * @param {$event.Event} event
                 * @param {*} data
                 * @returns {*} Whatever the user-defined handler returns (possibly a `false`)
                 */
                function oneHandler(event, data) {
                    /*jshint validthis: true */
                    handler.call(this, event, data);
                    return event.eventSpace.unsubscribeFrom(event.eventName, event.currentPath, oneHandler);
                }

                // subscribing delegate handler to capturing path
                this.subscribeTo(eventName, eventPath, oneHandler);

                return oneHandler;
            },

            /**
             * Delegates event capturing to a path closer to the root.
             * Handlers subscribed this way CANNOT be unsubscribed individually.
             * @param {string} eventName
             * @param {$data.Path} capturePath Path where the event will actually subscribe
             * @param {$data.Path} delegatePath Path we're listening to. (Could be derived, eg. Query)
             * @param {function} handler Event handler function
             * @returns {function} Event handler actually subscribed. Use this for unsubscribing.
             */
            delegateSubscriptionTo: function (eventName, capturePath, delegatePath, handler) {
                $assertion
                    .assert(delegatePath.isRelativeTo(capturePath), "Delegate path is not relative to capture path")
                    .isFunction(handler, "Invalid event handler function");

                /**
                 * Handler wrapper for subscribing delegates
                 * @param {$event.Event} event Event object passed down by the triggering process
                 * @param {*} data Custom event data
                 * @returns {*} Whatever the user-defined handler returns (possibly a `false`)
                 */
                function delegateHandler(event, data) {
                    /*jshint validthis: true */
                    var originalPath = event.originalPath,
                        broadcastPath = event.broadcastPath;

                    if (delegatePath.isRootOf(originalPath) ||
                        broadcastPath && delegatePath.isRelativeTo(broadcastPath)
                        ) {
                        // triggering handler and passing forged current path set to delegatePath
                        return handler.call(this, event.clone(delegatePath), data);
                    }
                }

                // subscribing delegate handler to capturing path
                this.subscribeTo(eventName, capturePath, delegateHandler);

                return delegateHandler;
            },

            /**
             * Calls handlers associated with an event name and path.
             * Handlers are assumed to be synchronous.
             * @param {$event.Event} event
             * @returns {number|boolean} Number of handlers processed, or false when one handler returned false.
             * @see $event.Event#triggerSync
             */
            callHandlers: function (event) {
                var handlersPath = [event.currentPath.toString(), event.eventName].toPath(),
                    handlers = this.eventRegistry.getNode(handlersPath),
                    handlerCount,
                    i = 0, link, unlink, handler, result;

                if (handlers && handlers.length) {
                    // making local copy of handlers
                    // in case any of these handlers end up modifying the subscription registry
                    handlers = handlers.concat();
                    handlerCount = handlers.length;

                    for (; i < handlerCount; i++) {
                        handler = handlers[i];

                        // pushing original event
                        link = $event.pushOriginalEvent(event);

                        // calling handler, passing event and payload
                        // TODO: Do not pass payload.
                        result = handler.call(this, event, event.payload);

                        if (result && typeof result.then === 'function') {
                            // handler returned a thenable
                            unlink = link.unlink.bind(link);
                            result.then(unlink, unlink);
                        } else {
                            // handler returned non-thenable
                            // unlinking immediately
                            link.unlink();
                        }

                        if (result === false) {
                            // stopping iteration when handler returns false
                            // TODO: Add .stopPropagation() API to event.
                            return false;
                        }
                    }
                }

                return i;
            },

            /**
             * Retrieves subscribed paths that are relative to the specified path.
             * @param {string} eventName
             * @param {$data.Path} path
             * @returns {$event.PathCollection} Collection of paths relative to (not including) `path`
             * Question is which lib/class should delegate the method.
             */
            getPathsRelativeTo: function (eventName, path) {
                // obtaining all paths associated with event name
                var pathsQuery = ['{|}'.toKVP(), eventName].toQuery(),
                    paths = this.eventRegistry
                        .queryKeysAsHash(pathsQuery)
                        .toOrderedStringList();

                if (paths) {
                    // there are subscriptions matching eventName
                    return /** @type $event.PathCollection */paths
                        // querying collection of strings that are relative to `path`
                        .getRangeByPrefixAsHash(path.toString(), true)
                        .toStringCollection()
                        // converting them to a collection of paths
                        .toPathOrQuery().asType($event.PathCollection);
                } else {
                    // no subscriptions match eventName
                    // returning empty path collection
                    return $event.PathCollection.create([]);
                }
            }
        });
});

(function () {
    "use strict";

    $assertion.addTypes(/** @lends $event */{
        isEventSpace: function (expr) {
            return $event.EventSpace.isPrototypeOf(expr);
        },

        isEventSpaceOptional: function (expr) {
            return typeof expr === 'undefined' ||
                $event.EventSpace.isPrototypeOf(expr);
        }
    });
}());

$oop.postpone($event, 'Evented', function () {
    "use strict";

    var base = $oop.Base,
        self = base.extend();

    /**
     * Trait.
     * Classes with this trait may trigger and capture
     * events on a specified event space directly.
     * @class
     * @extends $oop.Base
     * @extends $event.EventSpawner
     * @extends $event.EventSource
     * @extends $event.EventTarget
     */
    $event.Evented = self
        .addPrivateMethods(/** @lends $event.Evented# */{
            /**
             * @param {$data.Dictionary} dictionary
             * @returns {Array}
             * @private
             */
            _flattenDictionary: function (dictionary) {
                var result = [],
                    items = dictionary.items,
                    keys = Object.keys(items),
                    i, key, values,
                    j;

                for (i = 0; i < keys.length; i++) {
                    key = keys[i];
                    values = items[key];

                    if (values instanceof Array) {
                        for (j = 0; j < values.length; j++) {
                            result.push([key, values[j]]);
                        }
                    } else {
                        result.push([key, values]);
                    }
                }

                return result;
            },

            /**
             * @param {$data.Path} oldEventPath
             * @param {$data.Path} newEventPath
             * @private
             */
            _reSubscribe: function (oldEventPath, newEventPath) {
                var that = this;
                this._flattenDictionary(this.subscriptionRegistry)
                    .toCollection()
                    .forEachItem(function (keyValuePair) {
                        var eventName = keyValuePair[0],
                            handler = keyValuePair[1];
                        that.eventSpace
                            .unsubscribeFrom(eventName, oldEventPath, handler)
                            .subscribeTo(eventName, newEventPath, handler);
                    });
            }
        })
        .addMethods(/** @lends $event.Evented# */{
            /** @ignore */
            init: function () {
                /**
                 * Stores event name - handler associations for the current evented instance.
                 * @type {$data.Dictionary}
                 */
                this.subscriptionRegistry = undefined;
            },

            /**
             * Spawns an event in the current event space, prepared with the current event path
             * as the target path. Returned event may be triggered without specifying a target path.
             * Current eventSpace and eventPath properties must not be undefined.
             * @param {string} eventName
             * @returns {$event.Event}
             */
            spawnEvent: function (eventName) {
                return this.eventSpace.spawnEvent(eventName)
                    .setSender(this)
                    .setTargetPath(this.eventPath);
            },

            /**
             * Sets event space on current class or instance.
             * @param {$event.EventSpace} eventSpace
             * @returns {$event.Evented}
             * @memberOf {$event.Evented}
             */
            setEventSpace: function (eventSpace) {
                $assertion.isEventSpace(eventSpace, "Invalid event space");
                this.eventSpace = eventSpace;
                return this;
            },

            /**
             * Sets event path for the current class or instance.
             * @param {$data.Path} eventPath
             * @returns {$event.Evented}
             * @memberOf {$event.Evented}
             */
            setEventPath: function (eventPath) {
                var baseEventPath = this.getBase().eventPath,
                    subscriptionRegistry = this.subscriptionRegistry;

                $assertion
                    .isPath(eventPath, "Invalid event path")
                    .assert(
                        !baseEventPath || eventPath.isRelativeTo(baseEventPath),
                        "Specified event path is not relative to static event path");

                if (!subscriptionRegistry) {
                    // initializing subscription registry
                    this.subscriptionRegistry = $data.Dictionary.create();
                } else if (subscriptionRegistry.getKeyCount()) {
                    // re-subscribing events
                    this._reSubscribe(this.eventPath, eventPath);
                }

                // storing new event path
                this.eventPath = eventPath;

                return this;
            },

            /**
             * Subscribes to event.
             * @param {string} eventName Name of event to be triggered.
             * @param {function} handler Event handler function that is called when the event
             * is triggered on (or bubbles to) the specified path.
             * @returns {$event.Evented}
             */
            subscribeTo: function (eventName, handler) {
                this.eventSpace.subscribeTo(eventName, this.eventPath, handler);
                this.subscriptionRegistry.addItem(eventName, handler);
                return this;
            },

            /**
             * Unsubscribes from event.
             * @param {string} [eventName] Name of event to be triggered.
             * @param {function} [handler] Event handler function
             * @returns {$event.Evented}
             */
            unsubscribeFrom: function (eventName, handler) {
                this.eventSpace.unsubscribeFrom(eventName, this.eventPath, handler);

                if (eventName) {
                    this.subscriptionRegistry.removeItem(eventName, handler);
                } else {
                    this.subscriptionRegistry.clear();
                }

                return this;
            },

            /**
             * Subscribes to event and unsubscribes after first trigger.
             * @param {string} eventName Name of event to be triggered.
             * @param {function} handler Event handler function that is called when the event
             * is triggered on (or bubbles to) the specified path.
             * @returns {$event.Evented}
             */
            subscribeToUntilTriggered: function (eventName, handler) {
                var oneHandler = this.eventSpace.subscribeToUntilTriggered(eventName, this.eventPath, handler);
                this.subscriptionRegistry.addItem(eventName, oneHandler);
                return this;
            },

            /**
             * Delegates event capturing to a path closer to the root.
             * Handlers subscribed this way CANNOT be unsubscribed individually.
             * @param {string} eventName
             * @param {$data.Path} delegatePath Path we're listening to. (Could be derived, eg. Query)
             * @param {function} handler Event handler function
             * @returns {$event.Evented}
             */
            delegateSubscriptionTo: function (eventName, delegatePath, handler) {
                var delegateHandler = this.eventSpace.delegateSubscriptionTo(eventName, this.eventPath, delegatePath, handler);
                this.subscriptionRegistry.addItem(eventName, delegateHandler);
                return this;
            },

            /**
             * Shorthand for **triggering** an event in the event space
             * associated with the instance / class.
             * @param {string} eventName
             * @returns {$event.Evented}
             */
            triggerSync: function (eventName) {
                this.spawnEvent(eventName)
                    .triggerSync(this.eventPath);
                return this;
            },

            /**
             * Shorthand for **broadcasting** an event in the event space
             * associated with the instance / class.
             * @param {string} eventName
             * @returns {$event.Evented}
             */
            broadcastSync: function (eventName) {
                this.spawnEvent(eventName)
                    .broadcastSync(this.eventPath);
                return this;
            }
        });
});

$oop.postpone($event, 'EventStack', function () {
    "use strict";

    var base = $oop.Base,
        self = base.extend();

    /**
     * Creates an EventStack instance.
     * @name $event.EventStack.create
     * @function
     * @returns {$event.EventStack}
     */

    /**
     * Stores events in a quasi-stack structure.
     * @class
     * @extends $oop.Base
     */
    $event.EventStack = self
        .addMethods(/** @lends $event.EventStack# */{
            /**
             * @ignore
             */
            init: function () {
                /**
                 * Chain structure serving as the buffer for events.
                 * @type {$data.OpenChain}
                 */
                this.events = $data.OpenChain.create();
            },

            /**
             * Adds an event to the stack. To remove the event from the stack, call .unlink() on the returned $data.ValueLink instance.
             * @param {$event.Event|*} event
             * @returns {$data.ValueLink}
             */
            pushEvent: function (event) {
                var link = $data.ValueLink.create().setValue(event);
                this.events.pushLink(link);
                return link;
            },

            /**
             * Retrieves the last event added to the stack.
             * @returns {$event.Event|*}
             */
            getLastEvent: function () {
                return this.events.lastLink.previousLink.value;
            }
        });
});

$oop.postpone($event, 'PayloadStore', function () {
    "use strict";

    var base = $oop.Base,
        self = base.extend();

    /**
     * @name $event.PayloadStore.create
     * @function
     * @returns {$event.PayloadStore}
     */

    /**
     * Stores event payload items indexed by event name and item name.
     * @class
     * @extends $oop.Base
     */
    $event.PayloadStore = self
        .addMethods(/** @lends $event.PayloadStore# */{
            /** @ignore */
            init: function () {
                /**
                 * @type {$data.Tree}
                 */
                this.payloads = $data.Tree.create();
            },

            /**
             * Associates a payload item with an event name.
             * Subsequent events by the specified name will carry the specified payload item.
             * @param {string} eventName
             * @param {string} payloadItemName
             * @param {*} payloadItemValue
             */
            setPayloadItem: function (eventName, payloadItemName, payloadItemValue) {
                this.payloads.setNode([eventName, payloadItemName].toPath(), payloadItemValue);
                return this;
            },

            /**
             * Associates multiple payload items with an event name.
             * @param {string} eventName
             * @param {object} payload
             */
            setPayloadItems: function (eventName, payload) {
                var payloads = this.payloads,
                    payloadItemNames = Object.keys(payload),
                    i, payloadItemName;

                for (i = 0; i < payloadItemNames.length; i++) {
                    payloadItemName = payloadItemNames[i];
                    payloads.setNode([eventName, payloadItemName].toPath(), payload[payloadItemName]);
                }

                return this;
            },

            /**
             * Dissociates a payload item from an event name.
             * @param {string} eventName
             * @param {string} payloadItemName
             */
            deletePayloadItem: function (eventName, payloadItemName) {
                this.payloads.unsetKey([eventName, payloadItemName].toPath());
                return this;
            },

            /**
             * Dissociates multiple payload items from an event name.
             * Pass item names following the first argument.
             * @param {string} eventName
             */
            deletePayloadItems: function (eventName) {
                var payloads = this.payloads,
                    i, payloadItemName;

                for (i = 1; i < arguments.length; i++) {
                    payloadItemName = arguments[i];
                    payloads.unsetKey([eventName, payloadItemName].toPath());
                }

                return this;
            },

            /**
             * @param {string} eventName
             * @returns {object}
             */
            getPayload: function (eventName) {
                return this.payloads.items[eventName];
            }
        });
});

$oop.postpone($event, 'originalEventStack', function () {
    "use strict";

    /**
     * Global stack for original events.
     * @type {Array}
     */
    $event.originalEventStack = $event.EventStack.create();
});

$oop.postpone($event, 'pushOriginalEvent', function () {
    "use strict";

    /**
     * Adds an original event to the stack.
     * @param {$event.Event|*} originalEvent
     * @returns {$data.ValueLink}
     */
    $event.pushOriginalEvent = function (originalEvent) {
        return $event.originalEventStack.pushEvent(originalEvent);
    };
});

$oop.postpone($event, 'nextPayloadStore', function () {
    "use strict";

    /**
     * Temporary storage for event payload.
     * @type {$event.PayloadStore}
     */
    $event.nextPayloadStore = $event.PayloadStore.create();
});

$oop.postpone($event, 'setNextPayloadItem', function () {
    "use strict";

    /**
     * Associates a payload item with an event name.
     * Subsequent events by the specified name will carry the specified payload item.
     * @param {string} eventName
     * @param {string} payloadItemName
     * @param {*} payloadItemValue
     */
    $event.setNextPayloadItem = function (eventName, payloadItemName, payloadItemValue) {
        $event.nextPayloadStore.setPayloadItem(eventName, payloadItemName, payloadItemValue);
    };
});

$oop.postpone($event, 'setNextPayloadItems', function () {
    "use strict";

    /**
     * Associates multiple payload items with an event name.
     * @param {string} eventName
     * @param {object} payload
     */
    $event.setNextPayloadItems = function (eventName, payload) {
        $event.nextPayloadStore.setPayloadItems(eventName, payload);
    };
});

$oop.postpone($event, 'deleteNextPayloadItem', function () {
    "use strict";

    /**
     * Dissociates a payload item from an event name.
     * @param {string} eventName
     * @param {string} payloadItemName
     */
    $event.deleteNextPayloadItem = function (eventName, payloadItemName) {
        $event.nextPayloadStore.deletePayloadItem(eventName, payloadItemName);
    };
});

$oop.postpone($event, 'deleteNextPayloadItems', function () {
    "use strict";

    /**
     * Dissociates multiple payload items from an event name.
     * Pass item names following the first argument.
     * @param {string} eventName
     */
    $event.deleteNextPayloadItems = function (eventName) {
        var nextPayloadStore = $event.nextPayloadStore;
        nextPayloadStore.deletePayloadItems.apply(nextPayloadStore, arguments);
    };
});

$oop.postpone($event, 'eventSpace', function () {
    "use strict";

    /**
     * Global, shared event space.
     * @type {$event.EventSpace}
     */
    $event.eventSpace = $event.EventSpace.create();
});

/*jshint node:true */
if (typeof module === 'object') {
    module.exports = $event;
}

/*jshint node:true */

/** @namespace */
var $commonWidgets = {};

/** @namespace */
var $assertion = $assertion || require('giant-assertion');

/** @namespace */
var $oop = $oop || require('giant-oop');

/** @namespace */
var $utils = $utils || require('giant-utils');

/** @namespace */
var $data = $data || require('giant-data');

/** @namespace */
var $event = $event || require('giant-event');

/** @namespace */
var $entity = $entity || require('giant-entity');

/** @namespace */
var $templating = $templating || require('giant-templating');

/** @namespace */
var $widget = $widget || require('giant-widget');

/**
 * Whether to poll input values at a regular interval.
 * Set to true when change/input events do not get fired on form autofill, etc.
 * @type {boolean}
 */
$commonWidgets.pollInputValues = false;

/**
 * @function
 * @see http://api.jquery.com
 */
var jQuery = jQuery || require('jquery');

if (typeof window === 'undefined') {
    /**
     * Built-in global window object.
     * @type {Window}
     */
    window = undefined;
}

if (typeof document === 'undefined') {
    /**
     * Built-in global document object.
     * @type {Document}
     */
    document = undefined;
}

/**
 * Native number class.
 * @name Number
 * @class
 */

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
 * @name $data.Hash
 * @class
 */

$oop.postpone($commonWidgets, 'BinaryState', function () {
    "use strict";

    var base = $oop.Base,
        self = base.extend();

    /**
     * Creates a BinaryState instance.
     * @name $commonWidgets.BinaryState.create
     * @function
     * @param {string} stateName Identifies the binary state.
     * @returns {$commonWidgets.BinaryState}
     * @see String#toBinaryState
     */

    /**
     * The BinaryState implements a named state that can take two values: true or false,
     * but which value depends on the number of sources contributing the state.
     * The value is false when no source contributes the state, true otherwise.
     * TODO: Remove .addStateAsSource.
     * @class
     * @extends $oop.Base
     */
    $commonWidgets.BinaryState = self
        .addMethods(/** @lends $commonWidgets.BinaryState# */{
            /**
             * @param {string} stateName
             * @ignore
             */
            init: function (stateName) {
                $assertion.isString(stateName, "Invalid state name");

                /**
                 * Name of the state. Eg. "expandable".
                 * @type {string}
                 */
                this.stateName = stateName;

                /**
                 * Lookup of source identifiers contributing the state.
                 * @type {$data.Collection}
                 */
                this.stateSources = $data.Collection.create();

                /**
                 * Whether state can cascade, ie. be influenced by other states.
                 * @type {boolean}
                 */
                this.isCascading = false;
            },

            /**
             * @param {boolean} isCascading
             * @returns {$commonWidgets.BinaryState}
             */
            setIsCascading: function (isCascading) {
                this.isCascading = isCascading;
                return this;
            },

            /**
             * Adds the specified source to the state.
             * @param {string} sourceId Identifies the contributing source.
             * @returns {$commonWidgets.BinaryState}
             */
            addSource: function (sourceId) {
                this.stateSources.setItem(sourceId, true);
                return this;
            },

            /**
             * Removes the specified source.
             * @param {string} [sourceId] Identifies the contributing source.
             * @returns {$commonWidgets.BinaryState}
             */
            removeSource: function (sourceId) {
                if (typeof sourceId === 'string') {
                    this.stateSources.deleteItem(sourceId);
                } else {
                    this.stateSources.clear();
                }
                return this;
            },

            /**
             * Tells whether the specified state contributes to the state.
             * @param {string} sourceId
             * @returns {boolean}
             */
            hasSource: function (sourceId) {
                return this.stateSources.getItem(sourceId);
            },

            /**
             * Retrieves the identifiers of all contributing sources.
             * @returns {string[]}
             */
            getSourceIds: function () {
                return this.stateSources.getKeys();
            },

            /**
             * Determines the number of contributing sources.
             * @returns {number}
             */
            getSourceCount: function () {
                return this.stateSources.getKeyCount();
            },

            /**
             * Determines whether the state value is true, ie. there is at leas one source
             * contributing.
             * @returns {boolean}
             */
            isStateOn: function () {
                return this.stateSources.getKeyCount() > 0;
            },

            /**
             * Adds another state as contributing source.
             * Takes effect only if state is cascading.
             * TODO: Remove, and place logic in classes that use BinaryState.
             * @param {$commonWidgets.BinaryState} binaryState
             * @param {string} sourceId
             * @returns {$commonWidgets.BinaryState}
             */
            addStateAsSource: function (binaryState, sourceId) {
                $assertion.isBinaryState(binaryState, "Invalid binary state");
                if (this.isCascading && binaryState.isStateOn()) {
                    this.addSource(sourceId);
                }
                return this;
            }
        });
});

(function () {
    "use strict";

    $assertion.addTypes(/** @lends $commonWidgets */{
        /** @param {$commonWidgets.BinaryState} expr */
        isBinaryState: function (expr) {
            return $commonWidgets.BinaryState.isBaseOf(expr);
        },

        /** @param {$commonWidgets.BinaryState} [expr] */
        isBinaryStateOptional: function (expr) {
            return typeof expr === 'undefined' ||
                $commonWidgets.BinaryState.isBaseOf(expr);
        }
    });

    $oop.extendBuiltIn(String.prototype, /** @lends String# */{
        /**
         * @returns {$commonWidgets.BinaryState}
         */
        toBinaryState: function () {
            return $commonWidgets.BinaryState.create(this.valueOf());
        }
    });
}());

$oop.postpone($commonWidgets, 'DocumentBody', function () {
    "use strict";

    var base = $oop.Base,
        self = base.extend()
            .addTraitAndExtend($widget.Renderable);

    /**
     * @name $commonWidgets.DocumentBody.create
     * @function
     * @returns {$commonWidgets.DocumentBody}
     */

    /**
     * @class
     * @extends $oop.Base
     * @extends $widget.Renderable
     */
    $commonWidgets.DocumentBody = self
        .setInstanceMapper(function () {
            return 'singleton';
        })
        .addPrivateMethods(/** @lends $commonWidgets.DocumentBody# */{
            /**
             * @returns {HTMLElement}
             * @private
             */
            _getBodyElementProxy: function () {
                return document && document.body;
            }
        })
        .addMethods(/** @lends $commonWidgets.DocumentBody# */{
            /** @ignore */
            init: function () {
                $widget.Renderable.init.call(this);
                this.setTagName('body');

                /**
                 * @type {string}
                 * @private
                 */
                this._contentMarkup = '';
            },

            /**
             * @param {string} contentMarkup
             * @returns {$commonWidgets.DocumentBody}
             */
            setContentMarkup: function (contentMarkup) {
                this._contentMarkup = contentMarkup;
                return this;
            },

            /**
             * Fetches body element from document.
             * @returns {HTMLElement}
             */
            getElement: function () {
                return this._getBodyElementProxy();
            },

            /**
             * @returns {string}
             */
            contentMarkup: function () {
                return this._contentMarkup;
            }
        });
});

$oop.postpone($commonWidgets, 'BinaryStateful', function () {
    "use strict";

    var base = $oop.Base,
        self = base.extend();

    /**
     * The BinaryStateful trait manages multiple binary states with multiple contributing sources.
     * @class
     * @extends $oop.Base
     * @extends $widget.Widget
     * @see $commonWidgets.BinaryState
     */
    $commonWidgets.BinaryStateful = self
        .addConstants(/** @lends $commonWidgets.BinaryStateful */{
            /**
             * Identifier for imposed source.
             * @constant
             */
            SOURCE_ID_IMPOSED: 'imposed'
        })
        .addMethods(/** @lends $commonWidgets.BinaryStateful# */{
            /**
             * Call from host's init.
             */
            init: function () {
                /**
                 * Holds a collection of BinaryState instances for each binary state.
                 * @type {$data.Collection}
                 */
                this.binaryStates = $data.Collection.create();
            },

            /**
             * Call from host's .afterAdd
             */
            afterAdd: function () {
                var that = this;

                this.binaryStates
                    .forEachItem(function (sources, stateName) {
                        // checking whether any of the parents have matching states set
                        that.applyImposedStateSource(stateName);

                        // initializing binary state
                        if (that.isStateOn(stateName)) {
                            that.afterStateOn(stateName);
                        } else {
                            that.afterStateOff(stateName);
                        }
                    });
            },

            /**
             * Call from host's .afterRemove
             */
            afterRemove: function () {
                var that = this;

                // removing all parent imposed sources from all states
                this.binaryStates
                    .forEachItem(function (binaryState, stateName) {
                        binaryState.stateSources
                            // fetching imposed source IDs
                            .filterByPrefix(self.SOURCE_ID_IMPOSED)
                            .getKeysAsHash()
                            .toCollection()

                            // removing them from current stateful instance
                            .passEachItemTo(that.removeBinaryStateSource, that, 1, stateName);
                    });
            },

            /**
             * Adds a state to the instance. A state must be added before it can be manipulated.
             * TODO: Add test for isCascading argument.
             * @param {string} stateName Identifies the state.
             * @param {boolean} [isCascading=false] Whether new state is cascading.
             * @returns {$commonWidgets.BinaryStateful}
             */
            addBinaryState: function (stateName, isCascading) {
                var binaryStateLayers = this.binaryStates;
                if (!binaryStateLayers.getItem(stateName)) {
                    binaryStateLayers.setItem(
                        stateName,
                        stateName.toBinaryState()
                            .setIsCascading(isCascading));
                }
                return this;
            },

            /**
             * @param {string} stateName
             * @returns {$commonWidgets.BinaryState}
             */
            getBinaryState: function (stateName) {
                return this.binaryStates.getItem(stateName);
            },

            /**
             * Determines whether the specified state evaluates to true.
             * @param {string} stateName Identifies state.
             * @returns {boolean}
             */
            isStateOn: function (stateName) {
                return this.binaryStates.getItem(stateName).isStateOn();
            },

            /**
             * Adds the specified contributing source to the specified state.
             * @param {string} stateName Identifies state.
             * @param {string} sourceId Identifies source.
             * @returns {$commonWidgets.BinaryStateful}
             */
            addBinaryStateSource: function (stateName, sourceId) {
                var state = this.getBinaryState(stateName),
                    sourceCountBefore = state.getSourceCount(),
                    sourceCountAfter;

                // adding source to self
                state.addSource(sourceId);
                sourceCountAfter = state.getSourceCount();

                if (sourceCountAfter && !sourceCountBefore) {
                    // state just switched to "on"

                    // adding source to suitable descendants
                    this.getAllDescendants()
                        .filterBySelector(function (/**$commonWidgets.BinaryStateful*/descendant) {
                            var state = descendant.binaryStates && descendant.getBinaryState(stateName);
                            return state && state.isCascading;
                        })
                        .callOnEachItem('addImposedStateSource', stateName);

                    this.afterStateOn(stateName);
                }

                return this;
            },

            /**
             * Imposes a source on the specified state provided that that state allows cascading.
             * @param {string} stateName
             * @returns {$commonWidgets.BinaryStateful}
             */
            addImposedStateSource: function (stateName) {
                var state = this.getBinaryState(stateName),
                    sourceCountBefore = state.getSourceCount(),
                    sourceCountAfter;

                state.addSource(self.SOURCE_ID_IMPOSED);
                sourceCountAfter = state.getSourceCount();

                if (sourceCountAfter && !sourceCountBefore) {
                    // state just switched to "on"
                    this.afterStateOn(stateName);
                }

                return this;
            },

            /**
             * Applies sources imposed by parents on the current instance.
             * @param {string} stateName Identifies state to add imposed sources to.
             * @returns {$commonWidgets.BinaryStateful}
             */
            applyImposedStateSource: function (stateName) {
                // querying nearest parent for matching state
                var parent = this.getAncestor(function (statefulInstance) {
                    var binaryStates = statefulInstance.binaryStates;
                    return binaryStates && statefulInstance.getBinaryState(stateName);
                });

                if (parent && parent.isStateOn(stateName)) {
                    this.addImposedStateSource(stateName);
                }

                return this;
            },

            /**
             * Removes the specified source from the specified state.
             * @param {string} stateName Identifies state.
             * @param {string} [sourceId] Identifies source. When omitted, all sources will be
             * removed.
             * @returns {$commonWidgets.BinaryStateful}
             */
            removeBinaryStateSource: function (stateName, sourceId) {
                var state = this.getBinaryState(stateName),
                    sourceCountBefore = state.getSourceCount(),
                    sourceCountAfter;

                // adding source to self
                state.removeSource(sourceId);
                sourceCountAfter = state.getSourceCount();

                if (!sourceCountAfter && sourceCountBefore) {
                    // state just switched to "off"

                    // adding source to suitable descendants
                    this.getAllDescendants()
                        .filterBySelector(function (/**$commonWidgets.BinaryStateful*/descendant) {
                            var state = descendant.binaryStates && descendant.getBinaryState(stateName);
                            return state && state.isCascading;
                        })
                        .callOnEachItem('removeImposedStateSource', stateName);

                    this.afterStateOff(stateName);
                }

                return this;
            },

            /**
             * Removes contributing source imposed by the specified instance from the specified state.
             * @param {string} stateName
             * @returns {$commonWidgets.BinaryStateful}
             */
            removeImposedStateSource: function (stateName) {
                var state = this.getBinaryState(stateName),
                    sourceCountBefore = state.getSourceCount(),
                    sourceCountAfter;

                state.removeSource(self.SOURCE_ID_IMPOSED);
                sourceCountAfter = state.getSourceCount();

                if (!sourceCountAfter && sourceCountBefore) {
                    // state just switched to "off"
                    this.afterStateOff(stateName);
                }

                return this;
            },

            /**
             * Sets cascading flag on the specified state and updates imposed state on the current instance.
             * @param {string} stateName
             * @param {boolean} isCascading
             * @returns {$commonWidgets.BinaryStateful}
             */
            setIsCascading: function (stateName, isCascading) {
                var state = this.getBinaryState(stateName),
                    wasCascading = state.isCascading;

                if (isCascading && !wasCascading) {
                    // applying imposed source
                    this.applyImposedStateSource(stateName);
                } else if (!isCascading && wasCascading) {
                    // removing imposed source from this instance only
                    // (descendants might still be cascading)
                    this.removeImposedStateSource(stateName);
                }

                state.setIsCascading(isCascading);

                return this;
            }
        });

    /**
     * Called after the state value changes from false to true.
     * @name $commonWidgets.BinaryStateful#afterStateOn
     * @function
     * @param {string} stateName
     */

    /**
     * Called after the state value changes from true to false.
     * @name $commonWidgets.BinaryStateful#afterStateOff
     * @function
     * @param {string} stateName
     */
});

$oop.postpone($commonWidgets, 'Disableable', function () {
    "use strict";

    var base = $oop.Base,
        self = base.extend();

    /**
     * The Disableable trait endows Widget classes with an enabled - disabled state.
     * A Disableable may be disabled by multiple sources. All such sources have to
     * re-enable the host to be fully enabled again.
     * Expects to be added to Widget instances.
     * Expects the host to have the BinaryStateful trait applied.
     * @class
     * @extends $oop.Base
     * @extends $commonWidgets.BinaryStateful
     * @extends $widget.Widget
     */
    $commonWidgets.Disableable = self
        .addConstants(/** @lends $commonWidgets.Disableable */{
            /** @constant */
            STATE_NAME_DISABLEBABLE: 'state-disableable'
        })
        .addPrivateMethods(/** @lends $commonWidgets.Disableable# */{
            /** @private */
            _updateEnabledStyle: function () {
                if (this.isDisabled()) {
                    this.removeCssClass('widget-enabled')
                        .addCssClass('widget-disabled');
                } else {
                    this.removeCssClass('widget-disabled')
                        .addCssClass('widget-enabled');
                }
            }
        })
        .addMethods(/** @lends $commonWidgets.Disableable# */{
            /** Call from host's .init. */
            init: function () {
                // disableable state is cascading
                this.addBinaryState(self.STATE_NAME_DISABLEBABLE, true);
            },

            /** Call from host's .afterStateOn */
            afterStateOn: function (stateName) {
                if (stateName === self.STATE_NAME_DISABLEBABLE) {
                    this._updateEnabledStyle();
                }
            },

            /** Call from host's .afterStateOff */
            afterStateOff: function (stateName) {
                if (stateName === self.STATE_NAME_DISABLEBABLE) {
                    this._updateEnabledStyle();
                }
            },

            /**
             * Disables the instance by the specified source.
             * @param {string} disablingSource
             * @returns {$commonWidgets.Disableable}
             */
            disableBy: function (disablingSource) {
                this.addBinaryStateSource(self.STATE_NAME_DISABLEBABLE, disablingSource);
                return this;
            },

            /**
             * Enables the instance by the specified source.
             * @param {string} disablingSource
             * @returns {$commonWidgets.Disableable}
             */
            enableBy: function (disablingSource) {
                this.removeBinaryStateSource(self.STATE_NAME_DISABLEBABLE, disablingSource);
                return this;
            },

            /**
             * Releases all disabling sources at once.
             * @returns {$commonWidgets.Disableable}
             */
            forceEnable: function () {
                this.removeBinaryStateSource(self.STATE_NAME_DISABLEBABLE);
                return this;
            },

            /**
             * Tells whether the current instance is currently disabled.
             * @returns {boolean}
             */
            isDisabled: function () {
                return this.isStateOn(self.STATE_NAME_DISABLEBABLE);
            }
        });
});

$oop.postpone($commonWidgets, 'Highlightable', function () {
    "use strict";

    var base = $oop.Base,
        self = base.extend();

    /**
     * The Highlightable trait adds switchable highlight to widgets.
     * Expects to be added to Widget instances.
     * Expects the host to have the BinaryStateful trait applied.
     * Overrides BinaryStateful's methods, must be added *after* BinaryStateful, and on a different
     * prototype level (using addTraitAndExtend()).
     * @class
     * @extends $oop.Base
     * @extends $commonWidgets.BinaryStateful
     * @extends $widget.Widget
     */
    $commonWidgets.Highlightable = self
        .addConstants(/** @lends $commonWidgets.Highlightable */{
            /** @constant */
            STATE_NAME_HIGHLIGHTABLE: 'state-highlightable'
        })
        .addPrivateMethods(/** @lends $commonWidgets.Highlightable# */{
            /**
             * TODO: Refactor to use Set.
             * @private
             */
            _updateHighlightedState: function () {
                // removing all previous highlights
                this.highlightIds
                    .passEachItemTo(this.removeCssClass, this);

                var highlightIds = this.getBinaryState(self.STATE_NAME_HIGHLIGHTABLE)
                    .getSourceIds()
                    .toCollection();

                // adding current highlights
                highlightIds.passEachItemTo(this.addCssClass, this);

                this.highlightIds = highlightIds;
            }
        })
        .addMethods(/** @lends $commonWidgets.Highlightable# */{
            /** Call from host's init. */
            init: function () {
                // highlightable state does not cascade
                this.addBinaryState(self.STATE_NAME_HIGHLIGHTABLE);

                /**
                 * Lookup of highlight identifiers currently assigned to the instance.
                 * @type {$data.Collection}
                 */
                this.highlightIds = $data.Collection.create();
            },

            /**
             * @param {string} stateName
             * @param {string} sourceId
             * @returns {$commonWidgets.Highlightable}
             */
            addBinaryStateSource: function (stateName, sourceId) {
                $commonWidgets.BinaryStateful.addBinaryStateSource.call(this, stateName, sourceId);
                if (stateName === self.STATE_NAME_HIGHLIGHTABLE) {
                    this._updateHighlightedState();
                }
                return this;
            },

            /**
             * @param {string} stateName
             * @returns {$commonWidgets.Highlightable}
             */
            addImposedStateSource: function (stateName) {
                $commonWidgets.BinaryStateful.addImposedStateSource.call(this, stateName);
                if (stateName === self.STATE_NAME_HIGHLIGHTABLE) {
                    this._updateHighlightedState();
                }
                return this;
            },

            /**
             * @param {string} stateName
             * @param {string} sourceId
             * @returns {$commonWidgets.Highlightable}
             */
            removeBinaryStateSource: function (stateName, sourceId) {
                $commonWidgets.BinaryStateful.removeBinaryStateSource.call(this, stateName, sourceId);
                if (stateName === self.STATE_NAME_HIGHLIGHTABLE) {
                    this._updateHighlightedState();
                }
                return this;
            },

            /**
             * @param {string} stateName
             * @returns {$commonWidgets.Highlightable}
             */
            removeImposedStateSource: function (stateName) {
                $commonWidgets.BinaryStateful.removeImposedStateSource.call(this, stateName);
                if (stateName === self.STATE_NAME_HIGHLIGHTABLE) {
                    this._updateHighlightedState();
                }
                return this;
            },

            /**
             * Dummy handler.
             * @param {string} stateName
             */
            afterStateOn: function (stateName) {
            },

            /**
             * Dummy handler.
             * @param {string} stateName
             */
            afterStateOff: function (stateName) {
            },

            /**
             * Marks widget as highlighted.
             * @param {string} [highlightId]
             * @returns {$commonWidgets.Highlightable}
             */
            highlightOn: function (highlightId) {
                $assertion.isStringOptional(highlightId, "Invalid highlight ID");
                this.addBinaryStateSource(
                    self.STATE_NAME_HIGHLIGHTABLE,
                    highlightId || 'highlighted');
                return this;
            },

            /**
             * Marks widget as non-highlighted.
             * @param {string} [highlightId]
             * @returns {$commonWidgets.Highlightable}
             */
            highlightOff: function (highlightId) {
                $assertion.isStringOptional(highlightId, "Invalid highlight ID");
                this.removeBinaryStateSource(
                    self.STATE_NAME_HIGHLIGHTABLE,
                    highlightId || 'highlighted');
                return this;
            },

            /**
             * Tells whether the widget is currently highlighted.
             * @param {string} [highlightId]
             * @returns {boolean}
             */
            isHighlighted: function (highlightId) {
                $assertion.isStringOptional(highlightId, "Invalid highlight ID");
                return highlightId ?
                       this.getBinaryState(self.STATE_NAME_HIGHLIGHTABLE)
                           .hasSource(highlightId) :
                       this.isStateOn(self.STATE_NAME_HIGHLIGHTABLE);
            }
        });
});

$oop.postpone($commonWidgets, 'Expandable', function () {
    "use strict";

    var base = $oop.Base,
        self = base.extend();

    /**
     * @class
     * @extends $oop.Base
     * @extends $commonWidgets.BinaryStateful
     * @extends $widget.Widget
     */
    $commonWidgets.Expandable = self
        .addConstants(/** @lends $commonWidgets.Expandable */{
            /** @constant */
            STATE_NAME_EXPANDABLE: 'state-expandable'
        })
        .addPrivateMethods(/** @lends $commonWidgets.Expandable# */{
            /** @private */
            _updateExpandedState: function () {
                if (this.isStateOn(self.STATE_NAME_EXPANDABLE)) {
                    this
                        .removeCssClass('widget-retracted')
                        .addCssClass('widget-expanded');
                } else {
                    this
                        .removeCssClass('widget-expanded')
                        .addCssClass('widget-retracted');
                }
            }
        })
        .addMethods(/** @lends $commonWidgets.Expandable# */{
            /** Call from host's init. */
            init: function () {
                // expansion is not cascading (by default)
                this.addBinaryState(self.STATE_NAME_EXPANDABLE);
            },

            /** @ignore */
            afterStateOn: function (stateName) {
                if (stateName === self.STATE_NAME_EXPANDABLE) {
                    this._updateExpandedState();
                    this.triggerSync($commonWidgets.EVENT_EXPANDABLE_EXPAND);
                }
            },

            /** @ignore */
            afterStateOff: function (stateName) {
                if (stateName === self.STATE_NAME_EXPANDABLE) {
                    this._updateExpandedState();
                    this.triggerSync($commonWidgets.EVENT_EXPANDABLE_RETRACT);
                }
            },

            /** @returns {$commonWidgets.Expandable} */
            expandWidget: function () {
                this.addBinaryStateSource(self.STATE_NAME_EXPANDABLE, 'default');
                return this;
            },

            /** @returns {$commonWidgets.Expandable} */
            contractWidget: function () {
                this.removeBinaryStateSource(self.STATE_NAME_EXPANDABLE, 'default');
                return this;
            },

            /** @returns {boolean} */
            isExpanded: function () {
                return this.isStateOn(self.STATE_NAME_EXPANDABLE);
            }
        });
});

(function () {
    "use strict";

    $oop.addGlobalConstants.call($commonWidgets, /** @lends $commonWidgets */{
        /**
         * Signals that an Expandable has expanded.
         * @constants
         */
        EVENT_EXPANDABLE_EXPAND: 'widget.expanded.on',

        /**
         * Signals that an Expandable has retracted.
         * @constants
         */
        EVENT_EXPANDABLE_RETRACT: 'widget.expanded.off'
    });
}());

$oop.postpone($commonWidgets, 'Editable', function () {
    "use strict";

    var base = $oop.Base,
        self = base.extend();

    /**
     * The Editable trait provides a simple way to manage state changes for widgets that may operate
     * in two modes: display mode, and edit mode, each mode implementing a different markup.
     * TODO: Refactor .editMarkup() and .displayMarkup() into .editTemplate and .displayTemplate.
     * @class
     * @extends $oop.Base
     * @extends $commonWidgets.BinaryStateful
     */
    $commonWidgets.Editable = self
        .addConstants(/** @lends $commonWidgets.Editable */{
            /** @constant */
            STATE_NAME_EDITABLE: 'state-editable'
        })
        .addPrivateMethods(/** @lends $commonWidgets.Editable# */{
            /** @private */
            _updateEditableState: function () {
                var eventName;

                // applying appropriate CSS classes
                if (this.isStateOn(self.STATE_NAME_EDITABLE)) {
                    eventName = $commonWidgets.EVENT_EDITABLE_EDIT_MODE;

                    this.removeCssClass('display-mode')
                        .addCssClass('edit-mode');
                } else {
                    eventName = $commonWidgets.EVENT_EDITABLE_DISPLAY_MODE;

                    this.removeCssClass('edit-mode')
                        .addCssClass('display-mode');
                }

                if (this.editMarkup || this.displayMarkup) {
                    // when host implements different markups for display and edit mode
                    // re-rendering appropriate content markup
                    this.reRenderContents();
                }

                // triggering event about state change
                this.spawnEvent(eventName)
                    .allowBubbling(false)
                    .triggerSync();
            }
        })
        .addMethods(/** @lends $commonWidgets.Editable# */{
            /** Call from host's .init */
            init: function () {
                // expansion is not cascading (by default)
                this.addBinaryState(self.STATE_NAME_EDITABLE);
            },

            /** Call from host's .afterAdd */
            afterAdd: function () {
                this._updateEditableState();
            },

            /**
             * Call from host's .contentMarkup, and implement .editMarkup and .displayMarkup
             * if the host changes its markup between 'edit' and 'display' modes.
             * @returns {string}
             */
            contentMarkup: function () {
                return this.isStateOn(self.STATE_NAME_EDITABLE) ?
                    this.editMarkup() :
                    this.displayMarkup();
            },

            /**
             * Call from host's .afterStateOn.
             * @param {string} stateName
             */
            afterStateOn: function (stateName) {
                if (stateName === self.STATE_NAME_EDITABLE) {
                    this._updateEditableState();
                }
            },

            /**
             * Call from host's .afterStateOff.
             * @param {string} stateName
             */
            afterStateOff: function (stateName) {
                if (stateName === self.STATE_NAME_EDITABLE) {
                    this._updateEditableState();
                }
            },

            /**
             * Sets the host to edit mode.
             * @returns {$commonWidgets.Editable}
             */
            toEditMode: function () {
                this.addBinaryStateSource(self.STATE_NAME_EDITABLE, 'default');
                return this;
            },

            /**
             * Sets the host to display mode.
             * @returns {$commonWidgets.Editable}
             */
            toDisplayMode: function () {
                this.removeBinaryStateSource(self.STATE_NAME_EDITABLE, 'default');
                return this;
            },

            /**
             * Tells whether host is in edit mode.
             * @returns {boolean}
             */
            isInEditMode: function () {
                return this.isStateOn(self.STATE_NAME_EDITABLE);
            },

            /**
             * Tells whether host is in display mode.
             * @returns {boolean}
             */
            isInDisplayMode: function () {
                return !this.isStateOn(self.STATE_NAME_EDITABLE);
            }
        });

    /**
     * @name $commonWidgets.Editable#editMarkup
     * @function
     * @returns {string}
     */

    /**
     * @name $commonWidgets.Editable#displayMarkup
     * @function
     * @returns {string}
     */
});

(function () {
    "use strict";

    $oop.addGlobalConstants.call($commonWidgets, /** @lends $commonWidgets */{
        /**
         * Signals that the host has changed to edit mode.
         * @constant
         */
        EVENT_EDITABLE_EDIT_MODE: 'widget.editMode.on',

        /**
         * Signals that the host has changed to display mode.
         * @constant
         */
        EVENT_EDITABLE_DISPLAY_MODE: 'widget.editMode.off'
    });
}());

$oop.postpone($commonWidgets, 'EntityWidget', function () {
    "use strict";

    var base = $oop.Base,
        self = base.extend();

    /**
     * Expects to be added to widget classes.
     * @class
     * @extends $oop.Base
     * @extends $widget.Widget
     */
    $commonWidgets.EntityWidget = self
        .addConstants(/** @lends $commonWidgets.EntityWidget */{
            /** @constant */
            ATTRIBUTE_NAME_ENTITY_KEY: 'data-entity-key'
        })
        .addMethods(/** @lends $commonWidgets.EntityWidget# */{
            /**
             * @param {$entity.EntityKey} entityKey
             */
            init: function (entityKey) {
                /** @type {$entity.EntityKey} */
                this.entityKey = entityKey;
            },

            /**
             * @returns {$commonWidgets.EntityWidget}
             */
            revealKey: function () {
                this.addAttribute(self.ATTRIBUTE_NAME_ENTITY_KEY, this.entityKey.toString());
                return this;
            },

            /**
             * @returns {$commonWidgets.EntityWidget}
             */
            hideKey: function () {
                this.removeAttribute(self.ATTRIBUTE_NAME_ENTITY_KEY);
                return this;
            }
        });
});

$oop.postpone($commonWidgets, 'revealKeys', function () {
    "use strict";

    /**
     * Reveals entity keys on all widgets that have the EntityWidget trait.
     * Entity key strings will be added to widget elements as 'data-entity-key' attribute.
     * @type {function}
     */
    $commonWidgets.revealKeys = function () {
        $widget.Widget.rootWidget.getAllDescendants()
            .callOnEachItem('revealKey');
    };
});

$oop.postpone($commonWidgets, 'hideKeys', function () {
    "use strict";

    /**
     * Removes 'data-entity-key' attribute from the DOM of all widgets that have the EntityWidget trait.
     * @type {function}
     */
    $commonWidgets.hideKeys = function () {
        $widget.Widget.rootWidget.getAllDescendants()
            .callOnEachItem('hideKey');
    };
});

$oop.postpone($commonWidgets, 'Popup', function (ns, className, /**jQuery*/$) {
    "use strict";

    var base = $oop.Base,
        self = base.extend(),
        $document = document && $(document);

    /**
     * The Popup trait allows widgets to be opened and closed like popups.
     * Popups maintain parent-children relationship with the widget that created them,
     * but they are rendered right under the body element. It is vital therefore that whatever happens inside
     * the popup must trigger widget events since they are the only way to notify the parent widget of changes.
     * Popups may be closed by clicking outside of the widget's DOM.
     * Expects to be added to Widget classes.
     * @class
     * @extends $oop.Base
     * @extends $widget.Widget
     */
    $commonWidgets.Popup = self
        .addPrivateMethods(/** @lends $commonWidgets.Popup# */{
            /**
             * @param {boolean} a
             * @param {boolean} b
             * @returns {boolean}
             * @memberOf $commonWidgets.Popup
             * @private
             */
            _or: function (a, b) {
                return a || b;
            },

            /**
             * @param {jQuery} $element
             * @param {string} selector
             * @returns {boolean}
             * @memberOf $commonWidgets.Popup
             * @private
             */
            _hasClosest: function ($element, selector) {
                return $element.closest(selector).length > 0;
            },

            /** @private */
            _removeFromDom: function () {
                var element = this.getElement();
                if (element) {
                    $(element).remove();
                }
            },

            /**
             * @param {jQuery} $element
             * @returns {boolean}
             * @private
             */
            _isOutside: function ($element) {
                var element;
                if (this.outsideSelectors
                        .mapValues(this._hasClosest.bind(this, $element))
                        .getValues()
                        .reduce(this._or, false)
                ) {
                    return true;
                } else if (this.insideSelectors
                        .mapValues(this._hasClosest.bind(this, $element))
                        .getValues()
                        .reduce(this._or, false)
                ) {
                    return false;
                } else {
                    element = this.getElement();
                    return element && !$element.closest(element).length;
                }
            },

            /**
             * @returns {UIEvent}
             * @private
             */
            _getLastUiEvent: function () {
                var lastEvent = window && $event.originalEventStack.getLastEvent();
                return lastEvent && $event.Event.isBaseOf(lastEvent) ?
                    lastEvent.getOriginalEventByType(UIEvent) :
                    undefined;
            }
        })
        .addMethods(/** @lends $commonWidgets.Popup# */{
            /**
             * Call from host's init.
             */
            init: function () {
                this
                    .elevateMethod('onBodyClick')
                    .elevateMethod('onOutsideClick');

                /** @type {boolean} */
                this.isOpen = false;

                /** @type {$data.Collection} */
                this.outsideSelectors = $data.Collection.create();

                /** @type {$data.Collection} */
                this.insideSelectors = $data.Collection.create();

                /**
                 * DOM Event that led to opening the popup.
                 * @type {UIEvent}
                 */
                this.openUiEvent = undefined;
            },

            /**
             * Overrides rendering, ensuring that popups get only rendered inside the document body.
             * This override is supposed to overshadow Widget's implementation.
             * @param {HTMLElement} element
             * @returns {$commonWidgets.Popup}
             */
            renderInto: function (element) {
                if (element === document.body) {
                    $widget.Widget.renderInto.call(this, element);
                }
                return this;
            },

            /**
             * Call from host class' afterAdd.
             */
            afterAdd: function () {
                this.subscribeTo($commonWidgets.EVENT_POPUP_OUTSIDE_CLICK, this.onOutsideClick);
            },

            /**
             * Call from host class' afterRemove.
             */
            afterRemove: function () {
                this.unsubscribeFrom($commonWidgets.EVENT_POPUP_OUTSIDE_CLICK);

                // removing DOM in case popup was removed via its parent with
                // which does not contain the DOM of the popup
                this._removeFromDom();

                // unsubscribing from global click event
                $document.off('click', this.onBodyClick);

                this.openUiEvent = undefined;
            },

            /**
             * Call from host class' afterRender.
             */
            afterRender: function () {
                $document
                    .off('click', this.onBodyClick)
                    .on('click', this.onBodyClick);
            },

            /**
             * Opens popup. Popup must be added to a parent before calling this method.
             * @returns {$commonWidgets.Popup}
             */
            openPopup: function () {
                $assertion.assert(this.parent, "Popup has no parent");

                if (!this.isOpen) {
                    this.openUiEvent = this._getLastUiEvent();

                    this.renderInto(document.body);

                    this.isOpen = true;

                    this.triggerSync($commonWidgets.EVENT_POPUP_OPEN);
                }

                return this;
            },

            /**
             * Closes popup, and removes it from the widget hierarchy.
             * @returns {$commonWidgets.Popup}
             */
            closePopup: function () {
                var openUiEvent = this.openUiEvent,
                    isClosedBySameEvent = openUiEvent && openUiEvent === this._getLastUiEvent();

                if (this.isOpen && !isClosedBySameEvent) {
                    // must set flag before triggering event
                    // otherwise event handlers would see mixed state
                    // (event says it's closed, but widget state says it's open)
                    this.isOpen = false;

                    // must trigger before removing widget from hierarchy
                    // otherwise event won't bubble
                    this.triggerSync($commonWidgets.EVENT_POPUP_CLOSE);

                    this.removeFromParent();
                }

                return this;
            },

            /**
             * Treats DOM elements matching the specified global jQuery selector as inside of the popup.
             * Clicking on such elements would not trigger an 'outside-click' event even when they're outside of the
             * popup's DOM.
             * @param {string} globalSelector
             * @returns {$commonWidgets.Popup}
             */
            treatAsInside: function (globalSelector) {
                if (this.outsideSelectors.getItem(globalSelector)) {
                    this.outsideSelectors.deleteItem(globalSelector);
                }
                this.insideSelectors.setItem(globalSelector, globalSelector);
                return this;
            },

            /**
             * Treats DOM elements matching the specified global jQuery selector as outside of the popup.
             * Clicking on such elements would trigger an 'outside-click' event even when they're inside the popup's DOM.
             * @param {string} selector
             * @returns {$commonWidgets.Popup}
             */
            treatAsOutside: function (selector) {
                if (this.insideSelectors.getItem(selector)) {
                    this.insideSelectors.deleteItem(selector);
                }
                this.outsideSelectors.setItem(selector, selector);
                return this;
            },

            /**
             * Default outside click handler
             * @ignore
             */
            onOutsideClick: function () {
                this.closePopup();
            },

            /**
             * @param {UIEvent} event
             * @ignore
             */
            onBodyClick: function (event) {
                var link = $event.pushOriginalEvent(event);
                if (this._isOutside($(event.target))) {
                    this.triggerSync($commonWidgets.EVENT_POPUP_OUTSIDE_CLICK);
                }
                link.unlink();
            }
        });
}, jQuery);

(function () {
    "use strict";

    $oop.addGlobalConstants.call($commonWidgets, /** @lends $commonWidgets */{
        /**
         * Signals that the user clicked outside an open Popup.
         * @constant
         */
        EVENT_POPUP_OUTSIDE_CLICK: 'widget.click.popup.outside',

        /**
         * Signals that a Popup was opened.
         * @constant
         */
        EVENT_POPUP_OPEN: 'widget.open.on.popup',

        /**
         * Signals tha a Popup was closed.
         * @constant
         */
        EVENT_POPUP_CLOSE: 'widget.open.off.popup'
    });
}());

$oop.postpone($commonWidgets, 'AlignedPopup', function (ns, className, /**jQuery*/$) {
    "use strict";

    var base = $commonWidgets.Popup,
        self = base.extend();

    /**
     * The AlignedPopup trait extends the Popup trait with aligning the widget's DOM to the DOM of its parent.
     * Relies on jQuery UI's positioning.
     * @class
     * @extends $commonWidgets.Popup
     * @link http://api.jqueryui.com/position
     */
    $commonWidgets.AlignedPopup = self
        .addPrivateMethods(/** @lends $commonWidgets.AlignedPopup# */{
            /** @private */
            _alignPopup: function () {
                var element = this.getElement();
                if (element) {
                    $(element).position(this.positionOptions.items);
                }
            },

            /** @private */
            _updateOfPositionOption: function () {
                var parentElement = this.parent.getElement();
                if (parentElement) {
                    this.setPositionOption('of', $(parentElement));
                }
                return this;
            }
        })
        .addMethods(/** @lends $commonWidgets.AlignedPopup# */{
            /** Call from host class' init. */
            init: function () {
                base.init.call(this);

                this.elevateMethod('onResize');

                /**
                 * Options for positioning the select list popup around its parent.
                 * @type {$data.Collection}
                 */
                this.positionOptions = $data.Collection.create({
                    my: 'left top',
                    at: 'left bottom'
                });
            },

            /** Call from host class' afterAdd. */
            afterAdd: function () {
                base.afterAdd.call(this);
                this.subscribeTo($commonWidgets.EVENT_WINDOW_RESIZE_DEBOUNCED, this.onResize);
            },

            /** Call from host class' afterRender. */
            afterRender: function () {
                base.afterRender.call(this);
                this._updateOfPositionOption();
            },

            /**
             * Sets jQuery UI position option. Accepts any options combination that jQuery UI's .position() does.
             * @param {string} optionName
             * @param {*} [optionValue]
             * @returns {$commonWidgets.AlignedPopup}
             * @link http://api.jqueryui.com/position/
             */
            setPositionOption: function (optionName, optionValue) {
                if (typeof optionValue === 'undefined') {
                    this.positionOptions.deleteItem(optionName);
                } else {
                    this.positionOptions.setItem(optionName, optionValue);
                }
                this._alignPopup();
                return this;
            },

            /** @ignore */
            onResize: function () {
                this._alignPopup();
            }
        });
}, jQuery);
$oop.postpone($commonWidgets, 'DataListItem', function () {
    "use strict";

    var base = $oop.Base,
        self = base.extend();

    /**
     * The DataListItem trait associates widgets with an item key.
     * Any widget that to be used as an item in a DataList is expected to have tgis trait.
     * @class
     * @extends $oop.Base
     * @extends $widget.Widget
     */
    $commonWidgets.DataListItem = self
        .addMethods(/** @lends $commonWidgets.DataListItem# */{
            /**
             * Call from host's init.
             * @param {$entity.ItemKey} [itemKey]
             */
            init: function (itemKey) {
                /** @type {$entity.ItemKey} */
                this.itemKey = itemKey;
            },

            /**
             * Associates item widget with an item key.
             * @param {$entity.ItemKey} itemKey
             * @returns {$commonWidgets.DataListItem}
             */
            setItemKey: function (itemKey) {
                $assertion.isItemKey(itemKey, "Invalid item key");
                this.itemKey = itemKey;
                return this;
            },

            /**
             * TODO: Is this necessary? DataList should always be in sync w/ cache.
             * @param {$widget.Widget} parentWidget
             * @returns {$commonWidgets.DataListItem}
             */
            addToParent: function (parentWidget) {
                var childName = this.childName,
                    currentChild = parentWidget.children.getItem(childName);

                $widget.Widget.addToParent.call(this, parentWidget);

                if (currentChild !== this) {
                    // triggering event about being added
                    parentWidget
                        .spawnEvent($commonWidgets.EVENT_DATA_LIST_ITEM_ADD)
                        .setPayloadItem('childWidget', this)
                        .triggerSync();
                }

                return this;
            },

            /**
             * TODO: Is this necessary? DataList should always be in sync w/ cache.
             * @returns {$commonWidgets.DataListItem}
             */
            removeFromParent: function () {
                var parent = this.parent;

                $widget.Widget.removeFromParent.call(this);

                if (parent) {
                    // triggering event about removal
                    parent
                        .spawnEvent($commonWidgets.EVENT_DATA_LIST_ITEM_REMOVE)
                        .setPayloadItem('childWidget', this)
                        .triggerSync();
                }

                return this;
            }
        });
}, jQuery);

$oop.addGlobalConstants.call($commonWidgets, /** @lends $commonWidgets */{
    /**
     * Signals tha a Widget has been added as child.
     * @constant
     */
    EVENT_DATA_LIST_ITEM_ADD: 'widget.list.item.add.data',

    /**
     * Signals that a Widget was removed from its current parent.
     * @constant
     */
    EVENT_DATA_LIST_ITEM_REMOVE: 'widget.list.item.remove.data'
});

$oop.postpone($commonWidgets, 'Option', function (ns, className, /**jQuery*/$) {
    "use strict";

    var base = $oop.Base,
        self = base.extend();

    /**
     * The Option trait allows widgets to behave like option items in a dropdown or select list.
     * Add this trait to classes aimed to be used as options in a dropdown.
     * Expects host to have the Highlightable trait.
     * @class
     * @extends $oop.Base
     * @extends $widget.Widget
     * @extends $commonWidgets.BinaryStateful
     * @extends $commonWidgets.Highlightable
     */
    $commonWidgets.Option = self
        .addConstants(/** @lends $commonWidgets.Option */{
            /** @constant */
            HIGHLIGHTED_FOCUS: 'highlighted-focus',

            /** @constant */
            HIGHLIGHTED_ACTIVE: 'highlighted-active'
        })
        .addMethods(/** @lends $commonWidgets.Option# */{
            /**
             * Call from host's init.
             * @param {*} [optionValue]
             */
            init: function (optionValue) {
                this
                    .elevateMethod('onOptionClick')
                    .elevateMethod('onOptionHover');

                /**
                 * Value carried by option.
                 * This is not what's displayed in the option, but the logical value associated with it.
                 * This is the value that will be passed back along the event when the option is selected.
                 * @type {*}
                 */
                this.optionValue = optionValue;
            },

            /** Call from host's afterRender. */
            afterRender: function () {
                var element = this.getElement();
                if (element) {
                    $(element)
                        .on('click', this.onOptionClick)
                        .on('mouseenter', this.onOptionHover);
                }
            },

            /**
             * Sets option value.
             * @param {*} optionValue
             * @returns {$commonWidgets.Option}
             */
            setOptionValue: function (optionValue) {
                this.optionValue = optionValue;
                return this;
            },

            /**
             * Marks current option as focused.
             * @returns {$commonWidgets.Option}
             */
            markAsFocused: function () {
                if (!this.isFocused()) {
                    this.highlightOn(self.HIGHLIGHTED_FOCUS)
                        .spawnEvent($commonWidgets.EVENT_OPTION_FOCUS)
                        .setPayloadItems({
                            optionName : this.childName,
                            optionValue: this.optionValue
                        })
                        .triggerSync();
                }
                return this;
            },

            /**
             * Marks current option as no longer focused.
             * @returns {$commonWidgets.Option}
             */
            markAsBlurred: function () {
                if (this.isFocused()) {
                    this.highlightOff(self.HIGHLIGHTED_FOCUS)
                        .spawnEvent($commonWidgets.EVENT_OPTION_BLUR)
                        .setPayloadItems({
                            optionName : this.childName,
                            optionValue: this.optionValue
                        })
                        .triggerSync();
                }
                return this;
            },

            /**
             * Tells whether the current option is focused.
             * @returns {boolean}
             */
            isFocused: function () {
                return this.isHighlighted(self.HIGHLIGHTED_FOCUS);
            },

            /**
             * Marks current option as active.
             * @returns {$commonWidgets.Option}
             */
            markAsActive: function () {
                if (!this.isActive()) {
                    this.highlightOn(self.HIGHLIGHTED_ACTIVE)
                        .spawnEvent($commonWidgets.EVENT_OPTION_ACTIVE)
                        .setPayloadItems({
                            optionName : this.childName,
                            optionValue: this.optionValue
                        })
                        .triggerSync();
                }
                return this;
            },

            /**
             * Marks current option as inactive.
             * @returns {$commonWidgets.Option}
             */
            markAsInactive: function () {
                if (this.isActive()) {
                    this.highlightOff(self.HIGHLIGHTED_ACTIVE)
                        .spawnEvent($commonWidgets.EVENT_OPTION_INACTIVE)
                        .setPayloadItems({
                            optionName : this.childName,
                            optionValue: this.optionValue
                        })
                        .triggerSync();
                }
                return this;
            },

            /**
             * Tells whether the current option is active.
             * @returns {boolean}
             */
            isActive: function () {
                return this.isHighlighted(self.HIGHLIGHTED_ACTIVE);
            },

            /**
             * @param {jQuery.Event} event
             * @ignore
             */
            onOptionClick: function (event) {
                var link = $event.pushOriginalEvent(event);
                this.markAsActive();
                link.unlink();
            },

            /**
             * @param {jQuery.Event} event
             * @ignore
             */
            onOptionHover: function (event) {
                var link = $event.pushOriginalEvent(event);
                this.markAsFocused();
                link.unlink();
            }
        });
}, jQuery);

(function () {
    "use strict";

    $oop.addGlobalConstants.call($commonWidgets, /** @lends $commonWidgets */{
        /**
         * Signals that an Option has gained focus.
         * @constant
         */
        EVENT_OPTION_FOCUS: 'widget.focus.on.option',

        /**
         * Signals that an Option has lost focus.
         * @constant
         */
        EVENT_OPTION_BLUR: 'widget.focus.off.option',

        /**
         * Signals that an Option became active.
         * @constant
         */
        EVENT_OPTION_ACTIVE: 'widget.active.on.option',

        /**
         * Signals that an Option became inactive.
         * @constant
         */
        EVENT_OPTION_INACTIVE: 'widget.active.off.option'
    });
}());

$oop.postpone($commonWidgets, 'OptionList', function () {
    "use strict";

    var base = $oop.Base,
        self = base.extend();

    /**
     * The OptionList trait modifies List classes so that they can be used in dropdowns.
     * Should only accept widgets as list items that implement the Option trait.
     * Whatever uses the OptionList should take care of initializing the focused and selected states in afterAdd.
     * The OptionList returns to its neutral state after being removed from the hierarchy.
     * @class
     * @extends $oop.Base
     * @extends $commonWidgets.List
     */
    $commonWidgets.OptionList = self
        .addPrivateMethods(/** @lends $commonWidgets.OptionList# */{
            /**
             * @param {string} optionName
             * @param {*} optionValue
             * @private
             */
            _triggerSelectEvent: function (optionName, optionValue) {
                this.spawnEvent($commonWidgets.EVENT_OPTION_SELECT)
                    .setPayloadItems({
                        optionName : optionName,
                        optionValue: optionValue
                    })
                    .triggerSync();
            },

            /**
             * @param {string} newFocusedOptionName
             * @private
             */
            _setFocusedOptionName: function (newFocusedOptionName) {
                var oldFocusedOptionName = this.focusedOptionName,
                    oldFocusedOption;
                if (oldFocusedOptionName !== newFocusedOptionName) {
                    oldFocusedOption = this.getChild(oldFocusedOptionName);
                    if (oldFocusedOption) {
                        // old focused option might not be a child anymore
                        oldFocusedOption.markAsBlurred();
                    }
                    this.focusedOptionName = newFocusedOptionName;
                }
            },

            /**
             * @param {string} newActiveOptionName
             * @private
             */
            _setActiveOptionName: function (newActiveOptionName) {
                var oldActiveOptionName = this.activeOptionName,
                    oldActiveOption;
                if (oldActiveOptionName !== newActiveOptionName) {
                    oldActiveOption = this.getChild(oldActiveOptionName);
                    if (oldActiveOption) {
                        // old active option might not be a child anymore
                        oldActiveOption.markAsInactive();
                    }
                    this.activeOptionName = newActiveOptionName;
                }
            },

            /**
             * Looks into current options and sets active option name.
             * @private
             */
            _updateFocusedOptionName: function () {
                var focusedOption = this.getFocusedOption();
                if (focusedOption) {
                    this.focusedOptionName = focusedOption.childName;
                }
            },

            /**
             * Looks into current options and sets active option name.
             * @private
             */
            _updateActiveOptionName: function () {
                var selectedOption = this.getSelectedOption();
                if (selectedOption) {
                    this.activeOptionName = selectedOption.childName;
                }
            },

            /**
             * Focuses on the first available option.
             * @private
             */
            _focusOnOption: function () {
                var focusedOption = this.getFocusedOption() ||
                    this.getSelectedOption() ||
                    this.children.getFirstValue();

                if (focusedOption) {
                    // there is a suitable option to focus on
                    focusedOption.markAsFocused();
                }
            }
        })
        .addMethods(/** @lends $commonWidgets.OptionList# */{
            /** Call from host's init. */
            init: function () {
                this
                    .elevateMethod('onItemsChange')
                    .elevateMethod('onHotKeyPress')
                    .elevateMethod('onOptionFocus')
                    .elevateMethod('onOptionActive')
                    .elevateMethod('onOptionSelect');

                /**
                 * Identifier of option in focus.
                 * Name of corresponding child (item) widget.
                 * @type {string}
                 */
                this.focusedOptionName = undefined;

                /**
                 * Identifier of active option.
                 * Name of corresponding child widget.
                 * @type {string}
                 */
                this.activeOptionName = undefined;
            },

            /** Call from host's afterAdd. */
            afterAdd: function () {
                this
                    .subscribeTo($commonWidgets.EVENT_LIST_ITEMS_CHANGE, this.onItemsChange)
                    .subscribeTo($commonWidgets.EVENT_HOT_KEY_DOWN, this.onHotKeyPress)
                    .subscribeTo($commonWidgets.EVENT_OPTION_FOCUS, this.onOptionFocus)
                    .subscribeTo($commonWidgets.EVENT_OPTION_ACTIVE, this.onOptionActive)
                    .subscribeTo($commonWidgets.EVENT_OPTION_SELECT, this.onOptionSelect);

                this._focusOnOption();
                this._updateFocusedOptionName();
                this._updateActiveOptionName();
            },

            /** @ignore */
            afterRemove: function () {
                // destructing widget state
                var focusedOption = this.getFocusedOption(),
                    selectedOption = this.getSelectedOption();

                if (focusedOption) {
                    focusedOption.markAsBlurred();
                }
                if (selectedOption) {
                    selectedOption.markAsInactive();
                }

                this.focusedOptionName = undefined;
                this.activeOptionName = undefined;
            },

            /**
             * Fetches option widget based on its option value.
             * TODO: maintain an lookup of option values -> option widgets.
             * @param {*} optionValue
             * @returns {$commonWidgets.Option}
             */
            getOptionByValue: function (optionValue) {
                return this.children
                    .filterBySelector(function (option) {
                        return option.optionValue === optionValue;
                    })
                    .getFirstValue();
            },

            /**
             * Fetches currently focused option, or an arbitrary option if none focused.
             * @returns {$commonWidgets.Option}
             */
            getFocusedOption: function () {
                return this.children.filterBySelector(
                    function (option) {
                        return option.isFocused();
                    })
                    .getFirstValue();
            },

            /**
             * Fetches option that is currently selected, or undefined.
             * @returns {$commonWidgets.Option}
             */
            getSelectedOption: function () {
                return this.children.filterBySelector(
                    function (option) {
                        return option.isActive();
                    })
                    .getFirstValue();
            },

            /**
             * Selects an option on the list.
             * @param {string} optionName
             * @returns {$commonWidgets.OptionList}
             */
            selectOption: function (optionName) {
                var option = this.getChild(optionName);
                $assertion.assert(!!option, "Invalid option name");
                option.markAsActive();

                return this;
            },

            /**
             * @ignore
             */
            onItemsChange: function () {
                this._focusOnOption();
                this._updateFocusedOptionName();
            },

            /**
             * TODO: break up into smaller methods
             * @param {$widget.WidgetEvent} event
             * @ignore
             */
            onHotKeyPress: function (event) {
                var charCode = event.payload.charCode,
                    children = this.children,
                    sortedChildNames = children.getKeys().sort(),
                    currentChildIndex = sortedChildNames.indexOf(this.focusedOptionName),
                    newFocusedOptionName;

                switch (charCode) {
                case 38: // up
                    currentChildIndex = Math.max(currentChildIndex - 1, 0);
                    newFocusedOptionName = sortedChildNames[currentChildIndex];
                    this.getChild(newFocusedOptionName)
                        .markAsFocused();
                    break;

                case 40: // down
                    currentChildIndex = Math.min(currentChildIndex + 1, sortedChildNames.length - 1);
                    newFocusedOptionName = sortedChildNames[currentChildIndex];
                    this.getChild(newFocusedOptionName)
                        .markAsFocused();
                    break;

                case 27: // esc
                    this.triggerSync($commonWidgets.EVENT_OPTIONS_ESCAPE);
                    break;

                case 13: // enter
                    this.getChild(this.focusedOptionName)
                        .markAsActive();
                    break;
                }
            },

            /**
             * @param {$widget.WidgetEvent} event
             * @ignore
             */
            onOptionFocus: function (event) {
                var newFocusedOptionName = event.sender.childName;
                this._setFocusedOptionName(newFocusedOptionName);
            },

            /**
             * @param {$widget.WidgetEvent} event
             * @ignore
             */
            onOptionActive: function (event) {
                var optionWidget = event.sender;
                this._triggerSelectEvent(optionWidget.childName, optionWidget.optionValue);
            },

            /**
             * @param {$widget.WidgetEvent} event
             * @ignore
             */
            onOptionSelect: function (event) {
                var optionName = event.payload.optionName;
                this._setActiveOptionName(optionName);
            }
        });
});

(function () {
    "use strict";

    $oop.addGlobalConstants.call($commonWidgets, /** @lends $commonWidgets */{
        /**
         * Signals that an Option was selected.
         * @constant
         */
        EVENT_OPTION_SELECT: 'widget.select.on.option',

        /**
         * Signals that ESC was pressed while an Option is in focus.
         * @constant
         */
        EVENT_OPTIONS_ESCAPE: 'widget.select.off.option'
    });
}());

$oop.postpone($commonWidgets, 'FieldBound', function () {
    "use strict";

    var base = $oop.Base,
        self = base.extend();

    /**
     * Effectuates field value change on widget.
     * Implement in host class.
     * @name $commonWidgets.FieldBound#setFieldValue
     * @function
     * @param {*} fieldValue
     * @returns {$commonWidgets.FieldBound}
     */

    /**
     * The FieldBound trait adds a callback method to the host class that is invoked each time the value at
     * the field key associated with the host class changes.
     * Expects to be added to widgets that also have the EntityBound and EntityWidget traits.
     * @class
     * @extends $oop.Base
     * @extends $entity.EntityBound
     * @extends $commonWidgets.EntityWidget
     * @extends $widget.Widget
     */
    $commonWidgets.FieldBound = self
        .addPrivateMethods(/** @lends $commonWidgets.FieldBound# */{
            /** @private */
            _updateFieldValue: function () {
                var fieldValue = this.entityKey.toField().getValue();
                this.setFieldValue(fieldValue);
            }
        })
        .addMethods(/** @lends $commonWidgets.FieldBound# */{
            /** Call from host's afterAdd. */
            afterAdd: function () {
                this._updateFieldValue();
                // TODO: Use .bindToFieldChange().
                this
                    .bindToEntityChange(this.entityKey.documentKey, 'onDocumentReplace')
                    .bindToEntityChange(this.entityKey, 'onFieldChange');
            },

            /** Call from host's afterRemove. */
            afterRemove: function () {
                this
                    .unbindFromEntityChange(this.entityKey.documentKey, 'onDocumentReplace')
                    .unbindFromEntityChange(this.entityKey, 'onFieldChange');
            },

            /**
             * @ignore
             */
            onDocumentReplace: function () {
                this._updateFieldValue();
            },

            /**
             * @ignore
             */
            onFieldChange: function () {
                this._updateFieldValue();
            }
        });
});

$oop.postpone($commonWidgets, 'ResizeWatcher', function (ns, className, /**jQuery*/$) {
    "use strict";

    var base = $oop.Base,
        self = base.extend(),
        $window = window && $(window);

    /**
     * Creates a ResizeWatcher instance, or pulls up an existing one from registry.
     * @name $commonWidgets.ResizeWatcher.create
     * @function
     * @returns {$commonWidgets.ResizeWatcher}
     */

    /**
     * Singleton that watches window resize events and broadcasts debounced (100ms) widget events in response.
     * Listen to $commonWidgets.EVENT_WINDOW_RESIZE_DEBOUNCED in any widget to get
     * notified of changes to window size.
     * @class
     * @extends $oop.Base
     */
    $commonWidgets.ResizeWatcher = self
        .setInstanceMapper(function () {
            return 'singleton';
        })
        .addConstants(/** @lends $commonWidgets.ResizeWatcher */{
            /**
             * Delay in ms to wait between the last window resize event and
             * triggering the widget resize event.
             * @constant
             */
            RESIZE_DEBOUNCE_DELAY: 100
        })
        .addMethods(/** @lends $commonWidgets.ResizeWatcher# */{
            /** @ignore */
            init: function () {
                this.elevateMethod('onDebouncedWindowResize');

                /**
                 * Stores current window width.
                 * @type {number}
                 */
                this.curentWidth = undefined;

                /**
                 * Stores current window height.
                 * @type {number}
                 */
                this.curentHeight = undefined;

                /**
                 * Debouncer instance for debouncing window resize events, which may come in rapid succession.
                 * @type {$utils.Debouncer}
                 */
                this.windowResizeDebouncer = this.onDebouncedWindowResize.toDebouncer();

                // setting initial dimensions
                this.updateDimensions();
            },

            /**
             * Updates window dimensions, and triggers widget event about resizing.
             * @returns {$commonWidgets.ResizeWatcher}
             */
            updateDimensions: function () {
                var currentWidth = $window.width(),
                    currentHeight = $window.height(),
                    wasWindowResized = false,
                    rootWidget = $widget.Widget.rootWidget;

                if (currentWidth !== this.currentWidth || currentHeight !== this.currentHeight) {
                    wasWindowResized = true;
                }

                this.currentWidth = currentWidth;
                this.currentHeight = currentHeight;

                if (wasWindowResized && rootWidget) {
                    rootWidget.broadcastSync($commonWidgets.EVENT_WINDOW_RESIZE_DEBOUNCED);
                }

                return this;
            },

            /**
             * @param {jQuery.Event} event
             * @ignore
             */
            onWindowResize: function (event) {
                var link = $event.pushOriginalEvent(event);
                this.windowResizeDebouncer.schedule(this.RESIZE_DEBOUNCE_DELAY, event);
                link.unlink();
            },

            /**
             * @ignore
             */
            onDebouncedWindowResize: function () {
                var rootWidget = $widget.Widget.rootWidget;
                if (rootWidget) {
                    this.updateDimensions();
                }
            }
        });
}, jQuery);

(function () {
    "use strict";

    $oop.addGlobalConstants.call($commonWidgets, /** @lends $commonWidgets */{
        /**
         * Signals that the window was resized withing the last 100ms.
         * @constant
         */
        EVENT_WINDOW_RESIZE_DEBOUNCED: 'widget.resize.window.debounced'
    });
}());

(function (/**jQuery*/$) {
    "use strict";

    if (window) {
        $(window).on('resize', function (event) {
            $commonWidgets.ResizeWatcher.create()
                .onWindowResize(event);
        });

        $(function () {
            $commonWidgets.ResizeWatcher.create()
                .updateDimensions();
        });
    }
}(jQuery));
$oop.postpone($commonWidgets, 'HotKeyWatcher', function () {
    "use strict";

    var base = $oop.Base,
        self = base.extend();

    /**
     * Static class that watches key events globally and broadcasts widget events in response.
     * Listen to $commonWidgets.EVENT_HOT_KEY_DOWN in any widget to get notified of
     * global key events. (Eg. for navigating within a custom control.)
     * In case you want to suppress hotkey events originating from eg. Input widgets,
     * query the original events and look at the target that received the keydown.
     * @class
     * @extends $oop.Base
     */
    $commonWidgets.HotKeyWatcher = self
        .addMethods(/** @lends $commonWidgets.HotKeyWatcher# */{
            /**
             * @param {jQuery.Event} event
             * @ignore
             */
            onKeyDown: function (event) {
                var link = $event.pushOriginalEvent(event),
                    rootWidget = $widget.Widget.rootWidget,
                    keyboardEvent = event.originalEvent,
                    originWidget = keyboardEvent instanceof Event &&
                        keyboardEvent.toWidget() ||
                        rootWidget;

                if (rootWidget) {
                    rootWidget
                        .spawnEvent($commonWidgets.EVENT_HOT_KEY_DOWN)
                        .setPayloadItems({
                            charCode: event.which,
                            originWidget: originWidget
                        })
                        .broadcastSync();
                }

                link.unlink();
            }
        });
});

(function () {
    "use strict";

    $oop.addGlobalConstants.call($commonWidgets, /** @lends $commonWidgets */{
        /**
         * Signals that a hot key was pressed.
         * @constant
         */
        EVENT_HOT_KEY_DOWN: 'widget.press.hotKey'
    });
}());

(function (/**jQuery*/$) {
    "use strict";

    if (document) {
        $(document).on('keydown', function (event) {
            $commonWidgets.HotKeyWatcher.onKeyDown(event);
        });
    }
}(jQuery));
$oop.postpone($commonWidgets, 'Label', function (ns, className, /**jQuery*/$) {
    "use strict";

    var base = $widget.Widget,
        self = base.extend(className);

    /**
     * Creates a Label instance.
     * @name $commonWidgets.Label.create
     * @function
     * @returns {$commonWidgets.Label}
     */

    /**
     * Displays text, optionally HTML escaped, based on a string literal or stringifiable object.
     * @class
     * @extends $widget.Widget
     */
    $commonWidgets.Label = self
        .addPrivateMethods(/** @lends $commonWidgets.Label# */{
            /**
             * Updates Label's CSS classes based on its content.
             * @private
             */
            _updateLabelStyle: function () {
                var labelText = $utils.Stringifier.stringify(this.labelText);
                if (labelText) {
                    this
                        .removeCssClass('no-text')
                        .addCssClass('has-text');
                } else {
                    this
                        .removeCssClass('has-text')
                        .addCssClass('no-text');
                }
            },

            /** @private */
            _updateLabelDom: function () {
                var element = this.getElement(),
                    currentLabelText;

                if (element) {
                    currentLabelText = $utils.Stringifier.stringify(this.labelText);
                    $(element).html(this.htmlEscaped ?
                        currentLabelText.toHtml() :
                        currentLabelText);
                }
            }
        })
        .addMethods(/** @lends $commonWidgets.Label# */{
            /** @ignore */
            init: function () {
                base.init.call(this);

                /**
                 * Text or text provider associated with Label.
                 * @type {string|object}
                 */
                this.labelText = undefined;

                /**
                 * Whether label HTML escapes text before rendering.
                 * @type {boolean}
                 */
                this.htmlEscaped = true;

                this.setTagName('span');

                this._updateLabelStyle();
            },

            /** @ignore */
            contentMarkup: function () {
                var currentLabelText = $utils.Stringifier.stringify(this.labelText);
                return this.htmlEscaped ?
                    currentLabelText.toHtml() :
                    currentLabelText;
            },

            /**
             * Sets flag that determines whether label will HTML escape text before rendering.
             * Use with care: script embedded in labelText might compromise security!
             * @param {boolean} htmlEscaped
             * @returns {$commonWidgets.Label}
             */
            setHtmlEscaped: function (htmlEscaped) {
                this.htmlEscaped = htmlEscaped;
                this._updateLabelDom();
                return this;
            },

            /**
             * Sets text to display on label. Accepts strings or objects that implement .toString().
             * Displayed text will be HTML encoded.
             * @param {string|object} labelText
             * @returns {$commonWidgets.Label}
             */
            setLabelText: function (labelText) {
                this.labelText = labelText;
                this._updateLabelDom();
                this._updateLabelStyle();
                return this;
            }
        });
}, jQuery);

$oop.postpone($commonWidgets, 'HtmlLabel', function (ns, className, /**jQuery*/$) {
    "use strict";

    var base = $commonWidgets.Label,
        self = base.extend(className);

    /**
     * Creates an HtmlLabel instance.
     * @name $commonWidgets.HtmlLabel.create
     * @function
     * @returns {$commonWidgets.HtmlLabel}
     */

    /**
     * Label that is able to display HTML markup.
     * @class
     * @extends $commonWidgets.Label
     * @deprecated
     * Use $commonWidgets.Label with htmlEscaped set to false.
     */
    $commonWidgets.HtmlLabel = self
        .addMethods(/** @lends $commonWidgets.HtmlLabel# */{
            /** @ignore */
            init: function () {
                base.init.call(this);
                this.htmlEscaped = false;
            }
        });
}, jQuery);

$oop.postpone($commonWidgets, 'DataLabel', function (ns, className) {
    "use strict";

    var base = $commonWidgets.Label,
        self = base.extend(className)
            .addTrait($entity.EntityBound)
            .addTrait($commonWidgets.EntityWidget)
            .addTraitAndExtend($commonWidgets.FieldBound);

    /**
     * Creates a DataLabel instance.
     * @name $commonWidgets.DataLabel.create
     * @function
     * @param {$entity.FieldKey} textFieldKey Key to a text field.
     * @returns {$commonWidgets.DataLabel}
     */

    /**
     * The DataLabel displays text based on the value of a field in the cache.
     * Keeps the text in sync with the changes of the corresponding field.
     * @class
     * @extends $commonWidgets.Label
     * @extends $entity.EntityBound
     * @extends $commonWidgets.EntityWidget
     * @extends $commonWidgets.FieldBound
     */
    $commonWidgets.DataLabel = self
        .addMethods(/** @lends $commonWidgets.DataLabel# */{
            /**
             * @param {$entity.FieldKey} fieldKey
             * @ignore
             */
            init: function (fieldKey) {
                $assertion.isFieldKey(fieldKey, "Invalid field key");

                base.init.call(this);
                $entity.EntityBound.init.call(this);
                $commonWidgets.EntityWidget.init.call(this, fieldKey);
            },

            /** @ignore */
            afterAdd: function () {
                base.afterAdd.call(this);
                $commonWidgets.FieldBound.afterAdd.call(this);
            },

            /** @ignore */
            afterRemove: function () {
                base.afterRemove.call(this);
                $commonWidgets.FieldBound.afterRemove.call(this);
            },

            /**
             * @param {*} fieldValue
             * @returns {$commonWidgets.DataLabel}
             * @ignore
             */
            setFieldValue: function (fieldValue) {
                this.setLabelText(fieldValue);
                return this;
            }
        });
});

$oop.postpone($commonWidgets, 'ItemDataLabel', function (ns, className) {
    "use strict";

    var base = $commonWidgets.DataLabel;

    /**
     * Creates a ItemDataLabel instance.
     * @name $commonWidgets.ItemDataLabel.create
     * @function
     * @param {$entity.FieldKey} textFieldKey Identifies field to be displayed.
     * @param {$entity.ItemKey} itemKey Identifies item the widget is associated with.
     * @returns {$commonWidgets.ItemDataLabel}
     */

    /**
     * General DataLabel to be used as a list item.
     * @class
     * @extends $commonWidgets.DataLabel
     * @extends $commonWidgets.DataListItem
     */
    $commonWidgets.ItemDataLabel = base.extend(className)
        .addTraitAndExtend($commonWidgets.DataListItem);
});

$oop.postpone($commonWidgets, 'Hyperlink', function (ns, className, /**jQuery*/$) {
    "use strict";

    var base = $widget.Widget,
        self = base.extend(className);

    /**
     * Creates a Hyperlink instance.
     * @name $commonWidgets.Hyperlink.create
     * @function
     * @returns {$commonWidgets.Hyperlink}
     */

    /**
     * Implements a basic hyperlink.
     * @class
     * @extends $widget.Widget
     */
    $commonWidgets.Hyperlink = self
        .addMethods(/** @lends $commonWidgets.Hyperlink# */{
            /** @ignore */
            init: function () {
                base.init.call(this);
                this.setTagName('a');

                this.spawnLabelWidget()
                    .setChildName('link-label')
                    .addToParent(this);
            },

            /**
             * Creates Label widget to be used inside the link.
             * Override to specify custom widget.
             * @returns {$commonWidgets.Label}
             */
            spawnLabelWidget: function () {
                return $commonWidgets.Label.create();
            },

            /**
             * Retrieves the label widget contained within the link.
             * @returns {$commonWidgets.Label}
             */
            getLabelWidget: function () {
                return this.getChild('link-label');
            },

            /**
             * Sets URL for the link.
             * @param {string} targetUrl
             * @returns {$commonWidgets.Hyperlink}
             */
            setTargetUrl: function (targetUrl) {
                $assertion.isString(targetUrl, "Invalid target URL");

                var element = this.getElement();
                if (element) {
                    $(element).attr('href', targetUrl);
                }

                this.addAttribute('href', targetUrl);

                return this;
            },

            /**
             * Sets the link's caption.
             * Expects the caption widget to be a Label.
             * Override when caption widget is something other than Label.
             * @param {string} caption
             * @returns {$commonWidgets.Hyperlink}
             */
            setCaption: function (caption) {
                this.getLabelWidget()
                    .setLabelText(caption);
                return this;
            }
        });
}, jQuery);

$oop.postpone($commonWidgets, 'DataHyperlink', function (ns, className) {
    "use strict";

    var base = $commonWidgets.Hyperlink,
        self = base.extend(className)
            .addTrait($entity.EntityBound)
            .addTrait($commonWidgets.EntityWidget)
            .addTraitAndExtend($commonWidgets.FieldBound);

    /**
     * Creates a DataHyperlink instance.
     * @name $commonWidgets.DataHyperlink.create
     * @function
     * @param {$entity.FieldKey} urlKey Points to the link's URL.
     * @param {$entity.FieldKey} textKey Points to the link's text.
     * @returns {$commonWidgets.DataHyperlink}
     */

    /**
     * The DataHyperlink displays a link based on the value of a field in the cache.
     * Keeps the target URL in sync with the changes of the corresponding field.
     * This is a general implementation with independent fields for URL and text.
     * For data links where the two fields are connected (eg. by being in the same document)
     * it might be a better idea to subclass Hyperlink directly than using DataHyperlink.
     * @class
     * @extends $commonWidgets.Hyperlink
     * @extends $entity.EntityBound
     * @extends $commonWidgets.EntityWidget
     * @extends $commonWidgets.FieldBound
     */
    $commonWidgets.DataHyperlink = self
        .addMethods(/** @lends $commonWidgets.DataHyperlink# */{
            /**
             * @param {$entity.FieldKey} urlKey
             * @param {$entity.FieldKey} textKey
             * @ignore
             */
            init: function (urlKey, textKey) {
                $assertion
                    .isFieldKey(urlKey, "Invalid URL field key")
                    .isFieldKey(textKey, "Invalid text field key");

                /**
                 * Field key that identifies the text
                 * @type {$entity.FieldKey}
                 */
                this.textKey = textKey;

                base.init.call(this);
                $entity.EntityBound.init.call(this);
                $commonWidgets.EntityWidget.init.call(this, urlKey);
            },

            /** @ignore */
            afterAdd: function () {
                base.afterAdd.call(this);
                $commonWidgets.FieldBound.afterAdd.call(this);
            },

            /** @ignore */
            afterRemove: function () {
                base.afterRemove.call(this);
                $commonWidgets.FieldBound.afterRemove.call(this);
            },

            /**
             * Creates default data bound Label widget based on the textKey provided at instantiation.
             * Override to specify custom widget.
             * @returns {$commonWidgets.DataLabel}
             */
            spawnLabelWidget: function () {
                return $commonWidgets.DataLabel.create(this.textKey);
            },

            /**
             * @param {string} fieldValue
             * @returns {$commonWidgets.DataHyperlink}
             * @ignore
             */
            setFieldValue: function (fieldValue) {
                this.setTargetUrl(fieldValue);
                return this;
            }
        });
});

$oop.postpone($commonWidgets, 'Image', function (ns, className) {
    "use strict";

    var base = $widget.Widget,
        self = base.extend(className);

    /**
     * Creates an Image instance.
     * @name $commonWidgets.Image.create
     * @function
     * @returns {$commonWidgets.Image}
     */

    /**
     * The Image displays an <em>img</em> tag.
     * @class
     * @extends $widget.Widget
     */
    $commonWidgets.Image = self
        .addMethods(/** @lends $commonWidgets.Image# */{
            /** @ignore */
            init: function () {
                base.init.call(this);
                this.setTagName('img');

                /** @type {$transport.ImageUrl} */
                this.imageUrl = undefined;
            },

            /**
             * Sets absolute image URL.
             * @param {$transport.ImageUrl} imageUrl ImageUrl instance.
             * @example
             * image.setImageUrl('http://httpcats.herokuapp.com/418'.toImageUrl())
             * @returns {$commonWidgets.Image}
             */
            setImageUrl: function (imageUrl) {
                $assertion.isLocation(imageUrl, "Invalid image URL");
                this.addAttribute('src', imageUrl.toString());
                this.imageUrl = imageUrl;
                return this;
            }
        });
});

$oop.postpone($commonWidgets, 'DataImage', function (ns, className) {
    "use strict";

    var base = $commonWidgets.Image,
        self = base.extend(className)
            .addTrait($entity.EntityBound)
            .addTrait($commonWidgets.EntityWidget)
            .addTraitAndExtend($commonWidgets.FieldBound);

    /**
     * Creates a DataImage instance.
     * @name $commonWidgets.DataImage.create
     * @function
     * @param {$entity.FieldKey} urlFieldKey Field holding image URL.
     * @returns {$commonWidgets.DataImage}
     */

    /**
     * The DataImage displays an image based on the URL stored in a field in the cache.
     * Keeps the image in sync with the changes of the corresponding field.
     * @class
     * @extends $commonWidgets.Image
     * @extends $entity.EntityBound
     * @extends $commonWidgets.EntityWidget
     * @extends $commonWidgets.FieldBound
     */
    $commonWidgets.DataImage = self
        .addMethods(/** @lends $commonWidgets.DataImage# */{
            /**
             * @param {$entity.FieldKey} urlFieldKey
             * @ignore
             */
            init: function (urlFieldKey) {
                $assertion.isFieldKey(urlFieldKey, "Invalid field key");

                base.init.call(this);
                $entity.EntityBound.init.call(this);
                $commonWidgets.EntityWidget.init.call(this, urlFieldKey);
            },

            /** @ignore */
            afterAdd: function () {
                base.afterAdd.call(this);
                $commonWidgets.FieldBound.afterAdd.call(this);
            },

            /** @ignore */
            afterRemove: function () {
                base.afterRemove.call(this);
                $commonWidgets.FieldBound.afterRemove.call(this);
            },

            /**
             * @param {string} fieldValue
             * @returns {$commonWidgets.DataImage}
             * @ignore
             */
            setFieldValue: function (fieldValue) {
                this.setImageUrl(fieldValue.toImageUrl());
                return this;
            }
        });
});

$oop.postpone($commonWidgets, 'DynamicImage', function (ns, className, /**jQuery*/$) {
    "use strict";

    var base = $commonWidgets.Image,
        self = base.extend(className);

    /**
     * Creates a DynamicImage instance.
     * @name $commonWidgets.DynamicImage.create
     * @function
     * @returns {$commonWidgets.DynamicImage}
     */

    /**
     * The DynamicImage is an Image that loads images dynamically, and triggers appropriate events
     * at relevant stages of the loading process. No longer is an <em>img</em> tag in itself, but wraps
     * an image tag that may or may not be present, depending on loading success. The image will not load sooner than
     * the widget is rendered.
     * @class
     * @extends $commonWidgets.Image
     */
    $commonWidgets.DynamicImage = self
        .addPrivateMethods(/** @lends $commonWidgets.DynamicImage# */{
            /** @private */
            _updateImageElement: function () {
                var element = this.getElement(),
                    oldImageElement,
                    newImageElement;

                if (element) {
                    oldImageElement = $(element).children('img');
                    newImageElement = this.imageElement;

                    if (oldImageElement.length) {
                        oldImageElement.replaceWith(newImageElement);
                    } else {
                        $(element).append(newImageElement);
                    }
                }
            },

            /**
             * @param {HTMLImageElement} imageElement
             * @private
             */
            _setImageElement: function (imageElement) {
                this.imageElement = imageElement;
                this._updateImageElement();
            }
        })
        .addMethods(/** @lends $commonWidgets.DynamicImage# */{
            /** @ignore */
            init: function () {
                base.init.call(this);

                this
                    .setTagName('div')
                    .elevateMethod('onImageLoadStart')
                    .elevateMethod('onImageLoadSuccess')
                    .elevateMethod('onImageLoadFailure');

                /**
                 * HTML image element associated with Image widget.
                 * @type {HTMLImageElement}
                 */
                this.imageElement = undefined;

                /**
                 * Transport-level Image instance associated with Image widget.
                 * @type {$commonWidgets.Image}
                 */
                this.image = undefined;
            },

            /** @ignore */
            afterRender: function () {
                base.afterRender.call(this);
                this._updateImageElement();
            },

            /**
             * Sets image URL. Initiates loading of image when necessary, and subscribes widget
             * to image loading events on the specified URL.
             * @param {$transport.ImageUrl} imageUrl ImageUrl instance.
             * @returns {$commonWidgets.DynamicImage}
             */
            setImageUrl: function (imageUrl) {
                $assertion.isLocation(imageUrl, "Invalid image URL");

                var oldImageUrl = this.imageUrl;

                if (!imageUrl.equals(oldImageUrl)) {
                    if (oldImageUrl) {
                        oldImageUrl
                            .unsubscribeFrom($transport.EVENT_IMAGE_LOAD_START, this.onImageLoadStart)
                            .unsubscribeFrom($transport.EVENT_IMAGE_LOAD_SUCCESS, this.onImageLoadSuccess)
                            .unsubscribeFrom($transport.EVENT_IMAGE_LOAD_FAILURE, this.onImageLoadFailure);
                    }

                    imageUrl
                        .subscribeTo($transport.EVENT_IMAGE_LOAD_START, this.onImageLoadStart)
                        .subscribeTo($transport.EVENT_IMAGE_LOAD_SUCCESS, this.onImageLoadSuccess)
                        .subscribeTo($transport.EVENT_IMAGE_LOAD_FAILURE, this.onImageLoadFailure);

                    this.imageUrl = imageUrl;

                    this.image = imageUrl.toImageLoader()
                        .loadImage();
                }

                return this;
            },

            /**
             * @ignore
             */
            onImageLoadStart: function () {
                this.triggerSync($commonWidgets.EVENT_DYNAMIC_IMAGE_LOAD_START);
            },

            /**
             * @param {$transport.ImageEvent} event
             * @ignore
             */
            onImageLoadSuccess: function (event) {
                this._setImageElement(event.imageElement);
                this.triggerSync($commonWidgets.EVENT_DYNAMIC_IMAGE_LOAD_SUCCESS);
            },

            /**
             * @ignore
             */
            onImageLoadFailure: function () {
                this.triggerSync($commonWidgets.EVENT_DYNAMIC_IMAGE_LOAD_FAILURE);
            }
        });
}, jQuery);

(function () {
    "use strict";

    $oop.addGlobalConstants.call($commonWidgets, /** @lends $commonWidgets */{
        /**
         * Signals that an Image started to load.
         * @constant
         */
        EVENT_DYNAMIC_IMAGE_LOAD_START: 'giant.load.start.image.dynamic',

        /**
         * Signals that an Image finished loading.
         * @constant
         */
        EVENT_DYNAMIC_IMAGE_LOAD_SUCCESS: 'giant.load.success.image.dynamic',

        /**
         * Signals that an Image failed loading.
         * @constant
         */
        EVENT_DYNAMIC_IMAGE_LOAD_FAILURE: 'giant.load.failure.image.dynamic'
    });
}());

$oop.postpone($commonWidgets, 'DataDynamicImage', function (ns, className) {
    "use strict";

    var base = $commonWidgets.DynamicImage,
        self = base.extend(className)
            .addTrait($entity.EntityBound)
            .addTrait($commonWidgets.EntityWidget)
            .addTraitAndExtend($commonWidgets.FieldBound);

    /**
     * Creates a DataDynamicImage instance.
     * @name $commonWidgets.DataDynamicImage.create
     * @function
     * @param {$entity.FieldKey} urlFieldKey Field holding image URL.
     * @returns {$commonWidgets.DataDynamicImage}
     */

    /**
     * The DataDynamicImage is the data bound version of the DynamicImage.
     * Displays an image image based on the URL stored in a field in the cache.
     * Keeps the image in sync with the changes of the corresponding field.
     * @class
     * @extends $commonWidgets.DynamicImage
     * @extends $entity.EntityBound
     * @extends $commonWidgets.EntityWidget
     * @extends $commonWidgets.FieldBound
     */
    $commonWidgets.DataDynamicImage = self
        .addMethods(/** @lends $commonWidgets.DataDynamicImage# */{
            /**
             * @param {$entity.FieldKey} urlFieldKey
             * @ignore
             */
            init: function (urlFieldKey) {
                $assertion.isFieldKey(urlFieldKey, "Invalid field key");

                base.init.call(this);
                $entity.EntityBound.init.call(this);
                $commonWidgets.EntityWidget.init.call(this, urlFieldKey);
            },

            /** @ignore */
            afterAdd: function () {
                base.afterAdd.call(this);
                $commonWidgets.FieldBound.afterAdd.call(this);
            },

            /** @ignore */
            afterRemove: function () {
                base.afterRemove.call(this);
                $commonWidgets.FieldBound.afterRemove.call(this);
            },

            /**
             * @param {string} fieldValue
             * @returns {$commonWidgets.DataDynamicImage}
             * @ignore
             */
            setFieldValue: function (fieldValue) {
                this.setImageUrl(fieldValue.toImageUrl());
                return this;
            }
        });
});

$oop.postpone($commonWidgets, 'Button', function (ns, className, /**jQuery*/$) {
    "use strict";

    var base = $widget.Widget,
        self = base.extend(className)
            .addTraitAndExtend($commonWidgets.BinaryStateful)
            .addTrait($commonWidgets.Disableable);

    /**
     * Creates a Button instance.
     * @name $commonWidgets.Button.create
     * @function
     * @returns {$commonWidgets.Button}
     */

    /**
     * General purpose button widget.
     * Supports disabling and click events.
     * @class
     * @extends $widget.Widget
     * @extends $commonWidgets.BinaryStateful
     * @extends $commonWidgets.Disableable
     */
    $commonWidgets.Button = self
        .addMethods(/** @lends $commonWidgets.Button# */{
            /** @ignore */
            init: function () {
                base.init.call(this);
                $commonWidgets.BinaryStateful.init.call(this);
                $commonWidgets.Disableable.init.call(this);

                this.elevateMethod('onClick');
            },

            /** @ignore */
            afterAdd: function () {
                base.afterAdd.call(this);
                $commonWidgets.BinaryStateful.afterAdd.call(this);
            },

            /** @ignore */
            afterRender: function () {
                base.afterRender.call(this);
                $(this.getElement())
                    .on('click', this.onClick);
            },

            /** @ignore */
            afterRemove: function () {
                base.afterRemove.call(this);
                $commonWidgets.BinaryStateful.afterRemove.call(this);
            },

            /**
             * Clicks the button.
             * @returns {$commonWidgets.Button}
             */
            clickButton: function () {
                if (!this.isDisabled()) {
                    this.triggerSync($commonWidgets.EVENT_BUTTON_CLICK);
                }
                return this;
            },

            /**
             * @param {jQuery.Event} event
             * @ignore */
            onClick: function (event) {
                var link = $event.pushOriginalEvent(event);
                this.clickButton();
                link.unlink();
            }
        });
}, jQuery);

(function () {
    "use strict";

    $oop.addGlobalConstants.call($commonWidgets, /** @lends $commonWidgets */{
        /**
         * Signals that a Button was clicked.
         * @constants
         */
        EVENT_BUTTON_CLICK: 'widget.click.button'
    });
}());

$oop.postpone($commonWidgets, 'TextButton', function (ns, className) {
    "use strict";

    var base = $commonWidgets.Button,
        self = base.extend(className);

    /**
     * Creates a TextButton instance.
     * @name $commonWidgets.TextButton.create
     * @function
     * @returns {$commonWidgets.TextButton}
     */

    /**
     * The TextButton extends the Button with a Label that stores text, so the button might have text on it.
     * @class
     * @extends $commonWidgets.Button
     */
    $commonWidgets.TextButton = self
        .addMethods(/** @lends $commonWidgets.TextButton# */{
            /** @ignore */
            init: function () {
                base.init.call(this);

                this.spawnLabelWidget()
                    .setChildName('button-label')
                    .addToParent(this);
            },

            /**
             * Creates Label widget to be used inside the button.
             * Override to specify custom widget.
             * @returns {$commonWidgets.Label}
             */
            spawnLabelWidget: function () {
                return $commonWidgets.Label.create();
            },

            /**
             * Retrieves the label widget contained within the button.
             * @returns {$commonWidgets.Label}
             */
            getLabelWidget: function () {
                return this.getChild('button-label');
            },

            /**
             * Sets button caption.
             * Expects the caption widget to be a Label.
             * Override when caption widget is something other than Label.
             * @param {string} caption
             * @returns {$commonWidgets.TextButton}
             */
            setCaption: function (caption) {
                this.getChild('button-label')
                    .setLabelText(caption);

                return this;
            }
        });
});

$oop.postpone($commonWidgets, 'Dropdown', function (ns, className, /**jQuery*/$) {
    "use strict";

    var base = $widget.Widget,
        self = base.extend(className)
            .addTraitAndExtend($commonWidgets.AlignedPopup, 'Popup');

    /**
     * Creates a Dropdown instance.
     * @name $commonWidgets.Dropdown.create
     * @function
     * @returns {$commonWidgets.Dropdown}
     */

    /**
     * The Dropdown is a navigable list wrapped inside a popup.
     * The internal list can be of any List-based class, however, the Dropdown will only function properly
     * when the internal list has the OptionList trait, and its items have the Option trait.
     * The dropdown aligns to its parent widget's DOM using the settings provided via AlignedPopup.
     * By default, it will align its top left corner to the parent's bottom left corner.
     * The Dropdown controls scrolling of the internal list.
     * @class
     * @extends $widget.Widget
     * @extends $commonWidgets.AlignedPopup
     */
    $commonWidgets.Dropdown = self
        .addMethods(/** @lends $commonWidgets.Dropdown# */{
            /** @ignore */
            init: function () {
                base.init.call(this);
                $commonWidgets.AlignedPopup.init.call(this);

                this
                    .elevateMethod('onOptionFocus')
                    .elevateMethod('onOptionSelect')
                    .elevateMethod('onOptionsEscape');

                this.spawnListWidget()
                    .setChildName('options-list')
                    .addToParent(this);
            },

            /** @ignore */
            afterAdd: function () {
                base.afterAdd.call(this);
                $commonWidgets.AlignedPopup.afterAdd.call(this);

                this
                    .subscribeTo($commonWidgets.EVENT_OPTION_FOCUS, this.onOptionFocus)
                    .subscribeTo($commonWidgets.EVENT_OPTION_SELECT, this.onOptionSelect)
                    .subscribeTo($commonWidgets.EVENT_OPTIONS_ESCAPE, this.onOptionsEscape);
            },

            /** @ignore */
            afterRemove: function () {
                base.afterRemove.call(this);
                $commonWidgets.AlignedPopup.afterRemove.call(this);
            },

            /** @ignore */
            afterRender: function () {
                base.afterRender.call(this);
                $commonWidgets.AlignedPopup.afterRender.call(this);
            },

            /**
             * Creates the internal list widget.
             * Override this method to specify other List-based widgets to use.
             * Ones that have the OptionList trait, and its items have the Option trait, are the best.
             * @returns {$commonWidgets.List}
             */
            spawnListWidget: function () {
                return $commonWidgets.List.create();
            },

            /**
             * Retrieves the internal List instance.
             * @returns {$commonWidgets.List}
             */
            getListWidget: function () {
                return this.getChild('options-list');
            },

            /**
             * @param {$widget.WidgetEvent} event
             * @ignore
             */
            onOptionFocus: function (event) {
                var element = this.getElement();

                if (!element) {
                    return;
                }

                var $element = $(element),
                    dropdownHeight = $element.outerHeight(),
                    optionList = this.getChild('options-list'),
                    optionListTop = $element.scrollTop(),
                    $option = $(optionList.getChild(event.payload.optionName).getElement()),
                    optionHeight = $option.outerHeight(),
                    optionTop = $option.position().top,

                // whether option in focus overlaps with or touches the top of the dropdown
                    isTooHigh = optionTop < optionListTop,

                // whether option in focus overlaps with or touches the bottom of the dropdown
                    isTooLow = optionTop + optionHeight > optionListTop + dropdownHeight;

                if (isTooHigh) {
                    // positioning to top of dropdown
                    $element.scrollTop(optionTop);
                } else if (isTooLow) {
                    // positioning to bottom of dropdown
                    $element.scrollTop(optionTop + optionHeight - dropdownHeight);
                }
            },

            /**
             * TODO: Use giant events as soon as .getOriginalEventByName is available in giant-event.
             * @param {$widget.WidgetEvent} event
             * @ignore
             */
            onOptionSelect: function (event) {
                var originalEvent = event.getOriginalEventByType(jQuery.Event);

                if (originalEvent && (
                    originalEvent.type === 'click' ||
                    originalEvent.type === 'keydown' && originalEvent.which === 13
                    )) {
                    // only when select was initiated by user interaction (click on Option)
                    this.closePopup();
                }
            },

            /**
             * @ignore
             */
            onOptionsEscape: function () {
                this.closePopup();
            }
        });
}, jQuery);

$oop.postpone($commonWidgets, 'DataDropdown', function (ns, className) {
    "use strict";

    var base = $commonWidgets.Dropdown,
        self = base.extend(className)
            .addTrait($commonWidgets.EntityWidget);

    /**
     * Creates a DataDropdown instance.
     * @name $commonWidgets.DataDropdown.create
     * @function
     * @param {$entity.FieldKey} fieldKey
     * @returns {$commonWidgets.DataDropdown}
     */

    /**
     * The DataDropdown extends the functionality of the Dropdown with a List that is bound to a field in the cache.
     * @class
     * @extends $commonWidgets.Dropdown
     * @extends $commonWidgets.EntityWidget
     */
    $commonWidgets.DataDropdown = self
        .addMethods(/** @lends $commonWidgets.DataDropdown# */{
            /**
             * @param {$entity.FieldKey} fieldKey
             * @ignore
             */
            init: function (fieldKey) {
                $commonWidgets.EntityWidget.init.call(this, fieldKey);
                base.init.call(this);
            },

            /**
             * Creates a DataList for the dropdown to use as its internal option list.
             * To specify a custom DataList, you don't necessarily have to override the DataDropdown class,
             * only delegate a surrogate definition to $commonWidgets.DataList that points to your implementation.
             * @example
             * $commonWidgets.DataList.addSurrogate(myNameSpace, 'MyDataList', function (fieldKey) {
             *     return myCondition === true;
             * })
             * @returns {$commonWidgets.DataList}
             * @see $commonWidgets.Dropdown#spawnListWidget
             */
            spawnListWidget: function () {
                return $commonWidgets.DataList.create(this.entityKey);
            }
        });
});

$oop.postpone($commonWidgets, 'DropdownButton', function (ns, className) {
    "use strict";

    var base = $commonWidgets.TextButton,
        self = base.extend(className);

    /**
     * Creates a DropdownButton instance.
     * @name $commonWidgets.DropdownButton.create
     * @function
     * @returns {$commonWidgets.DropdownButton}
     */

    /**
     * The DropdownButton, when activated, pops up a dropdown, from which the user may select an option,
     * and the selected option will be set as the dropdown button's current caption.
     * The DropdownButton changes its state as the dropdown opens and closes.
     * @class
     * @extends $commonWidgets.TextButton
     */
    $commonWidgets.DropdownButton = self
        .addPrivateMethods(/** @lends $commonWidgets.DropdownButton# */{
            /** @private */
            _updateOpenStyle: function () {
                var dropdown = this.dropdown;
                if (dropdown && dropdown.isOpen) {
                    this
                        .removeCssClass('dropdown-closed')
                        .addCssClass('dropdown-open');
                } else {
                    this
                        .removeCssClass('dropdown-open')
                        .addCssClass('dropdown-closed');
                }
            }
        })
        .addMethods(/** @lends $commonWidgets.DropdownButton# */{
            /** @ignore */
            init: function () {
                base.init.call(this);

                this
                    .elevateMethod('onDropdownOpen')
                    .elevateMethod('onDropdownClose');

                /**
                 * Dropdown widget for showing the options.
                 * Must have instance-level reference to it since this widget will be removed and re-added
                 * to the widget hierarchy.
                 * @type {$commonWidgets.Dropdown}
                 */
                this.dropdown = this.spawnDropdownWidget()
                    .treatAsInside('#' + this.htmlAttributes.idAttribute)
                    .setChildName('dropdown-popup');
            },

            /** @ignore */
            afterAdd: function () {
                base.afterAdd.call(this);

                this._updateOpenStyle();

                this
                    .subscribeTo($commonWidgets.EVENT_POPUP_OPEN, this.onDropdownOpen)
                    .subscribeTo($commonWidgets.EVENT_POPUP_CLOSE, this.onDropdownClose);
            },

            /**
             * Creates dropdown widget.
             * Override to specify custom dropdown.
             * @returns {$commonWidgets.Dropdown}
             */
            spawnDropdownWidget: function () {
                return $commonWidgets.Dropdown.create();
            },

            /**
             * Retrieves Dropdown instance associated with DropdownButton.
             * @returns {$commonWidgets.Dropdown}
             */
            getDropdownWidget: function () {
                return this.getChild('dropdown-popup');
            },

            /**
             * @param {$widget.WidgetEvent} event
             * @ignore
             */
            onDropdownOpen: function (event) {
                if (event.sender === this.dropdown) {
                    this._updateOpenStyle();
                }
            },

            /**
             * @param {$widget.WidgetEvent} event
             * @ignore
             */
            onDropdownClose: function (event) {
                if (event.sender === this.dropdown) {
                    this._updateOpenStyle();
                }
            },

            /**
             * @param {jQuery.Event} event
             * @ignore
             */
            onClick: function (event) {
                base.onClick.call(this);

                var dropdown = this.dropdown,
                    link = $event.pushOriginalEvent(event);

                if (dropdown.isOpen) {
                    dropdown
                        .closePopup();
                } else {
                    dropdown
                        .addToParent(this)
                        .openPopup();
                }

                link.unlink();
            }
        });
});

$oop.postpone($commonWidgets, 'DataDropdownButton', function (ns, className) {
    "use strict";

    var base = $commonWidgets.DropdownButton,
        self = base.extend(className)
            .addTrait($entity.EntityBound)
            .addTrait($commonWidgets.EntityWidget);

    /**
     * @name $commonWidgets.DataDropdownButton.create
     * @function
     * @param {$entity.FieldKey} labelKey
     * @param {$entity.FieldKey} optionsKey
     * @returns {$commonWidgets.DataDropdownButton}
     */

    /**
     * TODO: Add documentation
     * @class
     * @extends $commonWidgets.DropdownButton
     * @extends $commonWidgets.EntityWidget
     */
    $commonWidgets.DataDropdownButton = self
        .addPrivateMethods(/** @lends $commonWidgets.DataDropdownButton# */{
            /** @private */
            _updateSelectedOption: function () {
                var optionValue = this.entityKey.toField().getValue(),
                    optionWidget = this.dropdown.getListWidget().getOptionByValue(optionValue),
                    dropdownWidget = this.getDropdownWidget();

                if (optionWidget && dropdownWidget) {
                    dropdownWidget.getListWidget()
                        .selectOption(optionWidget.childName);
                }
            }
        })
        .addMethods(/** @lends $commonWidgets.DataDropdownButton# */{
            /**
             * @param {$entity.FieldKey} selectedKey
             * @param {$entity.FieldKey} optionsKey
             * @ignore
             */
            init: function (selectedKey, optionsKey) {
                $assertion
                    .isFieldKey(selectedKey, "Invalid 'selected' field key")
                    .isFieldKey(optionsKey, "Invalid options field key");

                /**
                 * Field key that identifies the options
                 * @type {$entity.FieldKey}
                 */
                this.optionsKey = optionsKey;

                $commonWidgets.EntityWidget.init.call(this, selectedKey);
                base.init.call(this);
                $entity.EntityBound.init.call(this);

                this
                    .elevateMethod('onOptionSelect')
                    .elevateMethod('onListItemsChange');
            },

            /** @ignore */
            afterAdd: function () {
                base.afterAdd.call(this);

                this._updateSelectedOption();

                this
                    .bindToEntityChange(this.entityKey, 'onSelectedChange')
                    .subscribeTo($commonWidgets.EVENT_LIST_ITEMS_CHANGE, this.onListItemsChange)
                    .subscribeTo($commonWidgets.EVENT_OPTION_SELECT, this.onOptionSelect);
            },

            /** @ignore */
            afterRemove: function () {
                base.afterRemove.call(this);
                this.unbindAll();
            },

            /** @returns {$commonWidgets.DataLabel} */
            spawnLabelWidget: function () {
                return $commonWidgets.DataLabel.create(this.entityKey);
            },

            /** @returns {$commonWidgets.DataDropdown} */
            spawnDropdownWidget: function () {
                return $commonWidgets.DataDropdown.create(this.optionsKey);
            },

            /**
             * @ignore
             */
            onSelectedChange: function () {
                this._updateSelectedOption();
            },

            /**
             * @ignore
             */
            onListItemsChange: function () {
                this._updateSelectedOption();
            },

            /**
             * @param {$widget.WidgetEvent} event
             * @ignore
             */
            onOptionSelect: function (event) {
                var optionValue = event.payload.optionValue;
                this.entityKey.toField()
                    .setValue(optionValue);
            }
        });
});

$oop.postpone($commonWidgets, 'List', function (ns, className) {
    "use strict";

    var base = $widget.Widget,
        self = base.extend(className);

    /**
     * Creates a List instance.
     * @name $commonWidgets.List.create
     * @function
     * @returns {$commonWidgets.List}
     */

    /**
     * The List is an aggregation of other widgets.
     * By default, it maps to the <em>ul</em> and <em>li</em> HTML elements, but that can be changed by subclassing.
     * Item order follows the normal ordering child widgets, ie. in the order of their names.
     * @class
     * @extends $widget.Widget
     */
    $commonWidgets.List = self
        .addMethods(/** @lends $commonWidgets.List# */{
            /** @ignore */
            init: function () {
                base.init.call(this);
                this.setTagName('ul');
            },

            /**
             * Adds a widget to the list as its item.
             * Changes the specified widget's tag name to 'li'.
             * @param itemWidget
             * @returns {$commonWidgets.List}
             */
            addItemWidget: function (itemWidget) {
                itemWidget
                    .setTagName('li')
                    .addToParent(this);

                return this;
            }
        });
});

(function () {
    "use strict";

    $oop.addGlobalConstants.call($commonWidgets, /** @lends $commonWidgets */{
        /**
         * Signals that the items in a List have changed.
         * @constant
         */
        EVENT_LIST_ITEMS_CHANGE: 'widget.change.items'
    });
}());

$oop.postpone($commonWidgets, 'DataList', function (ns, className) {
    "use strict";

    var base = $commonWidgets.List,
        self = base.extend(className)
            .addTrait($entity.EntityBound)
            .addTrait($commonWidgets.EntityWidget)
            .addTraitAndExtend($commonWidgets.FieldBound);

    /**
     * Creates a DataList instance.
     * @name $commonWidgets.DataList.create
     * @function
     * @param {$entity.FieldKey} fieldKey Key to an ordered reference collection.
     * @returns {$commonWidgets.DataList}
     */

    /**
     * The DataList maintains a list of widgets based on a collection field in the cache.
     * Keeps list in sync with the changes of the corresponding collection.
     * Expects to be bound to an *ordered* collection.
     * Expects to have items that are also EntityWidgets.
     * TODO: Add unit tests.
     * @class
     * @extends $commonWidgets.List
     * @extends $entity.EntityBound
     * @extends $commonWidgets.EntityWidget
     * @extends $commonWidgets.FieldBound
     */
    $commonWidgets.DataList = self
        .addPrivateMethods(/** @lends $commonWidgets.DataList# */{
            /**
             * @param {string} childName
             * @param {$entity.ItemKey} itemKey
             * @private
             * @memberOf $commonWidgets.DataList
             */
            _getSetKey: function (childName, itemKey) {
                return childName + '|' + itemKey.toString();
            },

            /**
             * @param {$entity.ItemKey} itemKey
             * @returns {$widget.Widget}
             * @private
             */
            _spawnPreparedItemWidget: function (itemKey) {
                return this.spawnItemWidget(itemKey)
                    .setItemKey(itemKey)
                    .setChildName(this.spawnItemName(itemKey));
            },

            /**
             * @param {$entity.ItemKey} itemKey
             * @private
             */
            _addItem: function (itemKey) {
                var oldChildName = this.childNamesByItemKey.getItem(itemKey.toString());

                if (oldChildName) {
                    // renaming existing item widget
                    this.getChild(oldChildName)
                        .setChildName(this.spawnItemName(itemKey));
                } else {
                    // adding new item widget
                    this.addItemWidget(this._spawnPreparedItemWidget(itemKey));
                }
            },

            /**
             * @param {$entity.ItemKey} itemKey
             * @private
             */
            _removeItem: function (itemKey) {
                var childName = this.childNamesByItemKey.getItem(itemKey.toString());
                if (childName) {
                    this.getChild(childName).removeFromParent();
                }
            },

            /** @private */
            _initChildLookup: function () {
                this.childNamesByItemKey = this.children
                    .mapKeys(function (childWidget) {
                        return childWidget.itemKey.toString();
                    })
                    .mapValues(function (childWidget) {
                        return childWidget.childName;
                    });
            }
        })
        .addMethods(/** @lends $commonWidgets.DataList# */{
            /**
             * @param {$entity.FieldKey} fieldKey
             * @ignore
             */
            init: function (fieldKey) {
                $assertion.isFieldKey(fieldKey, "Invalid field key");

                base.init.call(this);
                $entity.EntityBound.init.call(this);
                $commonWidgets.EntityWidget.init.call(this, fieldKey);

                this
                    .elevateMethod('onItemAdd')
                    .elevateMethod('onItemRemove');

                /**
                 * Lookup associating item keys with widget (child) names.
                 * @type {$data.Collection}
                 */
                this.childNamesByItemKey = $data.Collection.create();
            },

            /** @ignore */
            afterAdd: function () {
                base.afterAdd.call(this);
                $commonWidgets.FieldBound.afterAdd.call(this);

                this._initChildLookup();

                this
                    .subscribeTo($commonWidgets.EVENT_DATA_LIST_ITEM_ADD, this.onItemAdd)
                    .subscribeTo($commonWidgets.EVENT_DATA_LIST_ITEM_REMOVE, this.onItemRemove)
                    .bindToEntityContentChange(this.entityKey, 'onItemChange');
            },

            /** @ignore */
            afterRemove: function () {
                base.afterRemove.call(this);
                $commonWidgets.FieldBound.afterRemove.call(this);
            },

            /**
             * Creates item widget for the specified item key.
             * To specify a custom widget class, either override this method in a subclass, or provide
             * a surrogate definition on DataLabel, in case the custom item widget is also DataLabel-based.
             * @param {$entity.ItemKey} itemKey
             * @returns {$widget.Widget}
             */
            spawnItemWidget: function (itemKey) {
                return $commonWidgets.ItemDataLabel.create(itemKey, itemKey)
                    .setChildName(this.spawnItemName(itemKey));
            },

            /**
             * Retrieves the item childName associated with the specified itemKey. (Child name determines order.)
             * To specify custom child name for item widgets, override this method.
             * @param {$entity.ItemKey} itemKey
             * @returns {string}
             */
            spawnItemName: function (itemKey) {
                return itemKey.itemId;
            },

            /**
             * Fetches item widget by item key.
             * @param {$entity.ItemKey} itemKey
             * @returns {$widget.Widget}
             */
            getItemWidgetByKey: function (itemKey) {
                var childName = this.childNamesByItemKey.getItem(itemKey.toString());
                return this.getChild(childName);
            },

            /**
             * @param {object} fieldValue
             * @returns {$commonWidgets.DataList}
             * @ignore
             */
            setFieldValue: function (fieldValue) {
                var that = this,
                    fieldKey = this.entityKey,
                    itemsWidgetsBefore = this.children
                        .mapKeys(function (itemWidget, childName) {
                            return that._getSetKey(childName, itemWidget.itemKey);
                        })
                        .toSet(),
                    itemsKeysAfter = $data.Collection.create(fieldValue)
                        .mapValues(function (itemValue, itemId) {
                            return fieldKey.getItemKey(itemId);
                        })
                        .mapKeys(function (itemKey) {
                            return that._getSetKey(that.spawnItemName(itemKey), itemKey);
                        })
                        .toSet(),
                    itemWidgetsToRemove = itemsWidgetsBefore.subtract(itemsKeysAfter)
                        .toWidgetCollection(),
                    itemKeysToAdd = itemsKeysAfter.subtract(itemsWidgetsBefore),
                    itemWidgetsToAdd = itemKeysToAdd
                        .toCollection()
                        .mapValues(function (itemKey) {
                            return that._spawnPreparedItemWidget(itemKey);
                        });

                // removing tiles that are no longer on the page
                itemWidgetsToRemove
                    .removeFromParent();

                // revealing new tiles
                itemWidgetsToAdd
                    .passEachItemTo(this.addItemWidget, this);

                this.spawnEvent($commonWidgets.EVENT_LIST_ITEMS_CHANGE)
                    .setPayloadItems({
                        itemsRemoved: itemWidgetsToRemove,
                        itemsAdded  : itemWidgetsToAdd
                    })
                    .triggerSync();

                return this;
            },

            /**
             * @param {$widget.WidgetEvent} event
             * @ignore
             */
            onItemAdd: function (event) {
                var childWidget;

                if (event.sender === this) {
                    childWidget = event.payload.childWidget;

                    // when child is already associated with an item key
                    this.childNamesByItemKey
                        .setItem(childWidget.itemKey.toString(), childWidget.childName);
                }
            },

            /**
             * @param {$widget.WidgetEvent} event
             * @ignore
             */
            onItemRemove: function (event) {
                var childWidget;

                if (event.sender === this) {
                    childWidget = event.payload.childWidget;

                    // updating lookup buffers
                    this.childNamesByItemKey
                        .deleteItem(childWidget.itemKey.toString());
                }
            },

            /**
             * @param {$entity.EntityChangeEvent} event
             * @ignore
             */
            onItemChange: function (event) {
                var itemKey = event.sender;
                if (itemKey.isA($entity.ItemKey)) {
                    if (event.beforeNode !== undefined && event.afterNode === undefined) {
                        // item was removed
                        this._removeItem(itemKey);
                    } else if (event.afterNode !== undefined) {
                        // item was added
                        this._addItem(itemKey);
                    }
                }
            }
        });
});

$oop.postpone($commonWidgets, 'Flow', function (ns, className) {
    "use strict";

    var base = $commonWidgets.List,
        self = base.extend(className);

    /**
     * Creates a Flow instance.
     * @name $commonWidgets.Flow.create
     * @function
     * @returns {$commonWidgets.Flow}
     */

    /**
     * The Flow allows to navigate between a set of stage widgets.
     * @class
     * @extends $commonWidgets.List
     */
    $commonWidgets.Flow = self
        .addMethods(/** @lends $commonWidgets.Flow# */{
            /** @ignore */
            init: function () {
                base.init.call(this);

                /**
                 * Identifies current stage.
                 * Name of the stage widget that is currently in focus.
                 * @type {string}
                 */
                this.currentStageName = undefined;

                /**
                 * Collection of available stage widgets.
                 * @type {$widget.WidgetCollection}
                 */
                this.stages = $widget.WidgetCollection.create();
            },

            /**
             * Retrieves stage widget the flow is currently at.
             * @returns {$widget.Widget}
             */
            getCurrentStage: function () {
                return this.stages.getItem(this.currentStageName);
            },

            /**
             * Adds a stage to the flow.
             * Adds various CSS classes to the specified stage widget.
             * @param {string} stageName
             * @param {$widget.Widget} stageWidget
             * @returns {$commonWidgets.Flow}
             */
            addStage: function (stageName, stageWidget) {
                this.stages.setItem(stageName, stageWidget
                    .addCssClass(stageName)
                    .addCssClass('flow-stage'));
                return this;
            },

            /**
             * Goes to the specified stage.
             * @param {string} stageName
             * @returns {$commonWidgets.Flow}
             */
            goToStage: function (stageName) {
                var stages = this.stages,
                    currentStage = stages.getItem(this.currentStageName),
                    stageWidget = stages.getItem(stageName);

                $assertion.assert(!!stageWidget, "Invalid stage name");

                // applying new stage
                if (currentStage) {
                    currentStage.removeFromParent();
                }
                this.addItemWidget(stageWidget);

                // updating instance property
                this.currentStageName = stageName;

                return this;
            }
        });
});

$oop.postpone($commonWidgets, 'Page', function (ns, className, /**jQuery*/$) {
    "use strict";

    var base = $widget.Widget,
        self = base.extend(className)
            .addTraitAndExtend($commonWidgets.BinaryStateful)
            .addTrait($commonWidgets.Disableable);

    /**
     * Creates a Page instance.
     * @name $commonWidgets.Page.create
     * @function
     * @returns {$commonWidgets.Page}
     */

    /**
     * The Page class endows all pages with basic features, such as
     * adding relevant CSS classes to the <em>body</em> element.
     * Subclass to create page classes, and add them to he hierarchy as root.
     * @example
     * MyPage.create().setRootWidget();
     * @class
     * @extends $widget.Widget
     * @extends $commonWidgets.BinaryStateful
     * @extends $commonWidgets.Disableable
     */
    $commonWidgets.Page = self
        .addPrivateMethods(/** @lends $commonWidgets.Page# */{
            /**
             * @returns {$data.Collection}
             * @private
             */
            _getPageCssClasses: function () {
                return this.getBase().htmlAttributes.cssClasses
                    .mapValues(function (refCount, className) {
                        return 'page-' + className;
                    });
            }
        })
        .addMethods(/** @lends $commonWidgets.Page# */{
            /** @ignore */
            init: function () {
                base.init.call(this);
                $commonWidgets.BinaryStateful.init.call(this);
                $commonWidgets.Disableable.init.call(this);
            },

            /** @ignore */
            afterAdd: function () {
                base.afterAdd.call(this);
                $commonWidgets.BinaryStateful.afterAdd.call(this);

                var documentBody = $commonWidgets.DocumentBody.create();

                this._getPageCssClasses()
                    .passEachItemTo(documentBody.addCssClass, documentBody);
            },

            /** @ignore */
            afterRemove: function () {
                base.afterRemove.call(this);
                $commonWidgets.BinaryStateful.afterRemove.call(this);

                var documentBody = $commonWidgets.DocumentBody.create();

                this._getPageCssClasses()
                    .passEachItemTo(documentBody.decreaseCssClassRefCount, documentBody);
            }
        });
}, jQuery);

$oop.postpone($commonWidgets, 'Input', function (ns, className, /**jQuery*/$) {
    "use strict";

    var base = $widget.Widget,
        self = base.extend(className);

    /**
     * Creates an Input instance.
     * @name $commonWidgets.Input.create
     * @function
     * @param {string} inputType Corresponds to the input tag's type argument.
     * @returns {$commonWidgets.Input}
     */

    /**
     * The Input is the base class for all input widgets: text, checkbox, radio button, etc.
     * Inputs can be validated by supplying a validator function.
     * @class
     * @extends $widget.Widget
     */
    $commonWidgets.Input = self
        .addConstants(/** @lends $commonWidgets.Input */{
            /**
             * @type {object}
             * @constant
             */
            inputTagNames: {
                'input'   : 'input',
                'textarea': 'textarea',
                'select'  : 'select'
            },

            /**
             * @type {object}
             * @constant
             */
            inputTypes: {
                // basic input types
                'button'  : 'button',
                'checkbox': 'checkbox',
                'file'    : 'file',
                'hidden'  : 'hidden',
                'image'   : 'image',
                'password': 'password',
                'radio'   : 'radio',
                'reset'   : 'reset',
                'submit'  : 'submit',
                'text'    : 'text',

                // HTML 5 types
                'color'         : 'color',
                'date'          : 'date',
                'datetime'      : 'datetime',
                'datetime-local': 'datetime-local',
                'email'         : 'email',
                'month'         : 'month',
                'number'        : 'number',
                'range'         : 'range',
                'search'        : 'search',
                'tel'           : 'tel',
                'time'          : 'time',
                'url'           : 'url',
                'week'          : 'week'
            }
        })
        .addPrivateMethods(/** @lends $commonWidgets.Input# */{
            /**
             * @param {*} inputValue
             * @private
             */
            _setInputValue: function (inputValue) {
                this.addAttribute('value', typeof inputValue === 'undefined' ? '' : inputValue);
                this.inputValue = inputValue;
            },

            /** @private */
            _updateDom: function () {
                var element = this.getElement();
                if (element) {
                    $(element).val(this.inputValue);
                }
            },

            /**
             * Triggers change event depending on the current and previous input value.
             * @param {string} oldInputValue Input value before the last change
             * @private
             */
            _triggerChangeEvent: function (oldInputValue) {
                var newInputValue = this.inputValue;

                if (oldInputValue !== newInputValue) {
                    this.spawnEvent($commonWidgets.EVENT_INPUT_VALUE_CHANGE)
                        .setPayloadItems({
                            oldInputValue: oldInputValue,
                            newInputValue: newInputValue
                        })
                        .triggerSync();
                }
            }
        })
        .addMethods(/** @lends $commonWidgets.Input# */{
            /**
             * @param {string} inputType
             * @ignore
             */
            init: function (inputType) {
                $assertion.isInputType(inputType, "Invalid input type");

                base.init.call(this);

                this.elevateMethod('onValueChange');

                /**
                 * Whether input can submit form on enter.
                 * @type {boolean}
                 */
                this.canSubmit = true;

                /**
                 * Current value of the input.
                 * @type {*}
                 */
                this.inputValue = undefined;

                /**
                 * Function that validates the input's value.
                 * Receives the input value as argument and is expected to return undefined when it's valid,
                 * any other value when it's not. Return value will be stored as instance property (lastValidationError)
                 * as well as passed to the validity event as payload.
                 * @type {function}
                 */
                this.validatorFunction = undefined;

                /**
                 * Return value of validatorFunction following the latest input value change.
                 * @type {*}
                 */
                this.lastValidationError = true;

                if (this.inputTagNames[inputType] === inputType) {
                    // setting tag name for input
                    this.setTagName(inputType);
                } else if (this.inputTypes[inputType] === inputType) {
                    // setting input attribute
                    this.setTagName('input')
                        .addAttribute('type', inputType);
                }
            },

            /** @ignore */
            afterAdd: function () {
                base.afterAdd.call(this);
                this.validateInputValue();
                this.subscribeTo($commonWidgets.EVENT_INPUT_VALUE_CHANGE, this.onValueChange);
            },

            /**
             * Sets whether the input can signal to submit the form (if it is in a form).
             * @param {boolean} canSubmit
             * @returns {$commonWidgets.Input}
             */
            setCanSubmit: function (canSubmit) {
                this.canSubmit = canSubmit;
                return this;
            },

            /**
             * Determines whether the input value is currently valid.
             * Input value is valid when the last validation error was undefined.
             * @returns {boolean}
             */
            isValid: function () {
                return this.lastValidationError === undefined;
            },

            /**
             * Sets input value and triggers events.
             * @param {*} inputValue
             * @param {boolean} [updateDom]
             * @returns {$commonWidgets.Input}
             */
            setInputValue: function (inputValue, updateDom) {
                var oldInputValue = this.inputValue;

                this._setInputValue(inputValue);

                if (updateDom) {
                    this._updateDom();
                }

                this._triggerChangeEvent(oldInputValue);

                return this;
            },

            /**
             * Clears input value and triggers events.
             * @param {boolean} [updateDom]
             * @returns {$commonWidgets.Input}
             */
            clearInputValue: function (updateDom) {
                this.setInputValue(undefined, updateDom);
                return this;
            },

            /**
             * Sets validator function. The validator function will be passed the current input value
             * and is expected to return a validation error (code or message) or undefined.
             * @param {function} validatorFunction
             * @returns {$commonWidgets.Input}
             * @see $commonWidgets.Input#validatorFunction
             */
            setValidatorFunction: function (validatorFunction) {
                $assertion.isFunction(validatorFunction, "Invalid validatorFunction function");
                this.validatorFunction = validatorFunction;
                return this;
            },

            /**
             * Updates the validity of the current input value, and triggers validity events accordingly.
             * TODO: Manage validity separately from validationError. Validity should start out as undefined
             * and could take values true or false.
             * @returns {$commonWidgets.Input}
             */
            validateInputValue: function () {
                // validating current value
                var validatorFunction = this.validatorFunction,
                    oldValidationError = this.lastValidationError,
                    newValidationError = validatorFunction && validatorFunction(this.inputValue),
                    wasValid = this.isValid(),
                    isValid = newValidationError === undefined;

                // storing last validation error on instance
                this.lastValidationError = newValidationError;

                // triggering validation event
                if (wasValid && !isValid) {
                    // input just became invalid
                    this.spawnEvent($commonWidgets.EVENT_INPUT_INVALID)
                        .setPayloadItem('newValidationError', newValidationError)
                        .triggerSync();
                } else if (!wasValid && isValid) {
                    // input just became valid
                    this.triggerSync($commonWidgets.EVENT_INPUT_VALID);
                } else if (newValidationError !== oldValidationError) {
                    // triggering event about error change
                    this.spawnEvent($commonWidgets.EVENT_INPUT_ERROR_CHANGE)
                        .setPayloadItems({
                            oldValidationError: oldValidationError,
                            newValidationError: newValidationError
                        })
                        .triggerSync();
                }

                return this;
            },

            /**
             * Focuses on the current input.
             * @returns {$commonWidgets.Input}
             */
            focusOnInput: function () {
                var element = this.getElement();
                if (element) {
                    $(element).focus();
                }
                return this;
            },

            /**
             * Removes focus from the current input.
             * @returns {$commonWidgets.Input}
             */
            blurInput: function () {
                var element = this.getElement();
                if (element) {
                    $(element).focusout();
                }
                return this;
            },

            /**
             * Tells whether current input has the focus.
             * @returns {boolean}
             */
            isFocused: function () {
                var element = this.getElement();
                return element && element === document.activeElement;
            },

            /**
             * Called when input value change is detected on the widget level.
             * Updates value attribute and validity, triggers further widget events.
             * @param {$widget.WidgetEvent} event
             * @ignore
             */
            onValueChange: function (event) {
                var payload = event.payload,
                    oldInputValue = payload.oldInputValue,
                    newInputValue = payload.newInputValue;

                this._setInputValue(newInputValue);

                this.validateInputValue();

                if (newInputValue && !oldInputValue) {
                    this.triggerSync($commonWidgets.EVENT_INPUT_GOT_VALUE);
                } else if (!newInputValue && oldInputValue) {
                    this.triggerSync($commonWidgets.EVENT_INPUT_LOST_VALUE);
                }
            }
        });
}, jQuery);

(function () {
    "use strict";

    $oop.addGlobalConstants.call($commonWidgets, /** @lends $commonWidgets */{
        /**
         * Signals that an Input went from not having a value to having one.
         * @constant
         */
        EVENT_INPUT_GOT_VALUE: 'widget.value.on.input',

        /**
         * Signals that an Input went from having a value to not having one.
         * @constant
         */
        EVENT_INPUT_LOST_VALUE: 'widget.value.off.input',

        /**
         * Signals that an Input came into focus.
         * @constant
         */
        EVENT_INPUT_FOCUS: 'widget.focus.on.input',

        /**
         * Signals that an Input lost focus.
         * @constant
         */
        EVENT_INPUT_BLUR: 'widget.focus.off.input',

        /**
         * Signals that the user pressed TAB while an Input was in focus.
         * @constant
         */
        EVENT_INPUT_TAB: 'widget.press.tab.input',

        /**
         * Signals that the value of an Input changed.
         * @constant
         */
        EVENT_INPUT_VALUE_CHANGE: 'widget.value.change.input',

        /**
         * Signals that an Input went from invalid to valid.
         * @constant
         */
        EVENT_INPUT_VALID: 'widget.validity.on.input',

        /**
         * Signals that an Input went from valid to invalid.
         * @constant
         */
        EVENT_INPUT_INVALID: 'widget.validity.off.input',

        /**
         * Signals that the error associated with an Input changed.
         * @constant
         */
        EVENT_INPUT_ERROR_CHANGE: 'widget.error.change.input',

        /**
         * Signals a form submission initiated on an Input.
         * @constant
         */
        EVENT_INPUT_SUBMIT: 'widget.submit.input'
    });
}());

(function () {
    "use strict";

    $assertion.addTypes(/** @lends $commonWidgets */{
        /** @param {string} expr */
        isInputType: function (expr) {
            return expr &&
                ($commonWidgets.Input.inputTagNames[expr] === expr ||
                $commonWidgets.Input.inputTypes[expr] === expr);
        },

        /** @param {string} expr */
        isInputTypeOptional: function (expr) {
            return $commonWidgets.Input.inputTagNames[expr] === expr ||
                $commonWidgets.Input.inputTypes[expr] === expr;
        }
    });
}());

$oop.postpone($commonWidgets, 'TextInput', function (ns, className, /**jQuery*/$) {
    "use strict";

    var base = $commonWidgets.Input,
        self = base.extend(className)
            .addTrait($widget.JqueryWidget);

    /**
     * Creates a TextInput instance.
     * PasswordInput instance may also be created by instantiating `$commonWidgets.Input` with the type 'text'.
     * @name $commonWidgets.TextInput.create
     * @function
     * @param {string} [textInputType]
     * @returns {$commonWidgets.TextInput}
     */

    /**
     * The TextInput extends the Input for text input specifically.
     * Implements mostly UI event handlers, and channels them into widget events.
     * Also delegates surrogate to Input: instantiating an Input with 'type'='text' will yield a TextInput instance.
     * @class
     * @extends $commonWidgets.Input
     * @extends $widget.JqueryWidget
     */
    $commonWidgets.TextInput = self
        .addConstants(/** @lends $commonWidgets.Input */{
            /**
             * @type {object}
             * @constant
             */
            inputTagNames: {
                'input'   : 'input',
                'textarea': 'textarea'
            },

            /**
             * @type {object}
             * @constant
             */
            inputTypes: {
                // basic input types
                password: 'password',
                text    : 'text',

                // HTML 5 types
                email   : 'email',
                number  : 'number',
                search  : 'search',
                tel     : 'tel',
                url     : 'url'
            }
        })
        .addPrivateMethods(/** @lends $commonWidgets.TextInput# */{
            /** @private */
            _startChangePolling: function () {
                var that = this;
                this.changePollTimer = setInterval(function () {
                    var element = that.getElement();
                    if (element) {
                        that.setInputValue($(element).val(), false);
                    }
                }, 1000);
            },

            /** @private */
            _stopChangePolling: function () {
                var changePollTimer = this.changePollTimer;
                if (changePollTimer) {
                    clearInterval(changePollTimer);
                    this.changePollTimer = undefined;
                }
            }
        })
        .addMethods(/** @lends $commonWidgets.TextInput# */{
            /**
             * @param {string} textInputType
             * @ignore
             */
            init: function (textInputType) {
                $assertion.isTextInputTypeOptional(textInputType, "Invalid text input type");

                base.init.call(this, textInputType || 'text');

                this
                    .elevateMethod('onFocusIn')
                    .elevateMethod('onFocusOut')
                    .setCanSubmit(textInputType !== 'textarea');

                /**
                 * Timer for polling for input changes.
                 * @type {number}
                 */
                this.changePollTimer = undefined;

                // setting default input value to empty string
                this.inputValue = '';
            },

            /** @ignore */
            afterRemove: function () {
                base.afterRemove.call(this);

                if ($commonWidgets.pollInputValues) {
                    this._stopChangePolling();
                }
            },

            /** @ignore */
            afterRender: function () {
                base.afterRender.call(this);

                // TODO: use JqueryWidget based subscription when it's fixed
                var element = this.getElement();

                if (element) {
                    $(element)
                        .on('focusin', this.onFocusIn)
                        .on('focusout', this.onFocusOut);
                }

                if ($commonWidgets.pollInputValues) {
                    this._stopChangePolling();
                    this._startChangePolling();
                }
            },

            /**
             * @param {jQuery.Event} event
             * @ignore
             */
            onKeyDown: function (event) {
                var link = $event.pushOriginalEvent(event);

                switch (event.which) {
                case 13:
                    if (this.canSubmit) {
                        // signaling that the input is attempting to submit the form
                        this.triggerSync($commonWidgets.EVENT_INPUT_SUBMIT);
                    }
                    break;

                case 9:
                    this.triggerSync($commonWidgets.EVENT_INPUT_TAB);
                    break;
                }

                link.unlink();
            },

            /**
             * Triggered on onkeyup, oninput, and onchange.
             * However, does not trigger Input event unless the value actually changed.
             * @param {jQuery.Event} event
             * @ignore
             */
            onChange: function (event) {
                var link = $event.pushOriginalEvent(event),
                    element = this.getElement(),
                    newInputValue;

                if (element) {
                    newInputValue = $(element).val();
                    this.setInputValue(newInputValue);
                }

                link.unlink();
            },

            /**
             * @param {$widget.WidgetEvent} event
             * @ignore
             */
            onFocusIn: function (event) {
                var link = $event.pushOriginalEvent(event);
                this.triggerSync($commonWidgets.EVENT_INPUT_FOCUS);
                link.unlink();
            },

            /**
             * @param {$widget.WidgetEvent} event
             * @ignore
             */
            onFocusOut: function (event) {
                var link = $event.pushOriginalEvent(event);
                this.triggerSync($commonWidgets.EVENT_INPUT_BLUR);
                link.unlink();
            }
        });

    self
        .on('keydown', '', 'onKeyDown')
        .on('keyup input change', '', 'onChange');
}, jQuery);

$oop.amendPostponed($commonWidgets, 'Input', function () {
    "use strict";

    $commonWidgets.Input
        .addSurrogate($commonWidgets, 'TextInput', function (inputType) {
            var TextInput = $commonWidgets.TextInput;
            return TextInput.inputTagNames[inputType] === inputType ||
                   TextInput.inputTypes[inputType] === inputType;
        });
});

(function () {
    "use strict";

    $assertion.addTypes(/** @lends $commonWidgets */{
        /** @param {string} expr */
        isTextInputType: function (expr) {
            var TextInput = $commonWidgets.TextInput;
            return expr &&
                   (TextInput.inputTagNames[expr] === expr ||
                    TextInput.inputTypes[expr] === expr);
        },

        /** @param {string} expr */
        isTextInputTypeOptional: function (expr) {
            var TextInput = $commonWidgets.TextInput;
            return TextInput.inputTypes[expr] === expr ||
                   TextInput.inputTagNames[expr] === expr;
        }
    });
}());

$oop.postpone($commonWidgets, 'DataTextInput', function (ns, className) {
    "use strict";

    var base = $commonWidgets.TextInput,
        self = base.extend(className)
            .addTrait($entity.EntityBound)
            .addTrait($commonWidgets.EntityWidget)
            .addTraitAndExtend($commonWidgets.FieldBound);

    /**
     * Creates a DataTextInput instance.
     * @name $commonWidgets.DataTextInput.create
     * @function
     * @param {$entity.FieldKey} inputFieldKey
     * @returns {$commonWidgets.DataTextInput}
     */

    /**
     * The DataTextInput adds data binding to TextInput, reflecting the value of a field in the cache.
     * Keeps the value of the input field in sync with the changes of the cache field.
     * @class
     * @extends $commonWidgets.TextInput
     * @extends $entity.EntityBound
     * @extends $commonWidgets.EntityWidget
     * @extends $commonWidgets.FieldBound
     */
    $commonWidgets.DataTextInput = self
        .addMethods(/** @lends $commonWidgets.DataTextInput# */{
            /**
             * @param {$entity.FieldKey} inputFieldKey
             * @ignore
             */
            init: function (inputFieldKey) {
                base.init.call(this);
                $entity.EntityBound.init.call(this);
                $commonWidgets.EntityWidget.init.call(this, inputFieldKey);
            },

            /** @ignore */
            afterAdd: function () {
                base.afterAdd.call(this);
                $commonWidgets.FieldBound.afterAdd.call(this);
            },

            /** @ignore */
            afterRemove: function () {
                base.afterRemove.call(this);
                $commonWidgets.FieldBound.afterRemove.call(this);
            },

            /**
             * @param {*} fieldValue
             * @returns {$commonWidgets.DataTextInput}
             * @ignore
             */
            setFieldValue: function (fieldValue) {
                this.setInputValue(typeof fieldValue === 'undefined' ? fieldValue : String(fieldValue), true);
                return this;
            }
        });
});

$oop.postpone($commonWidgets, 'PasswordInput', function (ns, className) {
    "use strict";

    var base = $commonWidgets.TextInput,
        self = base.extend(className);

    /**
     * Creates a PasswordInput instance.
     * PasswordInput instance may also be created by instantiating `$commonWidgets.Input` with the type 'password'.
     * @name $commonWidgets.PasswordInput.create
     * @function
     * @returns {$commonWidgets.PasswordInput}
     */

    /**
     * The PasswordInput extends TextInput with the option that its input type will be set to 'password'.
     * Supports revealing and obscuring the entered password.
     * Also delegates surrogate to Input: instantiating an Input with 'type'='password' will yield a PasswordInput instance.
     * @class
     * @extends $commonWidgets.TextInput
     */
    $commonWidgets.PasswordInput = self
        .addMethods(/** @lends $commonWidgets.PasswordInput# */{
            /** @ignore */
            init: function () {
                base.init.call(this, 'password');
            },

            /**
             * Reveals password by changing the input type to 'text', and re-rendering the widget.
             * @returns {$commonWidgets.PasswordInput}
             */
            revealPassword: function () {
                if (this.htmlAttributes.getItem('type') === 'password') {
                    this.addAttribute('type', 'text');

                    if (this.getElement()) {
                        this.reRender();
                    }
                }
                return this;
            },

            /**
             * Obscures password by changing the input type to 'password', and re-rendering the widget.
             * @returns {$commonWidgets.PasswordInput}
             */
            obscurePassword: function () {
                if (this.htmlAttributes.getItem('type') !== 'password') {
                    this.addAttribute('type', 'password');

                    if (this.getElement()) {
                        this.reRender();
                    }
                }
                return this;
            },

            /**
             * Determines whether the password input is currently revealed.
             * @returns {boolean}
             */
            isPasswordRevealed: function () {
                return this.htmlAttributes.getItem('type') !== 'password';
            }
        });
});

$oop.amendPostponed($commonWidgets, 'Input', function () {
    "use strict";

    $commonWidgets.Input
        .addSurrogate($commonWidgets, 'PasswordInput', function (inputType) {
            return inputType === 'password';
        });
});

$oop.postpone($commonWidgets, 'FormField', function (ns, className) {
    "use strict";

    var base = $widget.Widget,
        self = base.extend(className);

    /**
     * Creates a FormField instance.
     * @name $commonWidgets.FormField.create
     * @function
     * @param {string} [inputType] Corresponds to the input tag's type argument. Defaults to 'text'.
     * @returns {$commonWidgets.FormField}
     */

    /**
     * Represents a single field inside the form, with input and other accompanying controls,
     * such as comment and warning.
     * Supports enabling/disabling TAB keys.
     * TODO: add create... methods for comment and warning, too
     * @class
     * @extends $widget.Widget
     */
    $commonWidgets.FormField = self
        .addMethods(/** @lends $commonWidgets.FormField# */{
            /**
             * @param {string} [inputType]
             * @ignore
             */
            init: function (inputType) {
                $assertion.isInputTypeOptional(inputType, "Invalid input type");

                base.init.call(this);

                this
                    .elevateMethod('onInputBlur')
                    .elevateMethod('onInputTab')
                    .elevateMethod('onInputValid')
                    .elevateMethod('onFormReset');

                /**
                 * Whether the field allows to move to the next tab index.
                 * @type {boolean}
                 */
                this.allowsTabForwards = true;

                /**
                 * Whether the field allows to move to the previous tab index.
                 * @type {boolean}
                 */
                this.allowsTabBackwards = true;

                /**
                 * Type attribute of the input field.
                 * @type {string}
                 */
                this.inputType = inputType || 'text';

                /**
                 * Widget that optionally displays a comment associated with the input field.
                 * @type {$commonWidgets.Label}
                 */
                this.commentLabel = $commonWidgets.Label.create()
                    .setChildName('field-comment');

                /**
                 * Widget that displays a warning message whenever input validation fails.
                 * @type {$commonWidgets.Label}
                 */
                this.warningLabel = $commonWidgets.Label.create()
                    .setChildName('field-warning');

                this.spawnInputWidget()
                    .setChildName('field-input')
                    .addToParent(this);
            },

            /** @ignore */
            afterAdd: function () {
                base.afterAdd.call(this);
                this
                    .subscribeTo($commonWidgets.EVENT_INPUT_BLUR, this.onInputBlur)
                    .subscribeTo($commonWidgets.EVENT_INPUT_TAB, this.onInputTab)
                    .subscribeTo($commonWidgets.EVENT_INPUT_VALID, this.onInputValid)
                    .subscribeTo($commonWidgets.EVENT_FORM_RESET, this.onFormReset);
            },

            /**
             * Creates input widget.
             * Override to specify custom input field.
             * With the input type-based surrogates in place, overriding this method is rarely needed.
             * @returns {$commonWidgets.Input}
             */
            spawnInputWidget: function () {
                return $commonWidgets.Input.create(this.inputType);
            },

            /**
             * Fetches input widget.
             * @returns {$commonWidgets.Input}
             */
            getInputWidget: function () {
                return this.getChild('field-input');
            },

            /**
             * Fetches current input value on input widget.
             * @returns {*}
             */
            getInputValue: function () {
                return this.getInputWidget().inputValue;
            },

            /**
             * Sets value on input widget.
             * @param {*} inputValue
             * @param {boolean} [updateDom]
             * @returns {$commonWidgets.FormField}
             */
            setInputValue: function (inputValue, updateDom) {
                this.getInputWidget()
                    .setInputValue(inputValue, updateDom);
                return this;
            },

            /**
             * Clears value on input widget.
             * @param {boolean} [updateDom]
             * @returns {$commonWidgets.FormField}
             */
            clearInputValue: function (updateDom) {
                this.getInputWidget()
                    .clearInputValue(updateDom);
                return this;
            },

            /**
             * Allows TAB to take effect on the input.
             * @returns {$commonWidgets.FormField}
             */
            allowTabForwards: function () {
                this.allowsTabForwards = true;
                return this;
            },

            /**
             * Prevents TAB to take effect on the input.
             * @returns {$commonWidgets.FormField}
             */
            preventTabForwards: function () {
                this.allowsTabForwards = false;
                return this;
            },

            /**
             * Allows Shift+TAB to take effect on the input.
             * @returns {$commonWidgets.FormField}
             */
            allowTabBackwards: function () {
                this.allowsTabBackwards = true;
                return this;
            },

            /**
             * Prevents Shift+TAB to take effect on the input.
             * @returns {$commonWidgets.FormField}
             */
            preventTabBackwards: function () {
                this.allowsTabBackwards = false;
                return this;
            },

            /**
             * Sets warning message and sets the field to invalid state.
             * @param {string} warningMessage
             * @returns {$commonWidgets.FormField}
             */
            setWarningMessage: function (warningMessage) {
                this.warningLabel
                    .setLabelText(warningMessage)
                    .addToParent(this);

                this
                    .removeCssClass('field-valid')
                    .addCssClass('field-invalid');

                return this;
            },

            /**
             * Clears warning message and restores valid state of the field.
             * @returns {$commonWidgets.FormField}
             */
            clearWarningMessage: function () {
                this.warningLabel
                    .removeFromParent();

                this
                    .removeCssClass('field-invalid')
                    .addCssClass('field-valid');

                return this;
            },

            /**
             * Sets comment string.
             * @param {string} comment
             * @returns {$commonWidgets.FormField}
             */
            setComment: function (comment) {
                this.commentLabel
                    .setLabelText(comment)
                    .addToParent(this);
                return this;
            },

            /**
             * Clears comment string.
             * @returns {$commonWidgets.FormField}
             */
            clearComment: function () {
                this.commentLabel
                    .removeFromParent();
                return this;
            },

            /**
             * Sets focus on the current field. (More precisely, on the current field's input widget.)
             * @returns {$commonWidgets.FormField}
             */
            focusOnField: function () {
                this.getInputWidget()
                    .focusOnInput();
                return this;
            },

            /**
             * Updates warning message to the last warning if there was one, clears it otherwise.
             * @returns {$commonWidgets.FormField}
             */
            updateWarningMessage: function () {
                var inputWidget = this.getInputWidget();

                if (inputWidget.isValid()) {
                    this.clearWarningMessage();
                } else {
                    this.setWarningMessage(inputWidget.lastValidationError);
                }

                return this;
            },

            /**
             * @ignore
             */
            onInputBlur: function () {
                this.updateWarningMessage();
            },

            /**
             * @param {$widget.WidgetEvent} event
             * @ignore
             */
            onInputTab: function (event) {
                var originalEvent = event.getOriginalEventByType(jQuery.Event);
                if (!originalEvent.shiftKey && !this.allowsTabForwards ||
                    originalEvent.shiftKey && !this.allowsTabBackwards
                    ) {
                    originalEvent.preventDefault();
                }
            },

            /**
             * @ignore
             */
            onInputValid: function () {
                this.updateWarningMessage();
            },

            /**
             * @ignore
             */
            onFormReset: function () {
                this.clearWarningMessage();
            }
        });
});

(function () {
    "use strict";

    $assertion.addTypes(/** @lends $commonWidgets */{
        /** @param {$commonWidgets.FormField} expr */
        isFormField: function (expr) {
            return $commonWidgets.FormField.isBaseOf(expr);
        },

        /** @param {$commonWidgets.FormField} [expr] */
        isFormFieldOptional: function (expr) {
            return expr === undefined ||
                   $commonWidgets.FormField.isBaseOf(expr);
        }
    });
}());

$oop.postpone($commonWidgets, 'Form', function (ns, className, /**jQuery*/$) {
    "use strict";

    var base = $widget.Widget,
        self = base.extend(className)
            .addTraitAndExtend($commonWidgets.BinaryStateful)
            .addTrait($commonWidgets.Disableable);

    /**
     * Creates a Form instance.
     * @name $commonWidgets.Form.create
     * @function
     * @returns {$commonWidgets.Form}
     */

    /**
     * The Form encloses multiple FormField's, provides validity events for the entire form,
     * and supports submitting the form.
     * TODO: Implement disabling for form elements like inputs, etc.
     * @class
     * @extends $widget.Widget
     * @extends $commonWidgets.BinaryStateful
     * @extends $commonWidgets.Disableable
     */
    $commonWidgets.Form = self
        .addPublic(/** @lends $commonWidgets.Form */{
            /**
             * @type {$widget.MarkupTemplate}
             */
            contentTemplate: [
                '<ul class="inputs-container">',
                '</ul>'
            ].join('').toMarkupTemplate()
        })
        .addPrivateMethods(/** @lends $commonWidgets.Form# */{
            /** @private */
            _updateCounters: function () {
                var formFields = this.getFormFields(),
                    validFieldNames = formFields
                        .callOnEachItem('getInputWidget')
                        .callOnEachItem('isValid')
                        .toStringDictionary()
                        .reverse()
                        .getItem('true');

                this.fieldCount = formFields.getKeyCount();
                this.validFieldCount = validFieldNames ?
                    validFieldNames instanceof Array ?
                        validFieldNames.length :
                        1 :
                    0;
            },

            /**
             * @param {boolean} wasValid
             * @private
             */
            _triggerValidityEvent: function (wasValid) {
                var isValid = this.isValid();

                if (isValid && !wasValid) {
                    this.triggerSync($commonWidgets.EVENT_FORM_INVALID);
                } else if (!isValid && wasValid) {
                    this.triggerSync($commonWidgets.EVENT_FORM_VALID);
                }
            },

            /** @private */
            _triggerSubmissionEvent: function () {
                if (this.validFieldCount === this.fieldCount) {
                    this.triggerSync($commonWidgets.EVENT_FORM_SUBMIT);
                }
            }
        })
        .addMethods(/** @lends $commonWidgets.Form# */{
            /** @ignore */
            init: function () {
                base.init.call(this);
                $commonWidgets.BinaryStateful.init.call(this);
                $commonWidgets.Disableable.init.call(this);

                this.setTagName('form');

                this.elevateMethods(
                    'onSubmit',
                    'onInputSubmit',
                    'onInputValid',
                    'onInputInvalid');

                /**
                 * Total number of fields in the form.
                 * @type {number}
                 */
                this.fieldCount = undefined;

                /**
                 * Total number of valid fields in the form. Equal or less than .fieldCount.
                 * @type {number}
                 */
                this.validFieldCount = undefined;
            },

            /** @ignore */
            afterAdd: function () {
                base.afterAdd.call(this);

                this._updateCounters();

                this
                    .subscribeTo($commonWidgets.EVENT_INPUT_SUBMIT, this.onInputSubmit)
                    .subscribeTo($commonWidgets.EVENT_INPUT_VALID, this.onInputValid)
                    .subscribeTo($commonWidgets.EVENT_INPUT_INVALID, this.onInputInvalid);
            },

            /** @ignore */
            afterRender: function () {
                base.afterRender.call(this);

                $(this.getElement())
                    .on('submit', this.onSubmit);
            },

            /**
             * Determines whether the form is valid. The form is valid when and only when all of its fields are valid.
             * @returns {boolean}
             */
            isValid: function () {
                return this.validFieldCount === this.fieldCount;
            },

            /**
             * Adds a field to the form.
             * @param {$commonWidgets.FormField} formField
             * @returns {$commonWidgets.Form}
             */
            addFormField: function (formField) {
                $assertion
                    .isFormField(formField, "Invalid form field")
                    .assert(!this.getChild(formField.childName), "Specified field already exists");

                formField
                    .setTagName('li')
                    .setContainerCssClass('inputs-container')
                    .addToParent(this);

                this.fieldCount++;

                if (formField.getInputWidget().isValid()) {
                    this.validFieldCount++;
                }

                return this;
            },

            /**
             * Fetches the field with the specified name from the form.
             * TODO: make sure returned value is either FormField instance or undefined
             * @param {string} fieldName
             * @returns {$commonWidgets.FormField}
             */
            getFormField: function (fieldName) {
                return this.getChild(fieldName);
            },

            /**
             * Fetches all form field widgets as a WidgetCollection.
             * @returns {$widget.WidgetCollection}
             */
            getFormFields: function () {
                return this.children.filterByType($commonWidgets.FormField);
            },

            /**
             * Fetches input widgets from all form fields.
             * @returns {$data.Collection}
             */
            getInputWidgets: function () {
                return this.getFormFields()
                    .callOnEachItem('getInputWidget');
            },

            /**
             * Fetches input values from all form fields indexed by form field names.
             * @returns {$data.Collection}
             */
            getInputValues: function () {
                return this.getFormFields()
                    .callOnEachItem('getInputValue');
            },

            /**
             * Clears input value in all fields.
             * @param {boolean} [updateDom]
             * @returns {$commonWidgets.Form}
             */
            resetForm: function (updateDom) {
                // clearing input values
                this.getFormFields()
                    .callOnEachItem('clearInputValue', updateDom);

                // broadcasting form reset event so fields can clean up if they want to
                this.broadcastSync($commonWidgets.EVENT_FORM_RESET);

                return this;
            },

            /**
             * Attempts to submit form. It is up to the parent widget to handle the submit event
             * and actually submit the form. (It may not be necessary to submit anything to a server,
             * but rather take some other action.)
             * @returns {$commonWidgets.Form}
             */
            trySubmittingForm: function () {
                this._triggerSubmissionEvent();
                return this;
            },

            /**
             * Puts focus on first field of the form.
             * @returns {$commonWidgets.Form}
             */
            focusOnFirstField: function () {
                var firstField = this.children
                    .filterByType($commonWidgets.FormField)
                    .getSortedValues()[0];

                if (firstField) {
                    firstField.focusOnField();
                }

                return this;
            },

            /**
             * @ignore
             */
            onInputSubmit: function () {
                this.trySubmittingForm();
            },

            /**
             * @ignore
             */
            onInputValid: function () {
                var wasValid = this.isValid();
                this.validFieldCount++;
                this._triggerValidityEvent(wasValid);
            },

            /**
             * @ignore
             */
            onInputInvalid: function () {
                var wasValid = this.isValid();
                this.validFieldCount--;
                this._triggerValidityEvent(wasValid);
            },

            /**
             * @param {jQuery.Event} event
             * @ignore
             */
            onSubmit: function (event) {
                // suppressing native form submission
                event.preventDefault();
            }
        });
}, jQuery);

(function () {
    "use strict";

    $oop.addGlobalConstants.call($commonWidgets, /** @lends $commonWidgets */{
        /**
         * Signals that a Form became valid.
         * @constant
         */
        EVENT_FORM_VALID: 'widget.validity.on.form',

        /**
         * Signals tha a Form became invalid.
         * @constant
         */
        EVENT_FORM_INVALID: 'widget.validity.off.form',

        /**
         * Signals initiation of a Form submission.
         * @constant
         */
        EVENT_FORM_SUBMIT: 'widget.submit.form',

        /**
         * Signals that a Form was reset.
         * @constant
         */
        EVENT_FORM_RESET: 'widget.reset.form'
    });
}());

(function () {
    "use strict";

    $assertion.addTypes(/** @lends $commonWidgets */{
        /** @param {$commonWidgets.Form} expr */
        isForm: function (expr) {
            return $commonWidgets.Form.isBaseOf(expr);
        },

        /** @param {$commonWidgets.Form} [expr] */
        isFormOptional: function (expr) {
            return expr === undefined ||
                $commonWidgets.Form.isBaseOf(expr);
        }
    });
}());

/*jshint node:true */
if (typeof module === 'object') {
    module.exports = $commonWidgets;
}

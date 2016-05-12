/*jshint node:true */

/** @namespace */
var $templating = {};

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

$oop.postpone($templating, 'Template', function () {
    "use strict";

    var base = $oop.Base,
        self = base.extend();

    /**
     * Creates a Template instance. Templates may also be created by conversion from string.
     * @name $templating.Template.create
     * @function
     * @param {string|$utils.Stringifiable} templateString Either handlebars based string,
     * or object that serializes to one.
     * @returns {$templating.Template}
     * @see String#toTemplate
     */

    /**
     * Defines a template with handlebars parameters. Parameters may be replaced
     * with strings and Stringifiable instances.
     * @class
     * @extends $oop.Base
     */
    $templating.Template = self
        .addConstants(/** @lends $templating.Template */{
            /**
             * @type {RegExp}
             * @constant
             */
            RE_PARAMETER: /{{[^{}]+}}/g,

            /**
             * @type {RegExp}
             * @constant
             */
            RE_PARAMETER_TESTER: /^{{[^{}]+}}$/,

            /**
             * @type {RegExp}
             * @constant
             */
            RE_TEMPLATE_SPLITTER: /({{.+?}})/
        })
        .addPrivateMethods(/** @lends $templating.Template# */{
            /**
             * @param {Array} resolvedParameters Array of strings and arrays.
             * @returns {string}
             * @private
             */
            _flattenResolvedParameters: function (resolvedParameters) {
                var result = "",
                    i, subTree;

                for (i = 0; i < resolvedParameters.length; i++) {
                    subTree = resolvedParameters[i];
                    if (subTree instanceof Array) {
                        result += this._flattenResolvedParameters(subTree);
                    } else {
                        result += subTree;
                    }
                }

                return result;
            },

            /**
             * @param {object} parameterValues
             * @returns {string}
             * @private
             */
            _resolveParameters: function (parameterValues) {
                var parameterValuesAsTemplates = $data.Collection.create(parameterValues)
                        // discarding undefined parameter values
                        .filterBySelector(function (parameterValue) {
                            return typeof parameterValue !== 'undefined';
                        })
                        // converting each parameter value to Template
                        .createWithEachItem($templating.Template),
                    resolvedParameters = $data.Collection
                        // merging current templateString with parameter values as templates
                        .create({
                            '{{}}': this
                        })
                        .mergeIn(parameterValuesAsTemplates)
                        .toTemplateCollection()

                        // resolving templateString parameters for main templateString as well as parameter values
                        .resolveParameters();

                return this._flattenResolvedParameters(resolvedParameters['{{}}']);
            },

            /**
             * @returns {string}
             * @private
             */
            _clearParameters: function () {
                return this.templateString.replace(self.RE_PARAMETER, '');
            }
        })
        .addMethods(/** @lends $templating.Template# */{
            /**
             * @param {string|$utils.Stringifiable} templateString
             * @ignore
             */
            init: function (templateString) {
                /**
                 * Original templateString string.
                 * @type {string|$utils.Stringifiable}
                 */
                this.templateString = templateString;
            },

            /**
             * Parses current template string and returns an array of tokens
             * that make up the template's current value.
             * @returns {string|string[]}
             */
            extractTokens: function () {
                var serializedTemplate = $utils.Stringifier.stringify(this.templateString),
                    parsedTemplate;

                if (self.RE_PARAMETER_TESTER.test(serializedTemplate)) {
                    return serializedTemplate;
                } else {
                    parsedTemplate = serializedTemplate.split(self.RE_TEMPLATE_SPLITTER);
                    return parsedTemplate.length > 1 ? parsedTemplate : serializedTemplate;
                }
            },

            /**
             * Resolves parameters in the template as well as in the specified parameter values
             * (which can also carry templates) and returns the generated string.
             * @param {object} [parameterValues] Parameter name - parameter value (string / Stringifiable) associations.
             * When omitted, parameters will be replaced with empty string.
             * @returns {string}
             */
            getResolvedString: function (parameterValues) {
                if (parameterValues) {
                    return this._resolveParameters(parameterValues);
                } else {
                    return this._clearParameters();
                }
            },

            /**
             * Stringifies template.
             * @returns {string}
             */
            toString: function () {
                return $utils.Stringifier.stringify(this.templateString);
            }
        });
});

(function () {
    "use strict";

    $assertion.addTypes(/** @lends $templating */{
        /** @param {$templating.Template} expr */
        isTemplate: function (expr) {
            return $templating.Template.isBaseOf(expr);
        },

        /** @param {$templating.Template} expr */
        isTemplateOptional: function (expr) {
            return typeof expr === 'undefined' &&
                $templating.Template.isBaseOf(expr);
        }
    });

    $oop.extendBuiltIn(String.prototype, /** @lends String# */{
        /**
         * Converts string to Template instance.
         * @returns {$templating.Template}
         */
        toTemplate: function () {
            return $templating.Template.create(this.valueOf());
        }
    });
}());

$oop.postpone($templating, 'TemplateCollection', function (/**$templating*/widgets) {
    "use strict";

    /**
     * Creates a TemplateCollection instance. TemplateCollections may also be created by conversion
     * from arrays and Hash instances.
     * @name $templating.Template.create
     * @function
     * @param {object|Template[]} [items]
     * @returns {$templating.Template}
     * @see String#toTemplateCollection
     * @see $data.Hash#toTemplateCollection
     */

    /**
     * Collection of Template instances. Allows aggregated token extraction and parameter resolution.
     * @class
     * @extends $data.Collection
     * @extends $templating.Template
     */
    $templating.TemplateCollection = $data.Collection.of(widgets.Template)
        .addMethods(/** @lends $templating.TemplateCollection */{
            /**
             * Extracts unique tokens from all formats in the collection.
             * @returns {$data.Collection}
             */
            extractUniqueTokens: function () {
                return this
                    // concatenating all parsedFormat of all formats in the collection
                    .callOnEachItem('extractTokens')
                    .getValues()
                    .reduce(function (previous, current) {
                        return previous.concat(current);
                    }, [])

                    // extracting unique parsedFormat
                    .toStringDictionary()
                    .reverse()

                    // symmetrizing results (key = value)
                    .toCollection()
                    .mapValues(function (index, token) {
                        return token;
                    });
            },

            /**
             * Resolves templateString parameters. Returns an object in which each templateString parameter is associated with
             * an array-of-arrays structure holding corresponding string literals.
             * @returns {object}
             */
            resolveParameters: function () {
                var allTokens = this.extractUniqueTokens(),
                    tokensCollection = this
                        .mergeWith(allTokens
                            .callOnEachItem('toTemplate')
                            .toTemplateCollection())
                        .extractTokens();

                tokensCollection
                    // going through all template tokens and replacing parameter value in each
                    .forEachItem(function (/**string[]*/tokens) {
                        var i, token;
                        if (tokens instanceof Array) {
                            for (i = 0; i < tokens.length; i++) {
                                token = tokens[i];
                                tokens[i] = tokensCollection.getItem(token);
                            }
                        }
                    });

                return tokensCollection.items;
            }
        });
});

$oop.amendPostponed($data, 'Hash', function () {
    "use strict";

    $data.Hash.addMethods(/** @lends $data.Hash */{
        /** @returns {$templating.TemplateCollection} */
        toTemplateCollection: function () {
            return $templating.TemplateCollection.create(this.items);
        }
    });
});

(function () {
    "use strict";

    $oop.extendBuiltIn(Array.prototype, /** @lends Array# */{
        /** @returns {$templating.TemplateCollection} */
        toTemplateCollection: function () {
            return $templating.TemplateCollection.create(this);
        }
    });
}());

$oop.postpone($templating, 'LiveTemplate', function () {
    "use strict";

    var base = $templating.Template,
        self = base.extend()
            .addTrait($utils.Documented)
            .addTrait($event.Evented),
        shallowCopy = $data.DataUtils.shallowCopy;

    /**
     * Creates a LiveTemplate instance. LiveTemplate instances may also be created from string.
     * @name $templating.LiveTemplate.create
     * @function
     * @param {string|$utils.Stringifiable} templateString
     * @returns {$templating.LiveTemplate}
     * @see String#toLiveTemplate
     */

    /**
     * Template that carries the parameter values with it and can be stringified into a resolved template.
     * LiveTemplate triggers events when changing parameter values.
     * @class
     * @extends $templating.Template
     * @extends $utils.Documented
     * @extends $event.Evented
     * @extends $utils.Stringifiable
     */
    $templating.LiveTemplate = self
        .setEventSpace($event.eventSpace)
        .addMethods(/** @lends $templating.LiveTemplate# */{
            /**
             * @param {string|$utils.Stringifiable} templateString
             * @ignore
             */
            init: function (templateString) {
                base.init.call(this, templateString);
                $utils.Documented.init.call(this);
                this.setEventPath(['template', this.instanceId].toPath());

                /**
                 * Parameter values carried by the template.
                 * @type {object}
                 */
                this.parameterValues = {};
            },

            /**
             * Merges specified parameter values into the template's own set of parameter values.
             * New values overwrite old values associated with the same parameter.
             * @param {object} parameterValues
             * @returns {$templating.LiveTemplate}
             */
            setParameterValues: function (parameterValues) {
                var parameterValuesAfter = this.parameterValues,
                    parameterValuesBefore = shallowCopy(parameterValuesAfter),
                    parameterNames = Object.keys(parameterValues),
                    parameterCount = parameterNames.length,
                    i, parameterName, parameterValue;

                for (i = 0; i < parameterCount; i++) {
                    parameterName = parameterNames[i];
                    parameterValue = parameterValues[parameterName];

                    if ($templating.LiveTemplate.isBaseOf(parameterValue)) {
                        // when parameter value is a LiveTemplate
                        parameterValuesAfter[parameterName] = parameterValue.templateString;

                        // merging template's parameter value onto own
                        this.setParameterValues(parameterValue.parameterValues);
                    } else {
                        // for any other parameter type
                        // adding single parameter value
                        parameterValuesAfter[parameterName] = parameterValue;
                    }
                }

                this.spawnEvent($templating.EVENT_TEMPLATE_PARAMETER_VALUES_CHANGE)
                    .setPayloadItems({
                        parameterValuesBefore: parameterValuesBefore,
                        parameterValuesAfter : parameterValuesAfter
                    });

                return this;
            },

            /**
             * Clears parameter values assigned to the template.
             * @returns {$templating.LiveTemplate}
             */
            clearParameterValues: function () {
                var parameterValuesBefore = this.parameterValues,
                    parameterValuesAfter = {};

                this.parameterValues = parameterValuesAfter;

                // TODO: Add special event type instead of payload.
                this.spawnEvent($templating.EVENT_TEMPLATE_PARAMETER_VALUES_CHANGE)
                    .setPayloadItems({
                        parameterValuesBefore: parameterValuesBefore,
                        parameterValuesAfter : parameterValuesAfter
                    });

                return this;
            },

            /**
             * @returns {string}
             */
            toString: function () {
                return this.getResolvedString(this.parameterValues);
            }
        });
});

(function () {
    "use strict";

    $oop.addGlobalConstants.call($templating, /** @lends $templating */{
        /**
         * Signals that parameter values in a template changed.
         * @constant
         */
        EVENT_TEMPLATE_PARAMETER_VALUES_CHANGE: 'template.change.parameterValues'
    });

    $assertion.addTypes(/** @lends $templating */{
        /** @param {$templating.LiveTemplate} expr */
        isLiveTemplate: function (expr) {
            return $templating.LiveTemplate.isBaseOf(expr);
        },

        /** @param {$templating.LiveTemplate} expr */
        isLiveTemplateOptional: function (expr) {
            return typeof expr === 'undefined' &&
                $templating.LiveTemplate.isBaseOf(expr);
        }
    });

    $oop.extendBuiltIn(String.prototype, /** @lends String# */{
        /**
         * Converts string to LiveTemplate instance.
         * @returns {$templating.LiveTemplate}
         */
        toLiveTemplate: function () {
            return $templating.LiveTemplate.create(this.valueOf());
        }
    });
}());

/*jshint node:true */
if (typeof module === 'object') {
    module.exports = $templating;
}

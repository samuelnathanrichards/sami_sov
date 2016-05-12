/*jshint node:true */

/** @namespace */
var $widget = {};

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

/**
 * @function
 * @see http://api.jquery.com
 */
var jQuery = jQuery || require('jquery');

if (typeof document === 'undefined') {
    /**
     * Built-in global document object.
     * @type {Document}
     */
    document = undefined;
}
/**
 * Native DOM element class.
 * @name Element
 */
var Element = Element || undefined;

/**
 * Native DOM event class.
 * @name Event
 */
var Event = Event || undefined;

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

$oop.postpone($widget, 'WidgetUtils', function () {
    "use strict";

    var base = $oop.Base,
        self = base.extend(),
        slice = Array.prototype.slice;

    /**
     * The WidgetUtils class is a static class containing general purpose utilities used by widgets.
     * @class
     * @extends $oop.Base
     */
    $widget.WidgetUtils = self
        .addConstants(/** @lends $widget.WidgetUtils */{
            /**
             * @type {RegExp}
             * @constant
             */
            RE_ESCAPE_CHARS: /[&<>"'\n]|{{|}}/g,

            /**
             * @type {object}
             * @constant
             */
            ENTITY_MAP: {
                '&' : '&amp;',
                '<' : '&lt;',
                '>' : '&gt;',
                '"' : '&quot;',
                '\'': '&#39;',
                '{{': '&#123;&#123;',
                '}}': '&#125;&#125;'
            }
        })
        .addMethods(/** @lends $widget.WidgetUtils */{
            /**
             * Replace callback function for escaping HTML entities.
             * @param {string} hit
             * @returns {string}
             */
            replaceHtmlEntity: function (hit) {
                return self.ENTITY_MAP[hit] || hit;
            },

            /**
             * Escapes HTML entities, quotes, and placeholder markers in the specified text.
             * @param {string} text
             * @returns {string} Escaped string.
             */
            htmlEscape: function (text) {
                return text.replace(self.RE_ESCAPE_CHARS, this.replaceHtmlEntity);
            },

            /**
             * Retrieves the closest parent node of the specified element that has the specified CSS class.
             * @param {HTMLElement} element
             * @param {string} className
             * @returns {HTMLElement}
             */
            getParentNodeByClassName: function (element, className) {
                var classList;
                while (element && (element.classList || element.className)) {
                    classList = element.classList && slice.call(element.classList) ||
                        element.className.split(/\s+/);
                    if (classList && classList.indexOf(className) > -1) {
                        return element;
                    }
                    element = element.parentNode;
                }
                return undefined;
            }
        });
});

(function () {
    "use strict";

    $oop.extendBuiltIn(String.prototype, /** @lends String# */{
        /**
         * Converts string to HTML escaped string.
         * @returns {string}
         */
        toHtml: function () {
            return $widget.WidgetUtils.htmlEscape(this);
        }
    });
}());

$oop.postpone($widget, 'MarkupTemplate', function () {
    "use strict";

    var base = $oop.Base,
        self = base.extend();

    /**
     * Creates a MarkupTemplate instance.
     * MarkupTemplate instances may also be created via conversion from string.
     * @name $widget.MarkupTemplate.create
     * @function
     * @param {string} text MarkupTemplate string.
     * @returns {$widget.MarkupTemplate}
     * @see String#toMarkupTemplate
     */

    /**
     * Implements a template markup, where containers are identified by their CSS classes.
     * The template is filled in by specifying content for each container.
     * @class
     * @extends $oop.Base
     */
    $widget.MarkupTemplate = self
        .addConstants(/** @lends $widget.MarkupTemplate */{
            /**
             * Splits along template placeholders and tags.
             * Leaves an empty slot after each tag and placeholder in the resulting array.
             * @type {RegExp}
             * @constant
             */
            RE_MARKUP_SPLITTER: /(?=<)/,

            /**
             * Splits a tag to extract class list.
             * Extracted class list will be found in result[1].
             * @type {RegExp}
             * @constant
             */
            RE_CLASS_LIST_FROM_TAG: /class\s*=\s*"\s*([\w-]+(?:\s+[\w-]+)*)\s*"/,

            /**
             * Matches a class list.
             * Resulting array will contain extracted classes.
             * @type {RegExp}
             * @constant
             */
            RE_CLASS_FROM_CLASS_LIST: /[\w-]+/g
        })
        .addPrivateMethods(/** @lends $widget.MarkupTemplate */{
            /**
             * @param {string} tag
             * @returns {string}
             * @private
             */
            _extractClassListFromTag: function (tag) {
                var classNames = tag.split(self.RE_CLASS_LIST_FROM_TAG);
                return classNames && classNames[1];
            },

            /**
             * @param {string} classList
             * @returns {string[]}
             * @private
             */
            _extractClassesFromClassList: function (classList) {
                return classList.match(self.RE_CLASS_FROM_CLASS_LIST);
            },

            /**
             * @param {string} templateFragment
             * @returns {string|string[]}
             * @private
             */
            _processTemplateFragment: function (templateFragment) {
                var classList = this._extractClassListFromTag(templateFragment);
                return classList && this._extractClassesFromClassList(classList);
            }
        })
        .addMethods(/** @lends $widget.MarkupTemplate# */{
            /**
             * @param {string} templateString
             * @ignore
             */
            init: function (templateString) {
                /**
                 * Blown up string where the placeholders need to be substituted and joined to get the final text.
                 * @type {$data.Collection}
                 */
                this.preprocessedTemplate = templateString.split(self.RE_MARKUP_SPLITTER)
                    .toCollection();

                /**
                 * Defines lookup between container names and positions in the preprocessed template.
                 * @type {$data.StringDictionary}
                 */
                this.containerLookup = this.preprocessedTemplate
                    .mapValues(self._processTemplateFragment, this)
                    .toStringDictionary()
                    .reverse()
                    .toCollection()
                    .passEachItemTo(parseInt, this, 0, 10)
                    .setItem('undefined', this.preprocessedTemplate.getKeyCount() - 1);
            },

            /**
             * Appends template with specified content.
             * Do not call this on the original template. Clone first.
             * @param {object} parameterValues Pairs of container CSS classes & associated content.
             * @returns {$widget.MarkupTemplate}
             */
            setParameterValues: function (parameterValues) {
                var preprocessedTemplate = this.preprocessedTemplate.items,
                    containerLookup = this.containerLookup.items,
                    containerNames = Object.keys(parameterValues),
                    i, containerName, targetIndex;

                for (i = 0; i < containerNames.length; i++) {
                    // identifying placeholder in template
                    containerName = containerNames[i];
                    targetIndex = containerLookup[containerName];

                    if (targetIndex >= 0) {
                        // placeholder is found in template
                        preprocessedTemplate[targetIndex] += parameterValues[containerName];
                    }
                }

                return this;
            },

            /**
             * Sets template content and returns the resulting markup.
             * TODO: Break out a static MarkupTemplate, and make this one LiveMarkupTemplate.
             * @param {object} parameterValues Pairs of container CSS classes & associated content.
             * @returns {string}
             */
            getResolvedString: function (parameterValues) {
                return this.clone()
                    .setParameterValues(parameterValues)
                    .toString();
            },

            /**
             * Clones markup template.
             * @returns {$widget.MarkupTemplate}
             */
            clone: function () {
                var result = this.getBase().create('');
                result.preprocessedTemplate = this.preprocessedTemplate.clone();
                result.containerLookup = this.containerLookup.clone();
                return result;
            },

            /**
             * Serializes markup template.
             * @returns {string}
             */
            toString: function () {
                return this.preprocessedTemplate.items.join('');
            }
        });
});

(function () {
    "use strict";

    $oop.extendBuiltIn(String.prototype, /** @lends String# */{
        /**
         * Converts `String` to `MarkupTemplate` instance.
         * @returns {$widget.MarkupTemplate}
         */
        toMarkupTemplate: function () {
            return $widget.MarkupTemplate.create(this);
        }
    });
}());

$oop.postpone($widget, 'CssClasses', function () {
    "use strict";

    var base = $data.Collection,
        self = base.extend();

    /**
     * Creates a CssClasses instance.
     * @name $widget.CssClasses.create
     * @function
     * @param {object|Array} [items] Initial contents.
     * @returns {$widget.CssClasses}
     */

    /**
     * The CssClasses class is a serializable Collection of CSS class names.
     * @class
     * @extends $oop.Base
     */
    $widget.CssClasses = self
        .addMethods(/** @lends $widget.CssClasses# */{
            /**
             * Adds specified CSS class to the collection.
             * @param {string} cssClass
             * @returns {$widget.CssClasses}
             */
            addCssClass: function (cssClass) {
                var refCount = this.getItem(cssClass) || 0;
                this.setItem(cssClass, refCount + 1);
                return this;
            },

            /**
             * Decreases reference count on the specified CSS class.
             * Removes CSS class when reference count drops below 1.
             * @param {string} cssClass
             * @returns {$widget.CssClasses}
             */
            decreaseRefCount: function (cssClass) {
                var refCount = this.getItem(cssClass) || 0;
                if (refCount > 1) {
                    this.setItem(cssClass, refCount - 1);
                } else {
                    this.deleteItem(cssClass);
                }
                return this;
            },

            /**
             * Removes specified CSS class from the collection.
             * @param {string} cssClass
             * @returns {$widget.CssClasses}
             */
            removeCssClass: function (cssClass) {
                this.deleteItem(cssClass);
                return this;
            },

            /**
             * Serializes CSS classes into a space separated string that can be used as an HTML "class" attribute.
             * @example
             * $widget.CssClasses.create()
             *     .addCssClass('foo')
             *     .addCssClass('bar')
             *     .toString() // "foo bar"
             * @returns {string}
             */
            toString: function () {
                return this
                    .getKeys()
                    .sort()
                    .join(' ');
            }
        });
});

$oop.postpone($widget, 'InlineStyles', function () {
    "use strict";

    var base = $data.Collection,
        self = base.extend();

    /**
     * Creates an InlineStyles instance.
     * @name $widget.InlineStyles.create
     * @function
     * @param {object|Array} [items] Initial contents.
     * @returns {$widget.InlineStyles}
     */

    /**
     * The InlineStyles class is a collection of style key-value pairs that can be
     * serialized in the correct style definition format.
     * @class
     * @extends $data.Collection
     */
    $widget.InlineStyles = self
        .addMethods(/** @lends $widget.InlineStyles# */{
            /**
             * Serializes style collection so that it can be used in a tag as attribute.
             * The order of styles is not determined.
             * @example
             * $widget.InlineStyles.create()
             *      .setItem('display', 'inline-block')
             *      .setItem('overflow', 'hidden')
             *      .toString() // "display: inline-block; overflow: hidden"
             * @returns {string}
             */
            toString: function () {
                var result = [];
                this.forEachItem(function (styleValue, styleName) {
                    result.push(styleName + ': ' + styleValue);
                });
                return result.join('; ');
            }
        });
});

$oop.postpone($widget, 'HtmlAttributes', function () {
    "use strict";

    var base = $data.Collection,
        self = base.extend();

    /**
     * Creates a HtmlAttributes instance.
     * @name $widget.HtmlAttributes.create
     * @function
     * @param {object|Array} [items] Initial contents.
     * @returns {$widget.HtmlAttributes}
     */

    /**
     * The HtmlAttributes class manages all aspects of an HTML element's attributes,
     * including CSS classes and inline styles.
     * @class
     * @extends $data.Collection
     */
    $widget.HtmlAttributes = self
        .addMethods(/** @lends $widget.HtmlAttributes# */{
            /**
             * @param {object|Array} [items] Initial contents.
             * @ignore
             */
            init: function (items) {
                base.init.call(this, items);

                /**
                 * ID attribute.
                 * @type {string}
                 */
                this.idAttribute = undefined;

                /**
                 * Collection of CSS classes.
                 * @type {$widget.CssClasses}
                 */
                this.cssClasses = $widget.CssClasses.create();

                /**
                 * Collection of inline styles.
                 * @type {$widget.InlineStyles}
                 */
                this.inlineStyles = $widget.InlineStyles.create();
            },

            /**
             * Removes the specified attribute from the collection.
             * @param {string} attributeName Name of attribute to be removed. Values 'class' and 'style' also
             * clear the corresponding collections. Use carefully!
             * @returns {$widget.HtmlAttributes}
             */
            deleteItem: function (attributeName) {
                switch (attributeName) {
                case 'style':
                    // emptying inline styles
                    this.inlineStyles.clear();
                    break;
                case 'class':
                    // emptying class collection
                    // removes auto-added classes, too!
                    this.cssClasses.clear();
                    break;
                }

                base.deleteItem.call(this, attributeName);

                return this;
            },

            /**
             * Sets ID attribute. ID attribute set this way will override ID attribute set via `setItem`.
             * @param {string} idAttribute
             * @returns {$widget.HtmlAttributes}
             * @see $widget.HtmlAttributes#setItem
             */
            setIdAttribute: function (idAttribute) {
                $assertion.isString(idAttribute, "Invalid ID attribute");
                this.idAttribute = idAttribute;
                return this;
            },

            /**
             * Adds CSS class to the 'class' attribute.
             * @param {string} cssClass
             * @returns {$widget.HtmlAttributes}
             */
            addCssClass: function (cssClass) {
                this.cssClasses.addCssClass(cssClass);
                return this;
            },

            /**
             * Decreases ref count on specified CSS class.
             * @param {string} cssClass
             * @returns {$widget.HtmlAttributes}
             */
            decreaseCssClassRefCount: function (cssClass) {
                this.cssClasses.decreaseRefCount(cssClass);
                return this;
            },

            /**
             * Removes CSS class from the 'class' attribute.
             * @param {string} cssClass
             * @returns {$widget.HtmlAttributes}
             */
            removeCssClass: function (cssClass) {
                this.cssClasses.removeCssClass(cssClass);
                return this;
            },

            /**
             * Adds style definition to the 'style' attribute.
             * @param {string} styleName Style name, eg. "overflow".
             * @param {string} styleValue Style value, eg. "hidden".
             * @returns {$widget.HtmlAttributes}
             */
            addInlineStyle: function (styleName, styleValue) {
                this.inlineStyles.setItem(styleName, styleValue);
                return this;
            },

            /**
             * Adds style definition to the 'style' attribute.
             * @param {string} styleName Style name, eg. "overflow".
             * @returns {$widget.HtmlAttributes}
             */
            removeInlineStyle: function (styleName) {
                this.inlineStyles.deleteItem(styleName);
                return this;
            },

            /**
             * Generates a new HtmlAttributes instance on which the `id`, `class`, and `style` attributes are set
             * based on the corresponding properties of the current instance.
             * @returns {$widget.HtmlAttributes}
             */
            getFinalAttributes: function () {
                // not cloning on purpose so collections and properties don't carry over
                var htmlAttributes = this.getBase().create(this.items);

                if (this.idAttribute) {
                    htmlAttributes.setItem('id', this.idAttribute);
                } else {
                    htmlAttributes.deleteItem('id');
                }

                htmlAttributes.setItem('class', this.cssClasses.toString());

                if (this.inlineStyles.getKeyCount()) {
                    htmlAttributes.setItem('style', this.inlineStyles.toString());
                } else {
                    htmlAttributes.deleteItem('style');
                }

                return htmlAttributes;
            },

            /**
             * Clones HTML attributes with attached ID attribute, inline styles, and CSS classes.
             * @returns {$widget.HtmlAttributes}
             */
            clone: function () {
                var result = base.clone.call(this);

                result.idAttribute = this.idAttribute;
                result.cssClasses = this.cssClasses.clone();
                result.inlineStyles = this.inlineStyles.clone();

                return result;
            },

            /**
             * Serializes HTML attributes to string so that it can be used when composing an HTML tag.
             * The order of attributes is not determined.
             * @example
             * $widget.HtmlAttributes.create()
             *     .setIdAttribute('foo')
             *     .addCssClass('bar')
             *     .addInlineStyle('overflow', 'hidden')
             *     .toString() // 'id="foo" class="bar" style="overflow: hidden"'
             * @returns {string}
             */
            toString: function () {
                return this.getFinalAttributes()
                    .mapValues(function (value, attributeName) {
                        return attributeName + '="' + value + '"';
                    })
                    .getSortedValues()
                    .join(' ');
            }
        });
});

(function () {
    "use strict";

    $assertion.addTypes(/** @lends $widget */{
        /** @param {$widget.HtmlAttributes} expr */
        isHtmlAttributes: function (expr) {
            return $widget.HtmlAttributes.isBaseOf(expr);
        },

        /** @param {$widget.HtmlAttributes} [expr] */
        isHtmlAttributesOptional: function (expr) {
            return typeof expr === 'undefined' ||
                   $widget.HtmlAttributes.isBaseOf(expr);
        }
    });
}());

$oop.postpone($widget, 'Progenitor', function (ns, className) {
    "use strict";

    var base = $utils.Managed,
        self = base.extend(className),
        slice = Array.prototype.slice;

    /**
     * The Progenitor trait manages parent-children relation between instances of the host class.
     * @class
     * @extends $utils.Managed
     */
    $widget.Progenitor = self
        .addMethods(/** @lends $widget.Progenitor# */{
            /** Call from host's .init */
            init: function () {
                base.init.call(this);

                /**
                 * Parent of current instance.
                 * When undefined, progenitor is considered a root instance.
                 * @type {$widget.Progenitor}
                 */
                this.parent = undefined;

                /**
                 * Name of the current instance in the context of its parent.
                 * @type {string}
                 */
                this.childName = this.instanceId.toString();

                /**
                 * Children: collection of other Progenitor instances.
                 * @type {$data.Collection}
                 */
                this.children = $data.Collection.create();
            },

            /**
             * Adds current instance to the specified parent Progenitor instance as child.
             * @param {$widget.Progenitor} parent
             * @returns {$widget.Progenitor}
             */
            addToParent: function (parent) {
                var childName, currentChild;

                if (parent !== this.parent) {
                    // specified parent is different than current

                    if (this.parent) {
                        // current instance has a parent
                        // removing child from current parent
                        this.removeFromParent();
                    }

                    childName = this.childName;
                    currentChild = parent.children.getItem(childName);

                    if (currentChild) {
                        // there is a child in parent by the current instance/s child name
                        // removing that instance
                        currentChild.removeFromParent();
                    }

                    // setting current instance as child in parent
                    parent.children.setItem(childName, this);

                    // updating parent reference
                    this.parent = parent;
                }

                return this;
            },

            /**
             * Adds the specified Progenitor instance to the current instance as child.
             * @param {$widget.Progenitor} child
             * @returns {$widget.Progenitor}
             */
            addChild: function (child) {
                child.addToParent(this);
                return this;
            },

            /**
             * Removes current instance from its parent.
             * Has no effect when current instance has no parent.
             * @returns {$widget.Progenitor}
             */
            removeFromParent: function () {
                var parent = this.parent;

                if (parent) {
                    // removing self from parent's children
                    parent.children.deleteItem(this.childName);

                    // clearing parent reference
                    this.parent = undefined;
                }

                return this;
            },

            /**
             * Removes specified Progenitor instance from current instance.
             * Has no effect if the specified instance is not child of the current instance.
             * @param {$widget.Progenitor} child
             * @returns {$widget.Progenitor}
             */
            removeChild: function (child) {
                if (this.children.getItem(child.childName) === child) {
                    child.removeFromParent();
                }
                return this;
            },

            /**
             * Removes all children from the current instance.
             * @returns {$widget.Progenitor}
             */
            removeChildren: function () {
                this.children.callOnEachItem('removeFromParent');
                return this;
            },

            /**
             * Changes child name for current instance.
             * Has no effect when specified child name is same as the current child name.
             * @param {string} childName
             * @returns {$widget.Progenitor}
             */
            setChildName: function (childName) {
                $assertion.isString(childName, "Invalid child name");

                var parent = this.parent;

                if (childName !== this.childName) {
                    if (parent) {
                        // temporarily removing instance from parent
                        this.removeFromParent();
                    }

                    // changing name
                    this.childName = childName;

                    if (parent) {
                        // adding instance back to parent
                        this.addToParent(parent);
                    }
                }

                return this;
            },

            /**
             * Retrieves child instance matching the specified child name.
             * @param {string} childName
             * @returns {$widget.Progenitor}
             */
            getChild: function (childName) {
                return this.children.getItem(childName);
            },

            /**
             * Retrieves a collection of child instances matching the names specified as arguments.
             * When no argument is given, retrieves reference to the children collection.
             * @returns {$data.Collection}
             */
            getChildren: function () {
                if (arguments.length) {
                    return this.children.filterByKeys(slice.call(arguments));
                } else {
                    return this.children;
                }
            },

            /**
             * Retrieves a collection of all instances in the current instance's progeny.
             * @returns {$data.Collection}
             */
            getAllDescendants: function () {
                var result = $data.Collection.create();

                (function getAllDescendants(parent) {
                    parent.children
                        .forEachItem(function (child) {
                            result.setItem(child.instanceId, child);
                            getAllDescendants(child);
                        });
                }(this));

                return result;
            },

            /**
             * Retrieves a Progenitor instance from the current instance's parent chain
             * matching the specified tester function. The tester receives one argument, which
             * is the Progenitor instance being traversed in the parent chain.
             * @param {function} tester
             * @returns {$widget.Progenitor}
             */
            getAncestor: function (tester) {
                $assertion.isFunction(tester, "Invalid tester function");

                var parent = this.parent;

                while (parent && !tester(parent)) {
                    parent = parent.parent;
                }

                return parent;
            },

            /**
             * Retrieves the path that identifies the position of the current instance
             * relative to the root instance.
             * @returns {$data.Path}
             */
            getLineage: function () {
                var asArray = [],
                    instance = this;

                while (instance) {
                    asArray.unshift(instance.instanceId);
                    instance = instance.parent;
                }

                return asArray.toPath();
            }
        });
});

$oop.postpone($widget, 'Renderable', function () {
    "use strict";

    var base = $oop.Base,
        self = base.extend();

    /**
     * The Renderable trait allows the host class to be rendered into the DOM.
     * Adds managed HTML attributes, markup, and rendering methods.
     * @class
     * @extends $oop.Base
     */
    $widget.Renderable = self
        .addPublic(/** @lends $widget.Renderable */{
            /**
             * @type {$widget.MarkupTemplate}
             */
            contentTemplate: undefined
        })
        .addPrivateMethods(/** @lends $widget.Renderable# */{
            /**
             * Proxy for document.createElement.
             * @param {string} tagName
             * @returns {HTMLElement}
             * @private
             */
            _createElementProxy: function (tagName) {
                return document && document.createElement(tagName);
            },

            /**
             * Proxy for fetching DOM element by its ID.
             * @param {string} elementId
             * @returns {HTMLElement}
             * @private
             */
            _getElementByIdProxy: function (elementId) {
                return document && document.getElementById(elementId);
            },

            /**
             * Proxy for setting an attribute on a DOM element.
             * @param {HTMLElement} element
             * @param {string} attributeName
             * @param {string} attributeValue
             * @private
             */
            _attributeSetterProxy: function (element, attributeName, attributeValue) {
                element.setAttribute(attributeName, attributeValue);
            },

            /**
             * Proxy for setting a DOM element's inner HTML.
             * @param {HTMLElement} element
             * @param {string} innerHtml
             * @private
             */
            _innerHtmlSetterProxy: function (element, innerHtml) {
                element.innerHTML = innerHtml;
            },

            /**
             * Proxy for appending child DOM element to parent.
             * @param {HTMLElement} parentElement
             * @param {HTMLElement} childElement
             * @private
             */
            _appendChildProxy: function (parentElement, childElement) {
                parentElement.appendChild(childElement);
            },

            /**
             * Proxy for inserting DOM element before another one.
             * @param {HTMLElement} parentElement
             * @param {HTMLElement} afterElement
             * @param {HTMLElement} element
             * @private
             */
            _insertBeforeProxy: function (parentElement, afterElement, element) {
                parentElement.insertBefore(element, afterElement);
            },

            /**
             * Proxy for replacing a DOM element with a different one.
             * @param {HTMLElement} parentElement
             * @param {HTMLElement} afterElement
             * @param {HTMLElement} beforeElement
             * @private
             */
            _replaceChildProxy: function (parentElement, afterElement, beforeElement) {
                parentElement.replaceChild(afterElement, beforeElement);
            },

            /**
             * Proxy for setting attribute on DOM element.
             * @param {HTMLElement} element
             * @param {string} attributeName
             * @param {string} attributeValue
             * @private
             */
            _setAttributeProxy: function (element, attributeName, attributeValue) {
                element.setAttribute(attributeName, attributeValue);
            },

            /**
             * Proxy for removing attribute from DOM element.
             * @param {HTMLElement} element
             * @param {string} attributeName
             * @private
             */
            _removeAttributeProxy: function (element, attributeName) {
                element.removeAttribute(attributeName);
            },

            /**
             * Proxy for setting style attribute of a DOM element.
             * @param {HTMLElement} element
             * @param {string} styleAttribute
             * @private
             */
            _setStyleProxy: function (element, styleAttribute) {
                element.style.cssText = styleAttribute;
            }
        })
        .addMethods(/** @lends $widget.Renderable# */{
            /**
             * Call from host's .init.
             * @param {$widget.HtmlAttributes} htmlAttributes
             */
            init: function (htmlAttributes) {
                /**
                 * @type {string}
                 */
                this.tagName = 'div';

                /**
                 * @type {$widget.HtmlAttributes}
                 */
                this.htmlAttributes = htmlAttributes || $widget.HtmlAttributes.create();
            },

            /**
             * Sets tag name property.
             * @param {string} tagName
             * @returns {$widget.Renderable}
             */
            setTagName: function (tagName) {
                $assertion.isString(tagName, "Invalid tag name");
                this.tagName = tagName;
                return this;
            },

            /**
             * Adds CSS class to the instance, modifying both buffer and DOM element.
             * @param {string} cssClass
             * @returns {$widget.Renderable}
             */
            addCssClass: function (cssClass) {
                var htmlAttributes = this.htmlAttributes,
                    element = this.getElement();

                htmlAttributes.addCssClass(cssClass);

                if (element) {
                    this._setAttributeProxy(element, 'class', htmlAttributes.cssClasses.toString());
                }

                return this;
            },

            /**
             * Decreases ref count of CSS class on the instance, modifying both buffer and DOM element.
             * @param {string} cssClass
             * @returns {$widget.Renderable}
             */
            decreaseCssClassRefCount: function (cssClass) {
                var htmlAttributes = this.htmlAttributes,
                    element = this.getElement();

                htmlAttributes.decreaseCssClassRefCount(cssClass);

                if (element) {
                    this._setAttributeProxy(element, 'class', htmlAttributes.cssClasses.toString());
                }

                return this;
            },

            /**
             * Removes a CSS class from the instance, modifying both buffer and DOM element.
             * @param {string} cssClass
             * @returns {$widget.Renderable}
             */
            removeCssClass: function (cssClass) {
                var htmlAttributes = this.htmlAttributes,
                    element = this.getElement();

                htmlAttributes.removeCssClass(cssClass);

                if (element) {
                    this._setAttributeProxy(element, 'class', htmlAttributes.cssClasses.toString());
                }

                return this;
            },

            /**
             * Tells whether the current instance has the specified CSS class.
             * @param {string} cssClass
             * @returns {boolean}
             */
            hasCssClass: function (cssClass) {
                return !!this.htmlAttributes.cssClasses.getItem(cssClass);
            },

            /**
             * Sets inline style on instance, modifying both buffer and DOM element.
             * @param {string} styleName
             * @param {string} [styleValue]
             * @returns {$widget.Renderable}
             */
            setInlineStyle: function (styleName, styleValue) {
                var htmlAttributes = this.htmlAttributes,
                    element = this.getElement();

                if (typeof styleValue === 'undefined') {
                    htmlAttributes.removeInlineStyle(styleName);
                } else {
                    htmlAttributes.addInlineStyle(styleName, styleValue);
                }

                if (element) {
                    this._setStyleProxy(element, htmlAttributes.inlineStyles.toString());
                }

                return this;
            },

            /**
             * Adds attribute to instance, modifying both buffer and DOM element.
             * TODO: Handle 'id' and 'class' attributes.
             * @param {string} attributeName
             * @param {string} attributeValue
             * @returns {$widget.Renderable}
             */
            addAttribute: function (attributeName, attributeValue) {
                this.htmlAttributes.setItem(attributeName, attributeValue);

                var element = this.getElement();
                if (element) {
                    this._setAttributeProxy(element, attributeName, attributeValue);
                }

                return this;
            },

            /**
             * Removes attribute from instance, modifying both buffer and DOM element.
             * @param {string} attributeName Name of the HTML attribute to remove. Values 'class' and 'style' also
             * clear the corresponding collections. Use carefully!
             * @returns {$widget.Renderable}
             */
            removeAttribute: function (attributeName) {
                this.htmlAttributes.deleteItem(attributeName);

                var element = this.getElement();
                if (element) {
                    this._removeAttributeProxy(element, attributeName);
                }

                return this;
            },

            /**
             * Creates a new DOM element based on the current state of the instance.
             * Has no effect if the instance already has an element in the DOM associated with it.
             * TODO: Remove template conversion & placeholder clearing.
             * @returns {HTMLElement}
             */
            createElement: function () {
                var element = this._createElementProxy(this.tagName),
                    attributeSetterProxy = this._attributeSetterProxy,
                    innerHtml = this.contentMarkup()
                        .toTemplate()
                        .getResolvedString();

                // adding attributes to element
                this.htmlAttributes
                    .getFinalAttributes()
                    .forEachItem(function (attributeValue, attributeName) {
                        attributeSetterProxy(element, attributeName, attributeValue);
                    });

                // adding contents to element
                this._innerHtmlSetterProxy(element, innerHtml);

                return element;
            },

            /**
             * Fetches element from DOM associated with current instance.
             * @returns {HTMLElement}
             */
            getElement: function () {
                return this._getElementByIdProxy(this.htmlAttributes.idAttribute);
            },

            /**
             * Renders instance into the specified element by appending it to it.
             * Moves existing element to new location by default. Override by forcing rendering.
             * @param {HTMLElement} parentElement
             * @param {boolean} [force]
             * @returns {$widget.Renderable}
             */
            renderInto: function (parentElement, force) {
                var element = (!force && this.getElement()) || this.createElement();
                this._appendChildProxy(parentElement, element);
                return this;
            },

            /**
             * Renders instance before the specified element.
             * Moves existing element to new location by default. Override by forcing rendering.
             * @param {HTMLElement} adjacentElement
             * @param {boolean} [force]
             * @returns {$widget.Renderable}
             */
            renderBefore: function (adjacentElement, force) {
                var parentElement = adjacentElement.parentNode,
                    element = (!force && this.getElement()) || this.createElement();

                this._insertBeforeProxy(parentElement, adjacentElement, element);

                return this;
            },

            /**
             * Re-renders instance by replacing the current DOM element with a new one.
             * Has no effect when instance has never been rendered.
             * External references to the instance's DOM must be invalidated afterwards.
             * @returns {$widget.Renderable}
             */
            reRender: function () {
                var element = this.getElement();
                if (element) {
                    this._replaceChildProxy(element.parentNode, this.createElement(), element);
                }
                return this;
            },

            /**
             * Re-renders the contents of the instance, leaving its main DOM element unchanged.
             * Has no effect when instance has never been rendered.
             * External references to the instance's internal DOM must be invalidated afterwards.
             * TODO: Remove template conversion & placeholder clearing.
             * @returns {$widget.Renderable}
             */
            reRenderContents: function () {
                var element = this.getElement(),
                    innerHtml;

                if (element) {
                    // generating current markup
                    innerHtml = this.contentMarkup()
                        .toTemplate()
                        .getResolvedString();

                    // adding contents to element
                    this._innerHtmlSetterProxy(element, innerHtml);
                }

                return this;
            },

            /**
             * Retrieves the widget's markup as a MarkupTemplate instance.
             * @returns {$widget.MarkupTemplate}
             */
            contentMarkupAsTemplate: function () {
                return this.contentTemplate.clone();
            },

            /**
             * Override method defining the contents of the Renderable instance.
             * @returns {string}
             */
            contentMarkup: function () {
                return this.contentTemplate ?
                    this.contentMarkupAsTemplate().toString():
                    '';
            },

            /**
             * Generates full markup for the current instance.
             * TODO: Remove template conversion & placeholder clearing.
             * @returns {string}
             */
            toString: function () {
                var tagName = this.tagName;
                return [
                    '<' + tagName + ' ' + this.htmlAttributes + '>',
                    this.contentMarkup()
                        .toTemplate()
                        .getResolvedString(),
                    '</' + tagName + '>'
                ].join('');
            }
        });
});

$oop.postpone($widget, 'JqueryWidget', function (ns, className, /**jQuery*/$) {
    "use strict";

    var base = $oop.Base,
        self = base.extend(),
        $document = document && $(document);

    /**
     * The JqueryWidget trait adds class-level (delegated) jQuery event subscription capability to the host.
     * When used on other traits, call methods directly on JqueryWidget.
     * @class
     * @extends $oop.Base
     * @extends $widget.Widget
     */
    $widget.JqueryWidget = self
        .addPrivateMethods(/** @lends $widget.JqueryWidget */{
            /**
             * @param {string} eventName
             * @param {string} selector
             * @param {function} handler
             * @private
             */
            _jqueryOnProxy: function (eventName, selector, handler) {
                if ($document) {
                    $document.on(eventName, selector, handler);
                }
            },

            /**
             * @param {string} eventName
             * @param {string} selector
             * @param {function} [handler]
             * @private
             */
            _jqueryOffProxy: function (eventName, selector, handler) {
                if ($document) {
                    $document.off(eventName, selector, handler);
                }
            },

            /**
             * @param {string} selector
             * @returns {string}
             * @private
             */
            _getGlobalSelector: function (selector) {
                var className = this.className,
                    classSelector = '.' + className;

                return className ?
                    selector.indexOf(classSelector) === -1 ?
                        classSelector + ' ' + selector :
                        selector :
                    selector;
            }
        })
        .addMethods(/** @lends $widget.JqueryWidget */{
            /**
             * Subscribes to DOM events, jQuery-style.
             * @param {string} eventName
             * @param {string} selector
             * @param {string} methodName
             * @returns {$widget.JqueryWidget}
             */
            on: function (eventName, selector, methodName) {
                var globalSelector = this._getGlobalSelector(selector),
                    className = this.className;

                this._jqueryOnProxy(eventName, globalSelector, function (/**jQuery.Event*/event) {
                    var widget = event.originalEvent.toWidget(className);
                    return widget ?
                        widget[methodName].apply(widget, arguments) :
                        undefined;
                });

                return this;
            },

            /**
             * Unsubscribes from DOM events, jQuery-style.
             * @param {string} eventName
             * @param {string} selector
             * @returns {$widget.JqueryWidget}
             */
            off: function (eventName, selector) {
                var globalSelector = this._getGlobalSelector(selector);

                this._jqueryOffProxy(eventName, globalSelector);

                return this;
            }
        });
}, jQuery);

$oop.postpone($widget, 'widgetEventSpace', function () {
    "use strict";

    /**
     * Event space dedicated to widget events.
     * @type {$event.EventSpace}
     */
    $widget.widgetEventSpace = $event.EventSpace.create();
});

$oop.postpone($widget, 'WidgetEvent', function () {
    "use strict";

    var base = $event.Event;

    /**
     * Creates a WidgetEvent instance.
     * Do not instantiate this class directly. Spawn events on the event space `$widget.widgetEventSpace`,
     * or an Evented instance, like a Widget.
     * WidgetEvent may also be instantiated by creating an `$event.Event` with `$widget.WidgetEventSpace`
     * specified as event space.
     * @name $widget.WidgetEvent.create
     * @function
     * @param {string} eventName Event name
     * @param {$event.EventSpace} eventSpace Event space associated with event
     * @returns {$widget.WidgetEvent}
     */

    /**
     * The WidgetEvent implements special event features for widgets.
     * @class
     * @extends $event.Event
     */
    $widget.WidgetEvent = base.extend();
});

$oop.amendPostponed($event, 'Event', function () {
    "use strict";

    $event.Event
        .addSurrogate($widget, 'WidgetEvent', function (eventName) {
            var prefix = 'widget';
            return eventName.substr(0, prefix.length) === prefix;
        });
});

$oop.postpone($widget, 'Widget', function (ns, className) {
    "use strict";

    var slice = Array.prototype.slice,
        base = $oop.Base,
        self = base.extend()
            // trait methods do not overlap, can go on same prototype level
            .addTrait($widget.Progenitor)
            .addTrait($widget.Renderable)
            .addTrait($event.Evented)
            .extend(className);

    /**
     * Creates a Widget instance.
     * Widgets already inserted into the hierarchy may be retrieved via conversion from their widget IDs.
     * @example
     * 'w1'.toWidget()
     * @name $widget.Widget.create
     * @function
     * @returns {$widget.Widget}
     */

    /**
     * The Widget class is the base class for all *$widget*-based widgets.
     * As stateful view-controllers, the widgets' role is to keep the view (DOM) in sync with the model.
     * The Widget implements the life cycle: created - added - rendered - removed, to each stage of which user-defined
     * handlers may be added.
     * @class
     * @extends $oop.Base
     * @extends $event.Evented
     * @extends $widget.Progenitor
     * @extends $widget.Renderable
     */
    $widget.Widget = self
        .addConstants(/** @lends $widget.Widget */{
            /**
             * @type {$data.Path}
             * @constant
             */
            ATTACHED_EVENT_PATH_ROOT: 'widget>attached'.toPath(),

            /**
             * @type {$data.Path}
             * @constant
             */
            DETACHED_EVENT_PATH_ROOT: 'widget>detached'.toPath()
        })
        .addPublic(/** @lends $widget.Widget */{
            /**
             * Stores all HTML attributes, including CSS classes and inline styles.
             * @type {$widget.HtmlAttributes}
             */
            htmlAttributes: $widget.HtmlAttributes.create()
                .addCssClass(className),

            /**
             * Root widget. All other widgets descend from this.
             * There can be only one root widget at a time, but the root widget may be replaced at any time.
             * @type {$widget.Widget}
             * @see $widget.Widget#setRootWidget
             */
            rootWidget: undefined
        })
        .addPrivateMethods(/** @lends $widget.Widget# */{
            /**
             * Retrieves a list of widget IDs to be found under the specified DOM element.
             * @param {HTMLElement} element
             * @returns {string[]} List of widget IDs.
             * @private
             */
            _getWidgetIdsInDom: function (element) {
                var re;

                if (element) {
                    re = /^w\d+$/;

                    return slice.call(element.childNodes)
                        .map(function (item) {
                            return item.id;
                        })
                        .filter(function (item) {
                            return re.test(item);
                        });
                } else {
                    return [];
                }
            },

            /**
             * Renders widget into parent element.
             * If widget has containerCssClass specified, it will render within the matching element.
             * @private
             */
            _renderIntoParent: function () {
                var parentElement = this.parent.getElement(),
                    containerCssClass = this.containerCssClass;

                if (parentElement) {
                    if (containerCssClass) {
                        parentElement = parentElement.getElementsByClassName(containerCssClass)[0] || parentElement;
                    }

                    this.renderInto(parentElement);
                }
            },

            /**
             * Retrieves current child widgets grouped by container CSS class name.
             * @returns {$data.Collection}
             * @private
             */
            _getChildrenGroupedByContainer: function () {
                var that = this;

                return this.children
                    .collectProperty('containerCssClass')
                    .toStringDictionary()
                    .reverse()
                    .toCollection()
                    .mapValues(function (childNames) {
                        return childNames instanceof Array ?
                            that.getChildren.apply(that, childNames) :
                            that.getChild(childNames);
                    });
            }
        })
        .addMethods(/** @lends $widget.Widget# */{
            /**
             * Extends the widget class. Same as `$oop.Base.extend()` in all respects except for incorporating the
             * functionality of `Documented.extend()`, and adding the class name to the HTML attributes as CSS class.
             * @example
             * var MyWidget = $widget.Widget.extend('MyWidget');
             * @param {string} className
             * @returns {$oop.Base}
             * @see $oop.Base.extend
             * @see $utils.Documented.extend
             */
            extend: function (className) {
                var that = $utils.Documented.extend.call(this, className);

                that.htmlAttributes = this.htmlAttributes.clone()
                    .addCssClass(className);

                return that;
            },

            /**
             * Adds trait to widget class. Same as `$widget.addTrait()`, except for optionally adding the trait name
             * to the widget's HTML attributes as CSS class.
             * @example
             * var MyWidget = $widget.Widget.extend('MyWidget')
             *     .addTrait(TraitClass, 'TraitClass');
             * @param {object} trait
             * @param {string} [traitName] Name of trait. Must be the same as the name of the trait object.
             * @returns {$widget.Widget} Widget class the method was called on.
             */
            addTrait: function (trait, traitName) {
                $assertion.isStringOptional(traitName, "Invalid trait name");

                base.addTrait.call(this, trait);

                if (traitName) {
                    this.htmlAttributes.addCssClass(traitName);
                }

                return this;
            },

            /**
             * Adds trait to widget class, and extends the class afterwards. Same as `$widget.addTrait()`,
             * except for optionally adding the trait name to the widget's HTML attributes as CSS class.
             * @param {$oop.Base} trait
             * @param {string} [traitName] Name of trait. Must be the same as the name of the trait object.
             * @returns {$widget.Widget} Extended widget class.
             */
            addTraitAndExtend: function (trait, traitName) {
                return this
                    .addTrait(trait, traitName)
                    .extend(this.className);
            },

            /** @ignore */
            init: function () {
                $widget.Progenitor.init.call(this);

                var widgetId = this.instanceId.toWidgetId();

                $widget.Renderable.init.call(this,
                    this.htmlAttributes.clone()
                        .setIdAttribute(widgetId));

                /**
                 * Specifies what element to render the widget in in the context of its parents' DOM.
                 * The first element found to be having this CSS class will be the parent DOM node
                 * for the current widget's DOM.
                 * @type {string}
                 */
                this.containerCssClass = undefined;

                /**
                 * Child widgets. Modifies the `children` property delegated by `$widget.Progenitor`
                 * by treating it as a `WidgetCollection` rather than a regular `$data.Collection`.
                 * @type {$widget.WidgetCollection}
                 */
                this.children = this.children.toWidgetCollection();

                // initializing Evented trait
                this.setEventSpace($widget.widgetEventSpace)
                    .setEventPath(this.getLineage().prepend(self.DETACHED_EVENT_PATH_ROOT));

                // setting default child name to (unique) widget ID
                this.setChildName(widgetId);
            },

            /**
             * Sets container CSS class property. The widget, when added to a parent, will be rendered inside the first
             * element to be found inside the parent's DOM bearing this CSS class.
             * @param {string} containerCssClass
             * @returns {$widget.Widget}
             */
            setContainerCssClass: function (containerCssClass) {
                $assertion.isString(containerCssClass, "Invalid container selector");
                this.containerCssClass = containerCssClass;
                return this;
            },

            /**
             * Determines whether current widget is connected to the root widget via its parent chain.
             * @returns {boolean}
             */
            isOnRoot: function () {
                var widget = this;
                while (widget.parent) {
                    widget = widget.parent;
                }
                return widget === this.rootWidget;
            },

            /**
             * Adds current widget to specified parent as child.
             * Also triggers rendering the child inside the parent's DOM, according to `.containerCssClass`.
             * @param {$widget.Widget} parentWidget
             * @returns {$widget.Widget}
             * @see $widget.Widget#containerCssClass
             */
            addToParent: function (parentWidget) {
                $assertion.isWidget(parentWidget, "Invalid parent widget");

                var childName = this.childName,
                    currentChild = parentWidget.children.getItem(childName);

                $widget.Progenitor.addToParent.call(this, parentWidget);

                if (currentChild !== this) {
                    // child on parent may be replaced
                    if (this.isOnRoot()) {
                        // current widget is attached to root widget
                        // widget lifecycle method may be run
                        this.addToHierarchy()
                            .afterAdd();
                    }

                    if (document) {
                        this._renderIntoParent();
                    }
                }

                return this;
            },

            /**
             * Sets / replaces root widget with current widget.
             * @returns {$widget.Widget}
             */
            setRootWidget: function () {
                var rootWidget = this.rootWidget;

                if (rootWidget !== this) {
                    if (rootWidget) {
                        rootWidget.removeRootWidget();
                    }

                    $widget.Widget.rootWidget = this;

                    this.addToHierarchy()
                        .afterAdd();

                    if (document && !this.getElement()) {
                        this.renderInto(document.getElementsByTagName('body')[0]);
                    }
                }

                return this;
            },

            /**
             * Removes current widget from its parent.
             * Has no effect when current widget has no parent.
             * @returns {$widget.Widget}
             */
            removeFromParent: function () {
                var element = this.getElement(),
                    parent = this.parent,
                    wasAttachedToRoot = this.isOnRoot();

                $widget.Progenitor.removeFromParent.call(this);

                if (element && element.parentNode) {
                    element.parentNode.removeChild(element);
                }

                if (wasAttachedToRoot) {
                    this.removeFromHierarchy()
                        .afterRemove();
                }

                return this;
            },

            /**
             * Removes current widget as root widget.
             * @returns {$widget.Widget}
             */
            removeRootWidget: function () {
                this.removeFromParent();
                self.rootWidget = undefined;
                return this;
            },

            /**
             * Sets name of current widget in the context of its parent.
             * For widgets it also determines the order in which they are rendered inside the same container element.
             * @param {string} childName
             * @returns {$widget.Widget}
             */
            setChildName: function (childName) {
                var oldChildName = this.childName;

                $widget.Progenitor.setChildName.call(this, childName);

                if (childName !== oldChildName) {
                    this.removeCssClass(oldChildName)
                        .addCssClass(childName);
                }

                return this;
            },

            /**
             * Fetches child widgets and returns them as a WidgetCollection.
             * @returns {$widget.WidgetCollection}
             */
            getChildren: function () {
                return $widget.Progenitor.getChildren.apply(this, arguments)
                    .filterByType($widget.Widget)
                    .toWidgetCollection();
            },

            /**
             * Retrieves the widget that is adjacent to the widget specified by its `childName` property
             * in the context of the specified parent (DOM) element.
             * @param {string} childName
             * @param {HTMLElement} parentElement
             * @returns {$widget.Widget}
             */
            getAdjacentWidget: function (childName, parentElement) {
                var childWidgetIds = $data.Collection.create(this._getWidgetIdsInDom(parentElement)),
                    childWidgets = childWidgetIds
                        .callOnEachItem('toWidget'),
                    childWidgetNames = childWidgets
                        .collectProperty('childName')
                        .toOrderedStringList(),
                    spliceIndex = childWidgetNames.spliceIndexOf(childName);

                return childWidgets.getItem(spliceIndex.toString());
            },

            /**
             * Renders current widget into the specified (DOM) element.
             * @param {HTMLElement} element
             * @returns {$widget.Widget}
             */
            renderInto: function (element) {
                $assertion.isElement(element, "Invalid target element");

                var adjacentWidget = this.getAdjacentWidget(this.childName, element);

                if (adjacentWidget && adjacentWidget.childName >= this.childName) {
                    // when there is an adjacent widget whose childName is bigger than that of the current widget
                    $widget.Renderable.renderBefore.call(this, adjacentWidget.getElement());
                } else {
                    $widget.Renderable.renderInto.call(this, element);
                }

                this.afterRender();

                return this;
            },

            /**
             * Renders current widget before the specified (DOM) element.
             * @param {HTMLElement} element
             * @returns {$widget.Widget}
             */
            renderBefore: function (element) {
                $assertion.isElement(element, "Invalid target element");
                $widget.Renderable.renderBefore.call(this, element);
                this.afterRender();
                return this;
            },

            /**
             * Re-renders element in its current position in the DOM.
             * Using `reRender` is considered an anti-pattern. Even though re-rendering an already rendered widget
             * does update the widget's DOM, but it is proven to be slow, and risks memory leaks in case there are
             * hard references held to the old DOM. It also makes transitions, input focus, etc. harder to manage.
             * @returns {$widget.Widget}
             */
            reRender: function () {
                $widget.Renderable.reRender.call(this);
                this.afterRender();
                return this;
            },

            /**
             * Re-renders element's contents.
             * Using `reRenderContents` is considered an anti-pattern. Even though re-rendering an already rendered
             * widget does update the widget's DOM, but it is proven to be slow, and risks memory leaks
             * in case there are hard references held to the old DOM contents. It also makes transitions,
             * input focus, etc. harder to manage.
             * @returns {$widget.Widget}
             */
            reRenderContents: function () {
                $widget.Renderable.reRenderContents.call(this);
                this.afterRender();
                return this;
            },

            /**
             * Retrieves content markup as a filled-in MarkupTemplate.
             * Override this method to add more content to the template.
             * @returns {$widget.MarkupTemplate}
             * @ignore
             */
            contentMarkupAsTemplate: function () {
                return $widget.Renderable.contentMarkupAsTemplate.call(this)
                    .setParameterValues(this._getChildrenGroupedByContainer().items);
            },

            /**
             * Default content markup definition for widgets.
             * Renders children as DOM siblings inside their container in order of their child names.
             * @returns {string}
             * @ignore
             */
            contentMarkup: function () {
                return this.contentTemplate ?
                    this.contentMarkupAsTemplate().toString() :
                    this.children.toString();
            },

            /**
             * Adds widget and its children to the hierarchy, updating their event paths and adding them to registry.
             * Not part of the public Widget API, do not call directly.
             * @returns {$widget.Widget}
             */
            addToHierarchy: function () {
                // setting event path for triggering widget events
                this.setEventPath(this.getLineage().prepend(self.ATTACHED_EVENT_PATH_ROOT));

                // adding widget to lookup registry
                this.addToRegistry();

                this.children.addToHierarchy();

                return this;
            },

            /**
             * Override method that is called after the widget is added to the hierarchy.
             * This is the place to initialize the widget lifecycle. Eg. sync the widget's state to the model,
             * subscribe to events, etc.
             * Make sure the override calls the `afterAdd` method of the super and all traits that implement it.
             */
            afterAdd: function () {
                this.children.afterAdd();
            },

            /**
             * Removes widget and its children from the hierarchy, updating their event path,
             * unsubscribing from widget events, and removing them from registry.
             * Not part of the public Widget API, do not call directly.
             * @returns {$widget.Widget}
             */
            removeFromHierarchy: function () {
                this.children.removeFromHierarchy();

                // unsubscribing from all widget events
                this.unsubscribeFrom();

                // (re-)setting event path to new lineage
                this.setEventPath(this.getLineage().prepend(self.DETACHED_EVENT_PATH_ROOT));

                // removing widget from lookup registry
                this.removeFromRegistry();

                return this;
            },

            /**
             * Override method that is called after the widget is removed from the hierarchy.
             * This is the place to de-initialize the widget lifecycle, usually by countering the actions taken in
             * `afterAdd`. Eg. unsubscribing from events.
             * Make sure the override calls the `afterRemove` method of the super and all traits that implement it.
             */
            afterRemove: function () {
                this.children.afterRemove();
            },

            /**
             * Override method that is called after the widget is rendered into the DOM.
             * This is the place to initialize the widget's DOM. Eg. by subscribing to UI events,
             * triggering transitions, etc.
             * Make sure the override calls the `afterRender` method of the super and all traits that implement it.
             */
            afterRender: function () {
                if (this.getElement()) {
                    this.children.afterRender();
                }
            }
        });
});

(function () {
    "use strict";

    $assertion.addTypes(/** @lends $widget */{
        /** @param {$widget.Widget} expr */
        isWidget: function (expr) {
            return $widget.Widget.isBaseOf(expr);
        },

        /** @param {$widget.Widget} expr */
        isWidgetOptional: function (expr) {
            return typeof expr === 'undefined' ||
                $widget.Widget.isBaseOf(expr);
        },

        /** @param {Element} expr */
        isElement: function (expr) {
            return expr instanceof Element;
        }
    });

    $oop.extendBuiltIn(String.prototype, /** @lends String# */{
        /**
         * Converts `String` to `Widget` by looking up the widget corresponding to the current string
         * as its widget ID. Conversion yields no result when the widget is not in the hierarchy.
         * String must be in the 'w#' format (lowercase 'w' followed by digits).
         * @returns {$widget.Widget}
         */
        toWidget: function () {
            return $utils.Managed.getInstanceById(this.toInstanceIdFromWidgetId());
        },

        /**
         * Converts string widget ID ('w###') to an instance ID (number).
         * @returns {number}
         */
        toInstanceIdFromWidgetId: function () {
            return parseInt(this.slice(1), 10);
        }
    });

    $oop.extendBuiltIn(Number.prototype, /** @lends Number# */{
        /**
         * Converts current number as instance ID to widget ID.
         * The widget ID is used as the ID attribute of the rendered widget's container element.
         * @returns {string}
         */
        toWidgetId: function () {
            return 'w' + this;
        }
    });

    if (Element) {
        $oop.extendBuiltIn(Element.prototype, /** @lends Element# */{
            /**
             * Converts `Element` to `Widget` using the element's ID attribute as widget ID.
             * @returns {$widget.Widget}
             */
            toWidget: function () {
                return $utils.Managed.getInstanceById(this.id.toInstanceIdFromWidgetId());
            }
        });
    }

    if (Event) {
        $oop.extendBuiltIn(Event.prototype, /** @lends Event# */{
            /**
             * Converts `Event` to `Widget`.
             * Uses the event's target to look up the nearest parent element matching the specified class name.
             * Then uses the element that was found as basis for conversion from `Element` to `Widget`.
             * @param {string} [cssClassName]
             * @returns {$widget.Widget}
             * @see Element#toWidget
             */
            toWidget: function (cssClassName) {
                cssClassName = cssClassName || $widget.Widget.className;

                var childElement = this.target,
                    widgetElement = $widget.WidgetUtils.getParentNodeByClassName(childElement, cssClassName);

                return widgetElement ?
                    $utils.Managed.getInstanceById(widgetElement.id.toInstanceIdFromWidgetId()) :
                    undefined;
            }
        });
    }
}());

$oop.postpone($widget, 'WidgetCollection', function () {
    "use strict";

    var base = $data.Collection.of($widget.Widget),
        self = base.extend();

    /**
     * Creates a WidgetCollection instance.
     * @name $widget.WidgetCollection.create
     * @function
     * @param {object} [items]
     * @returns {$widget.WidgetCollection}
     */

    /**
     * The WidgetCollection is a specified collection merging the Collection API with the Widget API.
     * Also allows serialization of all widgets in the collection into a single string.
     * @class
     * @extends $data.Collection
     * @extends $widget.Widget
     */
    $widget.WidgetCollection = self
        .addMethods(/** @lends $widget.WidgetCollection# */{
            /**
             * Generates the markup for all widgets in the collection, in the order of their names.
             * @returns {string}
             */
            toString: function () {
                return this.callOnEachItem('toString')
                    .getSortedValues()
                    .join('');
            }
        });
});

$oop.amendPostponed($data, 'Hash', function () {
    "use strict";

    $data.Hash
        .addMethods(/** @lends $data.Hash# */{
            /**
             * Converts `Hash` to `WidgetCollection`.
             * @returns {$widget.WidgetCollection}
             */
            toWidgetCollection: function () {
                return $widget.WidgetCollection.create(this.items);
            }
        });
});

(function () {
    "use strict";

    $oop.extendBuiltIn(Array.prototype, /** @lends Array# */{
        /**
         * Converts array of `Widget` instances to a `WidgetCollection`.
         * @returns {$widget.WidgetCollection}
         */
        toWidgetCollection: function () {
            return $widget.WidgetCollection.create(this);
        }
    });
}());

/*jshint node:true */
if (typeof module === 'object') {
    module.exports = $widget;
}

/*jshint node:true */

/** @namespace */
var $entity = {};

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

if (typeof require === 'function') {
    var $templating = $templating || require('giant-templating');
}

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

/**
 * @name $data.Path
 * @class
 */

$oop.postpone($entity, 'entityEventSpace', function () {
    "use strict";

    /**
     * Event space dedicated to entity events.
     * @type {$event.EventSpace}
     */
    $entity.entityEventSpace = $event.EventSpace.create();
});

$oop.postpone($entity, 'config', function () {
    "use strict";

    /**
     * Contains meta-entities describing document types and their fields.
     * @type {$data.Tree}
     */
    $entity.config = $data.Tree.create({
        document: {
            document: {
            },

            field: {
                //                /** Sample config documents. */
                //                'user/name'   : {
                //                    /** Field contains string */
                //                    fieldType: 'string'
                //                },
                //                'user/age'    : {
                //                    /** Field contains number */
                //                    fieldType: 'number'
                //                },
                //                'user/emails' : {
                //                    /** Field contains collection */
                //                    fieldType: 'collection',
                //                    /** Items are strings */
                //                    itemType : 'string'
                //                },
                //                'user/friends': {
                //                    /** Field contains collection */
                //                    fieldType : 'collection',
                //                    /** Items are booleans */
                //                    itemType  : 'boolean',
                //                    /** Item IDs are references */
                //                    itemIdType: 'reference'
                //                }
            }
        }
    });
});

$oop.postpone($entity, 'entities', function () {
    "use strict";

    /**
     * Contains entities.
     * @type {$data.Tree}
     */
    $entity.entities = $data.Tree.create();
});

$oop.postpone($entity, 'index', function () {
    "use strict";

    /**
     * Contains indexes and lookups.
     * @type {$data.Tree}
     */
    $entity.index = $data.Tree.create();
});

$oop.postpone($entity, 'EntityChangeEvent', function () {
    "use strict";

    var base = $event.Event,
        self = base.extend();

    /**
     * Instantiates class.
     * @name $entity.EntityChangeEvent.create
     * @param {string} eventName Event name
     * @param {$event.EventSpace} eventSpace Event space associated with event
     * @function
     * @returns {$entity.EntityChangeEvent}
     */

    /**
     * @class
     * @extends $event.Event
     */
    $entity.EntityChangeEvent = self
        .addMethods(/** @lends $entity.EntityChangeEvent# */{
            /**
             * @param {string} eventName
             * @param {$event.EventSpace} eventSpace
             * @ignore
             */
            init: function (eventName, eventSpace) {
                base.init.call(this, eventName, eventSpace);

                /**
                 * Node value before change.
                 * @type {*}
                 */
                this.beforeNode = undefined;

                /**
                 * Node value after change.
                 * @type {*}
                 */
                this.afterNode = undefined;

                /**
                 * Identifies the node that changed if it is different from the observed key.
                 * @type {$entity.EntityKey}
                 */
                this.affectedKey = undefined;
            },

            /**
             * Clones entity change event.
             * @param {$data.Path} [currentPath]
             * @returns {$event.Event}
             */
            clone: function (currentPath) {
                return base.clone.call(this, currentPath)
                    .setBeforeNode(this.beforeNode)
                    .setAfterNode(this.afterNode);
            },

            /**
             * Sets event load before the change.
             * @param {*} value
             * @returns {$entity.EntityChangeEvent}
             */
            setBeforeNode: function (value) {
                this.beforeNode = value;
                return this;
            },

            /**
             * Sets event load after the change.
             * @param {*} value
             * @returns {$entity.EntityChangeEvent}
             */
            setAfterNode: function (value) {
                this.afterNode = value;
                return this;
            },

            /**
             * Sets key identifying changed node.
             * @param {$entity.EntityKey} affectedKey
             * @returns {$entity.EntityChangeEvent}
             */
            setAffectedKey: function (affectedKey) {
                this.affectedKey = affectedKey;
                return this;
            },

            /**
             * Tells whether change event represents an insert.
             * @returns {boolean}
             */
            isInsert: function () {
                return typeof this.beforeNode === 'undefined' &&
                       typeof this.afterNode !== 'undefined';
            },

            /**
             * Tells whether change event represents a deletion.
             * @returns {boolean}
             */
            isDelete: function () {
                return typeof this.beforeNode !== 'undefined' &&
                       typeof this.afterNode === 'undefined';
            }
        });
});

$oop.amendPostponed($event, 'Event', function () {
    "use strict";

    $event.Event.addSurrogate($entity, 'EntityChangeEvent', function (eventName) {
        var prefix = 'entity.change';
        return eventName.substr(0, prefix.length) === prefix;
    });
});

(function () {
    "use strict";

    $assertion.addTypes(/** @lends $entity */{
        /**
         * @param {$entity.EntityChangeEvent} expr
         */
        isEntityChangeEvent: function (expr) {
            return $entity.EntityChangeEvent.isBaseOf(expr);
        },

        /**
         * @param {$entity.EntityChangeEvent} expr
         */
        isEntityChangeEventOptional: function (expr) {
            return typeof expr === 'undefined' ||
                   $entity.EntityChangeEvent.isBaseOf(expr);
        }
    });
}());

$oop.postpone($entity, 'EntityKey', function () {
    "use strict";

    var base = $oop.Base,
        self = base.extend()
            .addTrait($event.Evented);

    /**
     * Creates an EntityKey instance.
     * Do not create EntityKey instances directly, only through its subclasses.
     * @name $entity.EntityKey.create
     * @function
     * @returns {$entity.EntityKey}
     */

    /**
     * Base class for entity keys.
     * Entity keys identify entities without relying on their actual content.
     * @class
     * @extends $oop.Base
     * @extends $event.Evented
     * @extends $utils.Stringifiable
     */
    $entity.EntityKey = self
        .setEventSpace($entity.entityEventSpace)
        .setEventPath('entity'.toPath())
        .addMethods(/** @lends $entity.EntityKey# */{
            /** @ignore */
            init: function () {
                $event.Evented.init.call(this);
            },

            /**
             * Fetches an attribute key based on the current key as parent and the specified attribute name.
             * @param {string} attributeName
             * @returns {$entity.AttributeKey}
             */
            getAttributeKey: function (attributeName) {
                return $entity.AttributeKey.create(this, attributeName);
            }
        });

    /**
     * Tells whether specified entity key is identical to the current one.
     * @name $entity.EntityKey#equals
     * @function
     * @param {$entity.EntityKey} key
     * @returns {boolean}
     */

    /**
     * Fetches a key to the document that contains the config information about the current entity.
     * @name $entity.EntityKey#getConfigKey
     * @function
     * @returns {$entity.DocumentKey}
     */

    /**
     * Resolves key to a path that points to the entity node in the cache.
     * @name $entity.EntityKey#getEntityPath
     * @function
     * @returns {$data.Path}
     */
});

(function () {
    "use strict";

    $assertion.addTypes(/** @lends $entity */{
        /** @param {$entity.EntityKey} expr */
        isEntityKey: function (expr) {
            return $entity.EntityKey.isBaseOf(expr);
        },

        /** @param {$entity.EntityKey} [expr] */
        isEntityKeyOptional: function (expr) {
            return typeof expr === 'undefined' ||
                   $entity.EntityKey.isBaseOf(expr);
        }
    });
}());

$oop.postpone($entity, 'AttributeKey', function () {
    "use strict";

    var base = $entity.EntityKey,
        self = base.extend();

    /**
     * @name $entity.AttributeKey.create
     * @function
     * @param {$entity.EntityKey} parentKey Identifies the entity the attribute belongs to.
     * @param {string} attributeName Identifies the attribute relative to the parent entity.
     * @returns {$entity.AttributeKey}
     */

    /**
     * @class
     * @extends $entity.EntityKey
     */
    $entity.AttributeKey = self
        .setEventPath(['document'].toPath().prepend(base.eventPath))
        .addMethods(/** @lends $entity.AttributeKey# */{
            /**
             * @param {$entity.EntityKey} parentKey
             * @param {string} attributeName
             * @ignore
             */
            init: function (parentKey, attributeName) {
                base.init.call(this);

                /**
                 * @type {$entity.EntityKey}
                 */
                this.parentKey = parentKey;

                /**
                 * @type {string}
                 */
                this.attributeName = attributeName;

                this.setEventPath([attributeName].toPath().prepend(parentKey.eventPath));
            },

            /**
             * Tells whether the specified `AttributeKey` instance is equivalent to the current one.
             * @param {$entity.AttributeKey} attributeKey
             * @returns {boolean}
             */
            equals: function (attributeKey) {
                return attributeKey &&
                    this.parentKey.equals(attributeKey.parentKey) &&
                    this.attributeName === attributeKey.attributeName;
            },

            /**
             * Resolves attribute key based on the parent key and attribute name.
             * @returns {$data.Path}
             */
            getEntityPath: function () {
                return this.parentKey.getEntityPath().appendKey(this.attributeName);
            }
        });
});

(function () {
    "use strict";

    $assertion.addTypes(/** @lends $entity */{
        /** @param {$entity.AttributeKey} expr */
        isAttributeKey: function (expr) {
            return $entity.AttributeKey.isBaseOf(expr);
        },

        /** @param {$entity.AttributeKey} [expr] */
        isAttributeKeyOptional: function (expr) {
            return typeof expr === 'undefined' ||
                $entity.AttributeKey.isBaseOf(expr);
        }
    });
}());

$oop.postpone($entity, 'DocumentKey', function () {
    "use strict";

    var base = $entity.EntityKey,
        self = base.extend();

    /**
     * Creates a DocumentKey instance.
     * DocumentKey instances may also be created via conversion from string or array.
     * @name $entity.DocumentKey.create
     * @function
     * @param {string} documentType Identifies document type.
     * @param {string} documentId Identifies document in the context of its document type.
     * @returns {$entity.DocumentKey}
     */

    /**
     * The DocumentKey class identifies document nodes in the cache.
     * @class
     * @extends $entity.EntityKey
     */
    $entity.DocumentKey = self
        .setEventPath(['document'].toPath().prepend(base.eventPath))
        .addMethods(/** @lends $entity.DocumentKey# */{
            /**
             * @param {string} documentType
             * @param {string} documentId
             * @ignore
             */
            init: function (documentType, documentId) {
                base.init.call(this);

                /**
                 * Document type.
                 * @type {string}
                 */
                this.documentType = documentType;

                /**
                 * Document identifier.
                 * @type {string}
                 */
                this.documentId = documentId;

                this.setEventPath([documentType, documentId].toPath().prepend(this.eventPath));
            },

            /**
             * Tells whether the specified `DocumentKey` instance is equivalent to the current one.
             * @param {$entity.DocumentKey} documentKey
             * @returns {boolean}
             */
            equals: function (documentKey) {
                return documentKey &&
                    this.documentType === documentKey.documentType &&
                    this.documentId === documentKey.documentId;
            },

            /**
             * Fetches a document key to the
             * @returns {$entity.DocumentKey}
             */
            getConfigKey: function () {
                return ['document', this.documentType].toDocumentKey();
            },

            /**
             * Determines absolute path to the entity node of the document identified by the current key.
             * In case document node sits on a different path for a certain `documentType`,
             * subclass `DocumentKey` and override `.getEntityPath()` to reflect the correct path.
             * @returns {$data.Path}
             */
            getEntityPath: function () {
                return ['document', String(this.documentType), String(this.documentId)].toPath();
            },

            /**
             * Creates a `FieldKey` instance based on the current document key and the specified field name.
             * @param {string} fieldName
             * @returns {$entity.FieldKey}
             */
            getFieldKey: function (fieldName) {
                return $entity.FieldKey.create(
                    this.documentType,
                    this.documentId,
                    fieldName
                );
            },

            /**
             * Serializes current document key.
             * @example
             * $entity.DocumentKey.create('user', '1234').toString() // "user/1234"
             * @returns {string}
             */
            toString: function () {
                var StringUtils = $utils.StringUtils;
                return StringUtils.escapeChars(this.documentType, '/') + '/' +
                    StringUtils.escapeChars(this.documentId, '/');
            }
        });
});

(function () {
    "use strict";

    $assertion.addTypes(/** @lends $entity */{
        /** @param {$entity.DocumentKey} expr */
        isDocumentKey: function (expr) {
            return $entity.DocumentKey.isBaseOf(expr);
        },

        /** @param {$entity.DocumentKey} [expr] */
        isDocumentKeyOptional: function (expr) {
            return typeof expr === 'undefined' ||
                $entity.DocumentKey.isBaseOf(expr);
        }
    });

    $oop.extendBuiltIn(String.prototype, /** @lends String# */{
        /**
         * Converts `String` to a `DocumentKey` instance. Assumes string is a serialized document key.
         * @returns {$entity.DocumentKey}
         */
        toDocumentKey: function () {
            var StringUtils = $utils.StringUtils,
                parts = StringUtils.safeSplit(this, '/'),
                documentType = parts[0],
                documentId = parts[1];

            return typeof documentType === 'string' && typeof documentId === 'string' ?
                $entity.DocumentKey.create(
                    StringUtils.unescapeChars(documentType, '/'),
                    StringUtils.unescapeChars(documentId, '/')) :
                undefined;
        }
    });

    $oop.extendBuiltIn(Array.prototype, /** @lends Array# */{
        /**
         * Converts `Array` (of strings) to a `DocumentKey` instance.
         * Assumes array is a document key in array notation.
         * @returns {$entity.DocumentKey}
         * @example
         * ['foo', 'bar'].toDocumentKey() // single document key
         */
        toDocumentKey: function () {
            var documentType = this[0],
                documentId = this[1];

            return typeof documentType !== 'undefined' && typeof documentId !== 'undefined' ?
                $entity.DocumentKey.create(documentType, documentId) :
                undefined;
        }
    });
}());

$oop.postpone($entity, 'DocumentKeyCollection', function () {
    "use strict";

    /**
     * Creates a DocumentKeyCollection instance.
     * @name $entity.DocumentKeyCollection.create
     * @function
     * @param {object} [items]
     * @returns {$entity.DocumentKeyCollection}
     */

    /**
     * The DocumentKeyCollection offers a simplified way of dealing with multiple document keys.
     * TODO: Add tests.
     * @example
     * // retrieves a collection of `Document` instances based on the specified document keys
     * ['user/1234', 'user/4321'].toDocumentKeyCollection().toDocument();
     * @class
     * @extends {$data.Collection}
     * @extends {$entity.DocumentKey}
     */
    $entity.DocumentKeyCollection = $data.Collection.of($entity.DocumentKey);
});

$oop.amendPostponed($data, 'Hash', function () {
    "use strict";

    $data.Hash
        .addMethods(/** @lends $data.Hash */{
            /**
             * Converts `Hash` instance to `DocumentKeyCollection` instance.
             * @returns {$entity.DocumentKeyCollection}
             */
            toDocumentKeyCollection: function () {
                return $entity.DocumentKeyCollection.create(this.items);
            }
        });
});

(function () {
    "use strict";

    $oop.extendBuiltIn(Array.prototype, /** @lends Array# */{
        /**
         * Converts `Array` (of `DocumentKey` instances) to a `DocumentKeyCollection` instance.
         * @returns {$entity.DocumentKeyCollection}
         * @example
         * ['foo/bar', 'foo/baz'].toDocumentKeyCollection() // collection of document keys
         */
        toDocumentKeyCollection: function () {
            return this
                .toCollection()
                .callOnEachItem('toDocumentKey')
                .toDocumentKeyCollection();
        }
    });
}());

$oop.postpone($entity, 'FieldKey', function () {
    "use strict";

    var base = $entity.EntityKey,
        self = base.extend();

    /**
     * Creates FieldKey instance.
     * FieldKey instances may also be created via conversion from string or array.
     * @name $entity.FieldKey.create
     * @function
     * @param {string} documentType Identifies type of document the field belongs to.
     * @param {string} documentId Identifies document (within document type) the field belongs to.
     * @param {string} fieldName Identifies field (within document).
     * @returns {$entity.FieldKey}
     */

    /**
     * The FieldKey class identifies a field entity nodes in the cache.
     * @class
     * @extends $entity.EntityKey
     */
    $entity.FieldKey = self
        .setEventPath(['document'].toPath().prepend(base.eventPath))
        .addMethods(/** @lends $entity.FieldKey# */{
            /**
             * @param {string} documentType
             * @param {string} documentId
             * @param {string} fieldName
             * @ignore
             */
            init: function (documentType, documentId, fieldName) {
                base.init.call(this);

                /**
                 * Document key reference.
                 * @type {$entity.DocumentKey}
                 */
                this.documentKey = $entity.DocumentKey.create(documentType, documentId);

                /**
                 * Name of current field.
                 * @type {string}
                 */
                this.fieldName = fieldName;

                this.setEventPath([fieldName].toPath().prepend(this.documentKey.eventPath));
            },

            /**
             * Tells whether current field key is equivalent to the specified one.
             * @param {$entity.FieldKey} fieldKey
             * @returns {boolean}
             */
            equals: function (fieldKey) {
                return fieldKey &&
                    this.documentKey.equals(fieldKey.documentKey) &&
                    this.fieldName === fieldKey.fieldName;
            },

            /**
             * Fetches key to config document that describes the current field.
             * @returns {$entity.DocumentKey}
             */
            getConfigKey: function () {
                var documentId = [this.documentKey.documentType, this.fieldName].toDocumentKey().toString();
                return ['field', documentId].toDocumentKey();
            },

            /**
             * Creates an `ItemKey` instance based on the current field key and the specified item ID.
             * @param {string} itemId
             * @returns {$entity.ItemKey}
             */
            getItemKey: function (itemId) {
                var documentKey = this.documentKey;

                return $entity.ItemKey.create(
                    documentKey.documentType,
                    documentKey.documentId,
                    this.fieldName,
                    itemId
                );
            },

            /**
             * Determines absolute path to the field node identified by the current key.
             * In case field node sits on a different path relative to the document node
             * for a certain `documentType` / `fieldName` combination,
             * subclass `FieldKey` and override `.getEntityPath()` to reflect the correct path.
             * @returns {$data.Path}
             */
            getEntityPath: function () {
                return this.documentKey
                    .getEntityPath()
                    .appendKey(String(this.fieldName));
            },

            /**
             * Retrieves the field type associated with the current field from the config datastore.
             * @returns {string}
             * @see $entity.config
             */
            getFieldType: function () {
                var field = this.getConfigKey().getFieldKey('fieldType');
                return $entity.config.getNode(field.getEntityPath());
            },

            /**
             * Retrieves item type string for the item entity identified by the current key.
             * @returns {string}
             */
            getItemType: function () {
                var field = this.getConfigKey().getFieldKey('itemType');
                return $entity.config.getNode(field.getEntityPath());
            },

            /**
             * Retrieves item type string for the item entity identified by the current key.
             * @returns {string}
             */
            getItemIdType: function () {
                var field = this.getConfigKey().getFieldKey('itemIdType');
                return $entity.config.getNode(field.getEntityPath());
            },

            /**
             * Serializes current field key.
             * @example
             * $entity.FieldKey.create('user', '1234', 'name').toString() // "user/1234/name"
             * @returns {string}
             */
            toString: function () {
                return this.documentKey.toString() + '/' +
                    $utils.StringUtils.escapeChars(this.fieldName, '/');
            }
        });
});

(function () {
    "use strict";

    $assertion.addTypes(/** @lends $entity */{
        /** @param {$entity.FieldKey} expr */
        isFieldKey: function (expr) {
            return $entity.FieldKey.isBaseOf(expr);
        },

        /** @param {$entity.FieldKey} expr */
        isFieldKeyStrict: function (expr) {
            return $entity.FieldKey.isBaseOf(expr) &&
                expr.getBase() === $entity.FieldKey;
        },

        /** @param {$entity.FieldKey} [expr] */
        isFieldKeyOptional: function (expr) {
            return typeof expr === 'undefined' ||
                $entity.FieldKey.isBaseOf(expr);
        }
    });

    $oop.extendBuiltIn(String.prototype, /** @lends String# */{
        /**
         * Converts `String` to a `FieldKey`. Assumes that string is a serialized `FieldKey`.
         * @returns {$entity.FieldKey}
         */
        toFieldKey: function () {
            var StringUtils = $utils.StringUtils,
                parts = StringUtils.safeSplit(this, '/'),
                documentType = parts[0],
                documentId = parts[1],
                fieldName = parts[2];

            return typeof documentType === 'string' &&
                typeof documentId === 'string' &&
                typeof fieldName === 'string' ?
                $entity.FieldKey.create(
                    StringUtils.unescapeChars(documentType, '/'),
                    StringUtils.unescapeChars(documentId, '/'),
                    StringUtils.unescapeChars(fieldName, '/')) :
                undefined;
        }
    });

    $oop.extendBuiltIn(Array.prototype, /** @lends Array# */{
        /**
         * Converts `Array` (of strings) to a `FieldKey` instance.
         * Assumes that array is a field key in array notation.
         * @returns {$entity.FieldKey}
         */
        toFieldKey: function () {
            var documentType = this[0],
                documentId = this[1],
                fieldName = this[2];

            return typeof documentType !== 'undefined' &&
                typeof documentId !== 'undefined' &&
                typeof fieldName !== 'undefined' ?
                $entity.FieldKey.create(documentType, documentId, fieldName) :
                undefined;
        }
    });
}());

$oop.postpone($entity, 'ItemKey', function () {
    "use strict";

    var base = $entity.FieldKey,
        self = base.extend();

    /**
     * Creates an ItemKey instance.
     * ItemKey instances may also be created via conversion from string or array.
     * @name $entity.ItemKey.create
     * @function
     * @param {string} documentType Identifies type of document the current item belongs to.
     * @param {string} documentId Identifies the document (within document type) the current item belongs to.
     * @param {string} fieldName Identifies field (within document) the current item belongs to.
     * @param {string} itemId Identifies item (within field).
     * @returns {$entity.ItemKey}
     */

    /**
     * The ItemKey class identifies item entity nodes in the cache.
     * `ItemKey` subclasses `FieldKey` so that any method that accepts `FieldKey` as argument, would also accept
     * `ItemKey`. Whatever works with fields, should also work with collection items.
     * @class
     * @extends $entity.FieldKey
     */
    $entity.ItemKey = self
        .addMethods(/** @lends $entity.ItemKey# */{
            /**
             * @param {string} documentType
             * @param {string} documentId
             * @param {string} fieldName
             * @param {string} itemId
             * @ignore
             */
            init: function (documentType, documentId, fieldName, itemId) {
                base.init.call(this, documentType, documentId, fieldName);

                /**
                 * Identifies item in collection.
                 * @type {string}
                 */
                this.itemId = itemId;

                this.eventPath.appendKey(itemId);
            },

            /**
             * Tells whether specified `ItemKey` instance is equivalent to the current one.
             * @param {$entity.ItemKey} itemKey
             * @returns {boolean}
             */
            equals: function (itemKey) {
                return itemKey &&
                    $entity.FieldKey.equals.call(this, itemKey) &&
                    this.itemId === itemKey.itemId;
            },

            /**
             * Determines absolute path for the item identified by the current key.
             * In case the item entity node sits on a different path
             * relative to the field node for a certain `documentType` / `fieldName` combination,
             * subclass `ItemKey` and override `.getEntityPath()` to reflect the correct path.
             * @returns {$data.Path}
             */
            getEntityPath: function () {
                return base.getEntityPath.call(this)
                    .appendKey(String(this.itemId));
            },

            /**
             * Creates a field key that is parent of the item identified by the current key.
             * @returns {$entity.FieldKey}
             */
            getFieldKey: function () {
                var documentKey = this.documentKey;
                return [documentKey.documentType, documentKey.documentId, this.fieldName].toFieldKey();
            },

            /**
             * Serializes current item key.
             * @example
             * $entity.ItemKey.create('user', '1234', 'phones', 'work').toString() // "user/1234/phones/work"
             * @returns {string}
             */
            toString: function () {
                return $entity.FieldKey.toString.call(this) + '/' +
                    $utils.StringUtils.escapeChars(this.itemId, '/');
            }
        });
});

(function () {
    "use strict";

    $assertion.addTypes(/** @lends $entity */{
        /** @param {$entity.ItemKey} expr */
        isItemKey: function (expr) {
            return $entity.ItemKey.isBaseOf(expr);
        },

        /** @param {$entity.ItemKey} [expr] */
        isItemKeyOptional: function (expr) {
            return typeof expr === 'undefined' ||
                $entity.ItemKey.isBaseOf(expr);
        }
    });

    $oop.extendBuiltIn(String.prototype, /** @lends String# */{
        /**
         * Converts `String` to `ItemKey`. Assumes the string to be serialized `ItemKey`.
         * @returns {$entity.ItemKey}
         */
        toItemKey: function () {
            var StringUtils = $utils.StringUtils,
                parts = StringUtils.safeSplit(this, '/'),
                documentType = parts[0],
                documentId = parts[1],
                fieldName = parts[2],
                itemId = parts[3];

            return typeof documentType === 'string' &&
                typeof documentId === 'string' &&
                typeof fieldName === 'string' &&
                typeof itemId === 'string' ?
                $entity.ItemKey.create(
                    StringUtils.unescapeChars(documentType, '/'),
                    StringUtils.unescapeChars(documentId, '/'),
                    StringUtils.unescapeChars(fieldName, '/'),
                    StringUtils.unescapeChars(itemId, '/')) :
                undefined;
        }
    });

    $oop.extendBuiltIn(Array.prototype, /** @lends Array# */{
        /**
         * Converts `Array` (of strings) to `ItemKey`. Assumes the array is an item key in array notation.
         * @returns {$entity.ItemKey}
         */
        toItemKey: function () {
            var documentType = this[0],
                documentId = this[1],
                fieldName = this[2],
                itemId = this[3];

            return typeof documentType !== 'undefined' &&
                typeof documentId !== 'undefined' &&
                typeof fieldName !== 'undefined' &&
                typeof itemId !== 'undefined' ?
                $entity.ItemKey.create(documentType, documentId, fieldName, itemId) :
                undefined;
        }
    });
}());

$oop.postpone($entity, 'ReferenceItemKey', function () {
    "use strict";

    var base = $entity.ItemKey,
        self = base.extend();

    /**
     * Creates ReferenceItemKey instance.
     * ReferenceItemKey instances may also be created via conversion from string or array,
     * as well as instantiating `ItemKey` with suitable arguments.
     * @name $entity.ReferenceItemKey.create
     * @function
     * @param {string} documentType Identifies type of document the current item belongs to.
     * @param {string} documentId Identifies the document (within document type) the current item belongs to.
     * @param {string} fieldName Identifies field (within document) the current item belongs to.
     * @param {string} ref Serialized `DocumentKey` identifying the referred document.
     * @returns {$entity.ReferenceItemKey}
     */

    /**
     * The ReferenceItemKey identifies an item node in the cache, the item ID of which is a document reference
     * (serialized `DocumentKey`).
     * @class
     * @extends $entity.ItemKey
     */
    $entity.ReferenceItemKey = self
        .addMethods(/** @lends $entity.ReferenceItemKey# */{
            /**
             * @param {string} documentType
             * @param {string} documentId
             * @param {string} fieldName
             * @param {string} ref
             * @ignore
             */
            init: function (documentType, documentId, fieldName, ref) {
                base.init.call(this, documentType, documentId, fieldName, ref);

                /**
                 * Key referenced by item ID.
                 * @type {$entity.DocumentKey}
                 */
                this.referenceKey = ref.toDocumentKey();
            }
        });
});

$oop.amendPostponed($entity, 'ItemKey', function () {
    "use strict";

    $entity.ItemKey
        .addSurrogate($entity, 'ReferenceItemKey', function (documentType, documentId, fieldName, itemId) {
            return itemId && itemId.toDocumentKey();
        });
});

(function () {
    "use strict";

    $assertion.addTypes(/** @lends $entity */{
        /** @param {$entity.ReferenceItemKey} expr */
        isReferenceItemKey: function (expr) {
            return $entity.ReferenceItemKey.isBaseOf(expr);
        },

        /** @param {$entity.ReferenceItemKey} [expr] */
        isReferenceItemKeyOptional: function (expr) {
            return typeof expr === 'undefined' ||
                $entity.ReferenceItemKey.isBaseOf(expr);
        }
    });

    $oop.extendBuiltIn(String.prototype, /** @lends String# */{
        /**
         * Converts `String` to a `ReferenceItemKey` instance. Assumes the string to be a serialized `ReferenceItemKey`.
         * @returns {$entity.ReferenceItemKey}
         */
        toReferenceItemKey: function () {
            var StringUtils = $utils.StringUtils,
                parts = StringUtils.safeSplit(this, '/'),
                documentType = parts[0],
                documentId = parts[1],
                fieldName = parts[2],
                itemId = parts[3],
                unescapedItemId;

            if (typeof documentType === 'string' &&
                typeof documentId === 'string' &&
                typeof fieldName === 'string' &&
                typeof itemId === 'string'
                ) {
                unescapedItemId = StringUtils.unescapeChars(itemId, '/');
            }

            return unescapedItemId && unescapedItemId.toDocumentKey() ?
                $entity.ReferenceItemKey.create(
                    StringUtils.unescapeChars(documentType, '/'),
                    StringUtils.unescapeChars(documentId, '/'),
                    StringUtils.unescapeChars(fieldName, '/'),
                    StringUtils.unescapeChars(itemId, '/')) :
                undefined;
        }
    });

    $oop.extendBuiltIn(Array.prototype, /** @lends Array# */{
        /**
         * Converts `Array` (of strings) to a `ReferenceItemKey` instance.
         * Assumes the array to be a reference item key in array notation.
         * @returns {$entity.ReferenceItemKey}
         */
        toReferenceItemKey: function () {
            var documentType = this[0],
                documentId = this[1],
                fieldName = this[2],
                itemId = this[3];

            return typeof documentType !== 'undefined' &&
                typeof documentId !== 'undefined' &&
                typeof fieldName !== 'undefined' &&
                typeof itemId !== 'undefined' &&
                itemId.toDocumentKey() ?
                $entity.ReferenceItemKey.create(documentType, documentId, fieldName, itemId) :
                undefined;
        }
    });
}());

$oop.postpone($entity, 'Entity', function () {
    "use strict";

    var base = $oop.Base,
        self = base.extend(),
        shallowCopy = $data.DataUtils.shallowCopy;

    /**
     * Creates an Entity instance.
     * Entity instantiation is expected to be done via subclasses, unless there are suitable surrogates defined.
     * @name $entity.Entity.create
     * @function
     * @param {$entity.EntityKey} entityKey Identifies entity.
     * @returns {$entity.Entity}
     */

    /**
     * The Entity class serves as the base class for all entities. It provides an API to access and modify the cache
     * node represented by the entity.
     * @class
     * @extends $oop.Base
     */
    $entity.Entity = self
        .addMethods(/** @lends $entity.Entity# */{
            /**
             * @param {$entity.EntityKey} entityKey
             * @ignore
             */
            init: function (entityKey) {
                /**
                 * Key that identifies the entity.
                 * @type {$entity.EntityKey}
                 */
                this.entityKey = entityKey;
            },

            /**
             * Fetches an Entity that is the current entity's parent.
             * Returns undefined by default. Subclasses need to override.
             * @returns {$entity.Entity}
             */
            getParentEntity: function () {
                return undefined;
            },

            /**
             * Fetches an Attribute entity for the specified attribute name.
             * @param {string} attributeName
             * @returns {$entity.Entity}
             */
            getAttribute: function (attributeName) {
                return this.entityKey.getAttributeKey(attributeName).toEntity();
            },

            /**
             * Fetches entity node from cache.
             * @returns {*}
             */
            getNode: function () {
                var entityPath = this.entityKey.getEntityPath(),
                    entityNode = $entity.entities.getNode(entityPath);

                if (typeof entityNode === 'undefined') {
                    // triggering event about absent node
                    this.entityKey.triggerSync($entity.EVENT_ENTITY_ACCESS);
                }

                return entityNode;
            },

            /**
             * Fetches entity node from cache, wrapped in a Hash instance.
             * @returns {$data.Hash}
             */
            getNodeAsHash: function () {
                return $data.Hash.create(this.getNode());
            },

            /**
             * Fetches entity node from cache without triggering access events.
             * @returns {*}
             */
            getSilentNode: function () {
                var entityPath = this.entityKey.getEntityPath();
                return $entity.entities.getNode(entityPath);
            },

            /**
             * Fetches entity node from cache, wrapped in a Hash instance, without triggering access events.
             * @returns {$data.Hash}
             */
            getSilentNodeAsHash: function () {
                return $data.Hash.create(this.getSilentNode());
            },

            /**
             * Touches entity node, triggering access event when absent, but not returning the node itself.
             * @returns {$entity.Entity}
             */
            touchNode: function () {
                this.getNode();
                return this;
            },

            /**
             * Replaces entity node with the specified value.
             * @param {*} node
             * @returns {$entity.Entity}
             */
            setNode: function (node) {
                var entityKey = this.entityKey,
                    beforeNode = this.getSilentNode();

                if (node !== beforeNode) {
                    $entity.entities.setNode(entityKey.getEntityPath(), node);

                    entityKey.spawnEvent($entity.EVENT_ENTITY_CHANGE)
                        .setBeforeNode(beforeNode)
                        .setAfterNode(node)
                        .triggerSync();
                }

                return this;
            },

            /**
             * Appends the specified node to the current node. Performs a shallow-merge.
             * In case of conflicts, the specified node's properties win out.
             * Triggering the event shallow copies the entire starting contents of the collection.
             * Do not use on large collections.
             * @param {object} node
             * @returns {$entity.Entity}
             */
            appendNode: function (node) {
                var that = this,
                    entityKey = this.entityKey,
                    entityPath = entityKey.getEntityPath(),
                    entityNode = this.getSilentNode(),
                    beforeNode = shallowCopy(entityNode);

                $entity.entities.appendNode(entityPath, node, function () {
                    entityKey.spawnEvent($entity.EVENT_ENTITY_CHANGE)
                        .setBeforeNode(beforeNode)
                        .setAfterNode(that.getSilentNode())
                        .triggerSync();
                });

                return this;
            },

            /**
             * Removes entity node from cache.
             * @returns {$entity.Entity}
             */
            unsetNode: function () {
                var entityKey = this.entityKey,
                    entityPath = entityKey.getEntityPath(),
                    beforeNode = this.getSilentNode();

                if (typeof beforeNode !== 'undefined') {
                    $entity.entities.unsetNode(entityPath);

                    entityKey.spawnEvent($entity.EVENT_ENTITY_CHANGE)
                        .setBeforeNode(beforeNode)
                        .triggerSync();
                }

                return this;
            },

            /**
             * Removes entity from cache, altering the parent node.
             * Performs shallow copy of the node, not recommended to use with large nodes,
             * eg. large collections.
             * @param {boolean} [splice] Whether to splice the parent node if it's an Array.
             * @returns {$entity.Entity}
             */
            unsetKey: function (splice) {
                var that = this,
                    parentEntity = this.getParentEntity(),
                    parentNodeBefore = shallowCopy(parentEntity.getNode()),
                    entityPath = this.entityKey.getEntityPath();

                $entity.entities.unsetKey(entityPath, splice, function (parentPath, parentNodeAfter) {
                    parentEntity.entityKey
                        .spawnEvent($entity.EVENT_ENTITY_CHANGE)
                        .setBeforeNode(parentNodeBefore)
                        .setAfterNode(parentNodeAfter)
                        .triggerSync();
                });

                return this;
            }
        });
});

(function () {
    "use strict";

    $oop.addGlobalConstants.call($entity, /** @lends $entity */{
        /**
         * Signals that an absent entity has been accessed.
         * TODO: Revisit after invalidation is implemented.
         * @constant
         */
        EVENT_ENTITY_ACCESS: 'entity.access',

        /**
         * Signals that an entity node was changed.
         * @constant
         */
        EVENT_ENTITY_CHANGE: 'entity.change'
    });
}());

$oop.amendPostponed($entity, 'EntityKey', function () {
    "use strict";

    $entity.EntityKey
        .addMethods(/** @lends $entity.EntityKey */{
            /** @returns {$entity.Entity} */
            toEntity: function () {
                return $entity.Entity.create(this);
            }
        });
});

$oop.postpone($entity, 'Attribute', function () {
    "use strict";

    var base = $entity.Entity,
        self = base.extend();

    /**
     * Creates a Attribute instance.
     * @name $entity.Attribute.create
     * @function
     * @param {$entity.AttributeKey} documentKey Identifies document.
     * @returns {$entity.Attribute}
     */

    /**
     * The Attribute class implements an API for attribute nodes.
     * Attribute nodes hold custom information about the entity they are associated with.
     * @class
     * @extends $entity.Entity
     */
    $entity.Attribute = self
        .addMethods(/** @lends $entity.Attribute# */{
            /**
             * @param {$entity.AttributeKey} attributeKey
             * @ignore
             */
            init: function (attributeKey) {
                $assertion.isAttributeKey(attributeKey, "Invalid attribute key");
                base.init.call(this, attributeKey);

                /**
                 * Attribute key associated with current entity.
                 * @name $entity.Attribute#entityKey
                 * @type {$entity.AttributeKey}
                 */
            },

            /**
             * Fetches entity the current attribute belongs to.
             * @returns {$entity.Entity}
             */
            getParentEntity: function () {
                return this.entityKey.parentKey.toEntity();
            }
        });
});

$oop.amendPostponed($entity, 'Entity', function () {
    "use strict";

    $entity.Entity
        .addSurrogate($entity, 'Attribute', function (entityKey) {
            return $entity.AttributeKey.isBaseOf(entityKey);
        });
});

$oop.amendPostponed($entity, 'AttributeKey', function () {
    "use strict";

    $entity.AttributeKey
        .addMethods(/** @lends $entity.AttributeKey */{
            /**
             * Converts `AttributeKey` to `Attribute`.
             * @returns {$entity.Attribute}
             */
            toAttribute: function () {
                return $entity.Attribute.create(this);
            }
        });
});

$oop.postpone($entity, 'Document', function () {
    "use strict";

    var base = $entity.Entity,
        self = base.extend();

    /**
     * Creates a Document instance.
     * A `Document` instance may also be created via conversion from string, array, and `DocumentKey`.
     * @name $entity.Document.create
     * @function
     * @param {$entity.DocumentKey} documentKey Identifies document.
     * @returns {$entity.Document}
     */

    /**
     * The Document class implements an API for document nodes,
     * granting access to the document's fields and attributes.
     * @class
     * @extends $entity.Entity
     */
    $entity.Document = self
        .addMethods(/** @lends $entity.Document# */{
            /**
             * @param {$entity.DocumentKey} documentKey
             * @ignore
             */
            init: function (documentKey) {
                $assertion.isDocumentKey(documentKey, "Invalid document key");
                base.init.call(this, documentKey);

                /**
                 * Document key associated with current entity.
                 * @name $entity.Document#entityKey
                 * @type {$entity.DocumentKey}
                 */
            },

            /**
             * Fetches entity associated with the document's fields.
             * Returns self by default.
             * @returns {$entity.Document}
             */
            getFieldsEntity: function () {
                return this;
            },

            /**
             * Retrieves Field entity matching the specified field name.
             * @param {string} fieldName
             * @returns {$entity.Field}
             */
            getField: function (fieldName) {
                return this.entityKey.getFieldKey(fieldName).toField();
            }
        });
});

$oop.amendPostponed($entity, 'Entity', function () {
    "use strict";

    $entity.Entity
        .addSurrogate($entity, 'Document', function (entityKey) {
            return $entity.DocumentKey.isBaseOf(entityKey);
        });
});

$oop.amendPostponed($entity, 'DocumentKey', function () {
    "use strict";

    $entity.DocumentKey
        .addMethods(/** @lends $entity.DocumentKey */{
            /**
             * Converts `DocumentKey` to `Document`.
             * @returns {$entity.Document}
             */
            toDocument: function () {
                return $entity.Document.create(this);
            }
        });
});

(function () {
    "use strict";

    $oop.extendBuiltIn(String.prototype, /** @lends String# */{
        /**
         * Converts `String` to `Document` instance, assuming the string is a serialized `DocumentKey`.
         * @returns {$entity.Document}
         */
        toDocument: function () {
            return $entity.Document.create(this.toDocumentKey());
        }
    });

    $oop.extendBuiltIn(Array.prototype, /** @lends Array# */{
        /**
         * Converts `Array` to `Document` instance, assuming the array is a document key in array notation.
         * @returns {$entity.Document}
         */
        toDocument: function () {
            return $entity.Document.create(this.toDocumentKey());
        }
    });
}());

$oop.postpone($entity, 'Field', function () {
    "use strict";

    var base = $entity.Entity,
        self = base.extend();

    /**
     * Creates a Field instance.
     * @name $entity.Field.create
     * @function
     * @param {$entity.FieldKey} fieldKey
     * @returns {$entity.Field}
     */

    /**
     * The Field entity class implements an API for document field nodes in the cache. Allows access and modification
     * of the field's value and attributes.
     * @class
     * @extends $entity.Entity
     * @extends $utils.Stringifiable
     */
    $entity.Field = self
        .addMethods(/** @lends $entity.Field# */{
            /**
             * @param {$entity.FieldKey} fieldKey
             * @ignore
             */
            init: function (fieldKey) {
                $assertion.isFieldKey(fieldKey, "Invalid field key");

                base.init.call(this, fieldKey);

                /**
                 * Field key associated with current entity.
                 * @name $entity.Field#entityKey
                 * @type {$entity.FieldKey}
                 */
            },

            /**
             * Fetches fields entity from the document the current field belongs to.
             * @returns {$entity.Entity}
             */
            getParentEntity: function () {
                return this.entityKey.documentKey.toDocument()
                    .getFieldsEntity();
            },

            /**
             * Fetches entity associated with the field's value.
             * Returns self by default.
             * @returns {$entity.Entity}
             */
            getValueEntity: function () {
                return this;
            },

            /**
             * Fetches field value node from cache.
             * Identical to the node by default.
             * @returns {*}
             */
            getValue: function () {
                return this.getValueEntity().getNode();
            },

            /**
             * Fetches field value node from cache without triggering access events.
             * @returns {*}
             */
            getSilentValue: function () {
                return this.getValueEntity().getSilentNode();
            },

            /**
             * Sets field value node to the specified value.
             * @param {*} value
             * @returns {$entity.Field}
             */
            setValue: function (value) {
                this.getValueEntity().setNode(value);
                return this;
            },

            /**
             * Returns the stringified value of the field.
             * @returns {string}
             */
            toString: function () {
                return $utils.Stringifier.stringify(this.getValue());
            }
        });
});

$oop.amendPostponed($entity, 'Entity', function () {
    "use strict";

    $entity.Entity
        .addSurrogate($entity, 'Field', function (entityKey) {
            return entityKey.instanceOf($entity.FieldKey);
        });
});

$oop.amendPostponed($entity, 'FieldKey', function () {
    "use strict";

    $entity.FieldKey
        .addMethods(/** @lends $entity.FieldKey */{
            /**
             * Converts `FieldKey` to `Field`.
             * @returns {$entity.Field}
             */
            toField: function () {
                return $entity.Field.create(this);
            }
        });
});

(function () {
    "use strict";

    $oop.extendBuiltIn(String.prototype, /** @lends String# */{
        /**
         * Converts `String` to `Field` instance, assuming the string is a serialized `FieldKey`.
         * @returns {$entity.Field}
         */
        toField: function () {
            return $entity.Field.create(this.toFieldKey());
        }
    });

    $oop.extendBuiltIn(Array.prototype, /** @lends Array# */{
        /**
         * Converts `Array` to `Field` instance, assuming the array is a field key in array notation.
         * @returns {$entity.Field}
         */
        toField: function () {
            return $entity.Field.create(this.toFieldKey());
        }
    });
}());

$oop.postpone($entity, 'CollectionField', function () {
    "use strict";

    var base = $entity.Field,
        self = base.extend();

    /**
     * Creates a CollectionField instance.
     * CollectionField instances may be created via `$entity.Field.create` provided that the `config` cache defines
     * the field type as 'collection'.
     * @name $entity.CollectionField.create
     * @function
     * @param {$entity.FieldKey} fieldKey Identifies collection field.
     * @returns {$entity.CollectionField}
     */

    /**
     * The CollectionField class implements an API for composite document fields, granting access to items.
     * @class
     * @extends $entity.Field
     */
    $entity.CollectionField = self
        .addMethods(/** @lends $entity.CollectionField# */{
            /**
             * Fetches node from cache containing the collection items.
             * @returns {object}
             */
            getItems: function () {
                return this.getValue();
            },

            /**
             * Fetches items node wrapped in a `Collection` instance.
             * @returns {$data.Collection}
             */
            getItemsAsCollection: function () {
                return $data.Collection.create(this.getValue());
            },

            /**
             * Retrieves `Item` entity matching the specified item ID.
             * @param {string} itemId
             * @returns {$entity.Item}
             */
            getItem: function (itemId) {
                return this.entityKey.getItemKey(itemId).toItem();
            },

            /**
             * Retrieves an item key for the item matching the specified value.
             * @param {*} value
             * @returns {$entity.ItemKey}
             */
            getItemKeyByValue: function (value) {
                var item = this.getItemByValue(value);
                return item && item.entityKey;
            },

            /**
             * Retrieves an Item instance for the item matching the specified value.
             * Iterates over all items. Avoid using it for large collections.
             * @param {*} value
             * @returns {$entity.Item}
             */
            getItemByValue: function (value) {
                var result,
                    itemsNode = this.getItems(),
                    itemIds,
                    i, item;

                if (itemsNode) {
                    itemIds = Object.keys(itemsNode);
                    for (i = 0; i < itemIds.length; i++) {
                        item = this.getItem(itemIds[i]);
                        if (item.getValue() === value) {
                            result = item;
                            break;
                        }
                    }
                }

                return result;
            },

            /**
             * Appends the specified item nodes to the current collection.
             * @param {object} itemsNode
             * @returns {$entity.CollectionField}
             */
            appendItems: function (itemsNode) {
                this.getValueEntity().appendNode(itemsNode);
                return this;
            }
        });
});

$oop.amendPostponed($entity, 'Field', function () {
    "use strict";

    $entity.Field
        .addSurrogate($entity, 'CollectionField', function (/**$entity.FieldKey*/fieldKey) {
            return fieldKey.getFieldType() === 'collection';
        });
});

$oop.postpone($entity, 'OrderedCollectionField', function () {
    "use strict";

    var base = $entity.CollectionField,
        self = base.extend();

    /**
     * Creates an OrderedCollectionField instance.
     * OrderedCollectionField instances may be created via `$entity.Field.create` provided that the `config`
     * cache defines the field type as 'ordered-collection'.
     * @name $entity.OrderedCollectionField.create
     * @function
     * @param {string} fieldKey Identifies ordered collection field.
     * @returns {$entity.OrderedCollectionField}
     */

    /**
     * The OrderedCollectionField class defines an API for collections the items of which are in a pre-defined order.
     * Provides methods for accessing information about item order, as well as retrieving items based on order.
     * @class
     * @extends $entity.CollectionField
     */
    $entity.OrderedCollectionField = self
        .addMethods(/** @lends $entity.OrderedCollectionField# */{
            /**
             * Fetches item order for specified item ID.
             * TODO: Add more tests.
             * @param {string} itemId
             * @returns {number}
             */
            getItemOrder: function (itemId) {
                var itemKey = this.entityKey.getItemKey(itemId),
                    item = itemKey.toItem();

                return item.getAttribute('order').getNode() ||
                       item.getValue();
            },

            /**
             * Retrieves `ItemKey` from collection matching the specified order.
             * @param {number} order
             * @returns {$entity.ItemKey}
             */
            getItemKeyByOrder: function (order) {
                var item = this.getItemByOrder(order);
                return item && item.entityKey;
            },

            /**
             * Retrieves `Item` entity from collection matching the specified order.
             * Iterates ove all items. Avoid using it for large collections.
             * TODO: Implement indexed version.
             * @param {number} order
             * @returns {$entity.Item}
             */
            getItemByOrder: function (order) {
                var result,
                    itemsNode = this.getItems(),
                    itemIds,
                    i, itemId;

                if (itemsNode) {
                    itemIds = Object.keys(itemsNode);
                    for (i = 0; i < itemIds.length; i++) {
                        itemId = itemIds[i];
                        if (this.getItemOrder(itemId) === order) {
                            result = this.getItem(itemId);
                            break;
                        }
                    }
                }

                return result;
            },

            /**
             * Retrieves highest item order from collection.
             * @returns {number}
             */
            getMaxOrder: function () {
                var result = Number.MIN_VALUE,
                    itemsNode = this.getItems(),
                    itemIds,
                    i, itemId, itemOrder;

                if (itemsNode) {
                    itemIds = Object.keys(itemsNode);
                    for (i = 0; i < itemIds.length; i++) {
                        itemId = itemIds[i];
                        itemOrder = this.getItemOrder(itemId);
                        if (itemOrder > result) {
                            result = itemOrder;
                        }
                    }
                }

                return result;
            }
        });
});

$oop.amendPostponed($entity, 'Field', function () {
    "use strict";

    $entity.Field
        .addSurrogate($entity, 'OrderedCollectionField', function (/**$entity.FieldKey*/fieldKey) {
            return fieldKey.getFieldType() === 'ordered-collection';
        });
});

$oop.postpone($entity, 'Item', function () {
    "use strict";

    var base = $entity.Field,
        self = base.extend(),
        shallowCopy = $data.DataUtils.shallowCopy;

    /**
     * Creates an Item instance.
     * @name $entity.Item.create
     * @function
     * @param {$entity.ItemKey} itemKey
     * @returns {$entity.Item}
     */

    /**
     * The Item class implements an API for collection item nodes in the cache.
     * @class
     * @extends $entity.Field
     */
    $entity.Item = self
        .addMethods(/** @lends $entity.Item# */{
            /**
             * @param {$entity.ItemKey} itemKey
             * @ignore
             */
            init: function (itemKey) {
                $assertion.isItemKey(itemKey, "Invalid item key");

                base.init.call(this, itemKey);

                /**
                 * Item key associated with current entity.
                 * @name $entity.Item#entityKey
                 * @type {$entity.ItemKey}
                 */
            },

            /**
             * Fetches attribute entity that holds the items the current item belongs to.
             * @returns {$entity.Entity}
             */
            getParentEntity: function () {
                return this.entityKey.getFieldKey().toField()
                    .getValueEntity();
            },

            /**
             * Sets item in collection. When the item is already present, it just replaces the item node.
             * When it's not present yet, the item gets appended to the rest, triggering appropriate events.
             * TODO: Restore individual value setter when item path already exists.
             * @param {*} node Item node to be set in the collection.
             * @returns {$entity.Item}
             */
            setNode: function (node) {
                var that = this,
                    parentEntity = this.getParentEntity(),
                    parentKey = parentEntity.entityKey,
                    parentNodeBefore = shallowCopy(parentEntity.getSilentNode()),
                    nodeToAppend = {},
                    itemId = this.entityKey.itemId;

                nodeToAppend[itemId] = node;

                $entity.entities.appendNode(parentKey.getEntityPath(), nodeToAppend, function () {
                    var parentNodeAfter = parentEntity.getNode();

                    parentKey.spawnEvent($entity.EVENT_ENTITY_CHANGE)
                        .setBeforeNode(parentNodeBefore)
                        .setAfterNode(parentNodeAfter)
                        .setAffectedKey(that.entityKey)
                        .triggerSync();
                });

                return this;
            }
        });
});

$oop.amendPostponed($entity, 'Entity', function () {
    "use strict";

    $entity.Entity
        .addSurrogate($entity, 'Item', function (entityKey) {
            return entityKey.isA($entity.ItemKey);
        });
});

$oop.amendPostponed($entity, 'ItemKey', function () {
    "use strict";

    $entity.ItemKey
        .addMethods(/** @lends $entity.ItemKey */{
            /**
             * Creates Item instance based on the current item key.
             * @returns {$entity.Item}
             */
            toItem: function () {
                return $entity.Item.create(this);
            }
        });
});

(function () {
    "use strict";

    $oop.extendBuiltIn(String.prototype, /** @lends String# */{
        /**
         * Converts `String` to `Item` instance, assuming the string is a serialized `ItemKey`.
         * @returns {$entity.Item}
         */
        toItem: function () {
            return $entity.Item.create(this.toItemKey());
        }
    });

    $oop.extendBuiltIn(Array.prototype, /** @lends Array# */{
        /**
         * Converts `Array` to `Item` instance, assuming the array is an item key in array notation.
         * @returns {$entity.Item}
         */
        toItem: function () {
            return $entity.Item.create(this.toItemKey());
        }
    });
}());

$oop.postpone($entity, 'HandlerSpawner', function () {
    "use strict";

    var base = $oop.Base,
        self = base.extend();

    /**
     * @name $entity.HandlerSpawner.create
     * @function
     * @param {string} [bindingType]
     * @returns {$entity.HandlerSpawner}
     */

    /**
     * @class
     * @extends $oop.Base
     */
    $entity.HandlerSpawner = self
        .addMethods(/** @lends $entity.HandlerSpawner# */{
            /**
             * @param {string} [bindingType]
             * @ignore
             */
            init: function (bindingType) {
                /** @type {string} */
                this.bindingType = bindingType;
            }
        });

    /**
     * @name $entity.HandlerSpawner#spawnHandler
     * @function
     * @param {$entity.EntityBound} instance
     * @param {string} methodName
     * @returns {Function}
     */
});

$oop.postpone($entity, 'ContentHandlerSpawner', function () {
    "use strict";

    var base = $entity.HandlerSpawner,
        self = base.extend();

    /**
     * @name $entity.ContentHandlerSpawner.create
     * @function
     * @returns {$entity.ContentHandlerSpawner}
     */

    /**
     * @class
     * @extends $entity.HandlerSpawner
     */
    $entity.ContentHandlerSpawner = self
        .addMethods(/** @lends $entity.ContentHandlerSpawner# */{
            /**
             * @param {$entity.EntityBound} instance
             * @param {string} methodName
             * @returns {Function}
             */
            spawnHandler: function (instance, methodName) {
                return instance[methodName].bind(instance);
            }
        });
});

$oop.amendPostponed($entity, 'HandlerSpawner', function () {
    "use strict";

    $entity.HandlerSpawner
        .addSurrogate($entity, 'ContentHandlerSpawner', function (bindingType) {
            return bindingType === 'content';
        });
});

$oop.postpone($entity, 'StrictHandlerSpawner', function () {
    "use strict";

    var base = $entity.HandlerSpawner,
        self = base.extend();

    /**
     * @name $entity.StrictHandlerSpawner.create
     * @function
     * @returns {$entity.StrictHandlerSpawner}
     */

    /**
     * @class
     * @extends $entity.HandlerSpawner
     */
    $entity.StrictHandlerSpawner = self
        .addMethods(/** @lends $entity.StrictHandlerSpawner# */{
            /**
             * @param {$entity.EntityBound} instance
             * @param {string} methodName
             * @param {$entity.FieldKey} entityKey
             * @returns {Function}
             */
            spawnHandler: function (instance, methodName, entityKey) {
                return function (event) {
                    if (event.sender.equals(entityKey)) {
                        instance[methodName](event);
                    }
                };
            }
        });
});

$oop.amendPostponed($entity, 'HandlerSpawner', function () {
    "use strict";

    $entity.HandlerSpawner
        .addSurrogate($entity, 'StrictHandlerSpawner', function (bindingType) {
            return bindingType === 'strict';
        });
});
$oop.postpone($entity, 'DelegateHandlerSpawner', function () {
    "use strict";

    var base = $entity.HandlerSpawner,
        self = base.extend();

    /**
     * @name $entity.DelegateHandlerSpawner.create
     * @function
     * @returns {$entity.DelegateHandlerSpawner}
     */

    /**
     * @class
     * @extends $entity.HandlerSpawner
     */
    $entity.DelegateHandlerSpawner = self
        .addMethods(/** @lends $entity.DelegateHandlerSpawner# */{
            /**
             * @param {$entity.EntityBound} instance
             * @param {string} methodName
             * @param {$entity.EntityKey} entityKey
             * @returns {Function}
             */
            spawnHandler: function (instance, methodName, entityKey) {
                return function (event) {
                    var entityPath = entityKey.getEntityPath(),
                        affectedKey = event.sender,
                        affectedPath = affectedKey.getEntityPath(),
                        beforeNode,
                        afterNode;

                    if (affectedKey.equals(entityKey)) {
                        // observed entity changed
                        // same as if we were subscribing on the event itself
                        event.setAffectedKey(entityKey);
                        instance[methodName](event);
                    } else if (entityPath.isRelativeTo(affectedPath)) {
                        // entity on the parent chain changed

                        beforeNode = $data.Tree.create()
                            .setNode(affectedPath, event.beforeNode)
                            .getNode(entityPath);
                        afterNode = $entity.entities.getNode(entityPath);

                        if (beforeNode !== afterNode) {
                            // entity has changed

                            // creating event that carries correct information
                            event = event.clone()
                                .setAffectedKey(entityKey)
                                .setBeforeNode(beforeNode)
                                .setAfterNode(afterNode);

                            instance[methodName](event);
                        }
                    }
                };
            }
        });
});

$oop.amendPostponed($entity, 'HandlerSpawner', function () {
    "use strict";

    $entity.HandlerSpawner
        .addSurrogate($entity, 'DelegateHandlerSpawner', function (bindingType) {
            return bindingType === 'delegate';
        });
});
$oop.postpone($entity, 'EntityBound', function () {
    "use strict";

    /**
     * The EntityBound trait binds instances of the host class to entity events.
     * @class
     * @extends $oop.Base
     */
    $entity.EntityBound = $oop.Base.extend()
        .addPrivateMethods(/** @lends $entity.EntityBound# */{
            /**
             * @param {$entity.EntityKey} targetKey
             * @param {$entity.EntityKey} captureKey
             * @param {string} eventName
             * @param {string} methodName
             * @param {string} bindingType
             * @private
             */
            _bindToEntity: function (targetKey, captureKey, eventName, methodName, bindingType) {
                var entityBindings = this.entityBindings,
                    bindingPath = [targetKey.toString(), eventName, methodName, bindingType].toPath(),
                    bindingInfo = entityBindings.getNode(bindingPath),
                    handler;

                if (!bindingInfo) {
                    handler = $entity.HandlerSpawner.create(bindingType)
                        .spawnHandler(this, methodName, targetKey);
                    captureKey.subscribeTo(eventName, handler);
                    entityBindings.setNode(bindingPath, {
                        targetKey  : targetKey,
                        captureKey : captureKey,
                        eventName  : eventName,
                        methodName : methodName,
                        bindingType: bindingType,
                        handler    : handler
                    });
                }
            },

            /**
             * @param {$entity.EntityKey} targetKey
             * @param {$entity.EntityKey} captureKey
             * @param {string} eventName
             * @param {string} methodName
             * @param {string} bindingType
             * @private
             */
            _unbindFromEntity: function (targetKey, captureKey, eventName, methodName, bindingType) {
                var entityBindings = this.entityBindings,
                    bindingPath = [targetKey.toString(), eventName, methodName, bindingType].toPath(),
                    bindingInfo = entityBindings.getNode(bindingPath),
                    handler;

                if (bindingInfo) {
                    handler = bindingInfo.handler;
                    captureKey.unsubscribeFrom(eventName, handler);
                    entityBindings.unsetPath(bindingPath);
                }
            }
        })
        .addMethods(/** @lends $entity.EntityBound# */{
            /** Call from host class .init(). */
            init: function () {
                /** @type {$data.Tree} */
                this.entityBindings = $data.Tree.create();
            },

            /**
             * Subscribes method to be triggered on the specified custom event passing through the entity.
             * @param {$entity.EntityKey} entityKey
             * @param {string} eventName
             * @param {string} methodName
             * @returns {$entity.EntityBound}
             */
            bindToEntityContent: function (entityKey, eventName, methodName) {
                $assertion
                    .isEntityKey(entityKey, "Invalid entity key")
                    .isString(eventName, "Invalid event name")
                    .isFunction(this[methodName], "Attempting to bind non-method");

                this._bindToEntity(entityKey, entityKey, eventName, methodName, 'content');

                return this;
            },

            /**
             * Unsubscribes method from the specified custom event passing through the entity.
             * @param {$entity.EntityKey} entityKey
             * @param {string} eventName
             * @param {string} methodName
             * @returns {$entity.EntityBound}
             */
            unbindFromEntityContent: function (entityKey, eventName, methodName) {
                $assertion
                    .isEntityKey(entityKey, "Invalid entity key")
                    .isString(eventName, "Invalid event name")
                    .isFunction(this[methodName], "Attempting to unbind non-method");

                this._unbindFromEntity(entityKey, entityKey, eventName, methodName, 'content');

                return this;
            },

            /**
             * Subscribes method to be triggered on the specified custom event is triggered on the specified entity.
             * @param {$entity.EntityKey} entityKey
             * @param {string} eventName
             * @param {string} methodName
             * @returns {$entity.EntityBound}
             */
            bindToEntity: function (entityKey, eventName, methodName) {
                $assertion
                    .isEntityKey(entityKey, "Invalid entity key")
                    .isString(eventName, "Invalid event name")
                    .isFunction(this[methodName], "Attempting to bind non-method");

                this._bindToEntity(entityKey, entityKey, eventName, methodName, 'strict');

                return this;
            },

            /**
             * Unsubscribes method from the specified custom event triggered on the specified entity.
             * @param {$entity.EntityKey} entityKey
             * @param {string} eventName
             * @param {string} methodName
             * @returns {$entity.EntityBound}
             */
            unbindFromEntity: function (entityKey, eventName, methodName) {
                $assertion
                    .isEntityKey(entityKey, "Invalid entity key")
                    .isString(eventName, "Invalid event name")
                    .isFunction(this[methodName], "Attempting to unbind non-method");

                this._unbindFromEntity(entityKey, entityKey, eventName, methodName, 'strict');

                return this;
            },

            /**
             * Subscribes method to be triggered on any access event passing through the entity.
             * @param {$entity.EntityKey} entityKey
             * @param {string} methodName
             * @returns {$entity.EntityBound}
             */
            bindToEntityContentAccess: function (entityKey, methodName) {
                $assertion
                    .isEntityKey(entityKey, "Invalid entity key")
                    .isFunction(this[methodName], "Attempting to bind non-method");

                this._bindToEntity(
                    entityKey,
                    entityKey,
                    $entity.EVENT_ENTITY_ACCESS,
                    methodName,
                    'content');

                return this;
            },

            /**
             * Unsubscribes method from access events passing through the entity.
             * @param {$entity.EntityKey} entityKey
             * @param {string} methodName
             * @returns {$entity.EntityBound}
             */
            unbindFromEntityContentAccess: function (entityKey, methodName) {
                $assertion
                    .isEntityKey(entityKey, "Invalid entity key")
                    .isFunction(this[methodName], "Attempting to unbind non-method");

                this._unbindFromEntity(
                    entityKey,
                    entityKey,
                    $entity.EVENT_ENTITY_ACCESS,
                    methodName,
                    'content');

                return this;
            },

            /**
             * Subscribes method to be triggered when the specified entity is accessed.
             * @param {$entity.EntityKey} entityKey
             * @param {string} methodName
             * @returns {$entity.EntityBound}
             */
            bindToEntityAccess: function (entityKey, methodName) {
                $assertion
                    .isEntityKey(entityKey, "Invalid entity key")
                    .isFunction(this[methodName], "Attempting to bind non-method");

                this._bindToEntity(
                    entityKey,
                    entityKey,
                    $entity.EVENT_ENTITY_ACCESS,
                    methodName,
                    'strict');

                return this;
            },

            /**
             * Unsubscribes method from access events triggered on the specified entity.
             * @param {$entity.EntityKey} entityKey
             * @param {string} methodName
             * @returns {$entity.EntityBound}
             */
            unbindFromEntityAccess: function (entityKey, methodName) {
                $assertion
                    .isEntityKey(entityKey, "Invalid entity key")
                    .isFunction(this[methodName], "Attempting to unbind non-method");

                this._unbindFromEntity(
                    entityKey,
                    entityKey,
                    $entity.EVENT_ENTITY_ACCESS,
                    methodName,
                    'strict');

                return this;
            },

            /**
             * Subscribes method to be triggered on any change event passing through the entity.
             * @param {$entity.EntityKey} entityKey
             * @param {string} methodName
             * @returns {$entity.EntityBound}
             */
            bindToEntityContentChange: function (entityKey, methodName) {
                $assertion
                    .isEntityKey(entityKey, "Invalid entity key")
                    .isFunction(this[methodName], "Attempting to bind non-method");

                this._bindToEntity(
                    entityKey,
                    entityKey,
                    $entity.EVENT_ENTITY_CHANGE,
                    methodName,
                    'content');

                return this;
            },

            /**
             * Unsubscribes method from change events passing through the entity.
             * @param {$entity.EntityKey} entityKey
             * @param {string} methodName
             * @returns {$entity.EntityBound}
             */
            unbindFromEntityContentChange: function (entityKey, methodName) {
                $assertion
                    .isEntityKey(entityKey, "Invalid entity key")
                    .isFunction(this[methodName], "Attempting to unbind non-method");

                this._unbindFromEntity(
                    entityKey,
                    entityKey,
                    $entity.EVENT_ENTITY_CHANGE,
                    methodName,
                    'content');

                return this;
            },

            /**
             * Subscribes method to be triggered only when specified entity is replaced.
             * @param {$entity.EntityKey} entityKey
             * @param {string} methodName
             * @returns {$entity.EntityBound}
             */
            bindToEntityChange: function (entityKey, methodName) {
                $assertion
                    .isEntityKey(entityKey, "Invalid entity key")
                    .isFunction(this[methodName], "Attempting to bind non-method");

                this._bindToEntity(
                    entityKey,
                    entityKey,
                    $entity.EVENT_ENTITY_CHANGE,
                    methodName,
                    'strict');

                return this;
            },

            /**
             * Unsubscribes method from change events triggered on the specified entity.
             * @param {$entity.EntityKey} entityKey
             * @param {string} methodName
             * @returns {$entity.EntityBound}
             */
            unbindFromEntityChange: function (entityKey, methodName) {
                $assertion
                    .isEntityKey(entityKey, "Invalid entity key")
                    .isFunction(this[methodName], "Attempting to unbind non-method");

                this._unbindFromEntity(
                    entityKey,
                    entityKey,
                    $entity.EVENT_ENTITY_CHANGE,
                    methodName,
                    'strict');

                return this;
            },

            /**
             * Subscribes method to be triggered when the specified entity or any of its parents change.
             * Adds `affectedKey` payload / property to event.
             * @param {$entity.EntityKey} entityKey
             * @param {string} methodName
             * @returns {$entity.EntityBound}
             */
            bindToDelegatedEntityChange: function (entityKey, methodName) {
                $assertion
                    .isEntityKey(entityKey, "Invalid entity key")
                    .isFunction(this[methodName], "Attempting to bind non-method");

                this._bindToEntity(
                    entityKey,
                    entityKey.documentKey,
                    $entity.EVENT_ENTITY_CHANGE,
                    methodName,
                    'delegate');

                return this;
            },

            /**
             * Unsubscribes method from delegated changes.
             * @param {$entity.EntityKey} entityKey
             * @param {string} methodName
             * @returns {$entity.EntityBound}
             */
            unbindFromDelegatedEntityChange: function (entityKey, methodName) {
                $assertion
                    .isEntityKey(entityKey, "Invalid entity key")
                    .isFunction(this[methodName], "Attempting to unbind non-method");

                this._unbindFromEntity(
                    entityKey,
                    entityKey.documentKey,
                    $entity.EVENT_ENTITY_CHANGE,
                    methodName,
                    'delegate');

                return this;
            },

            /**
             * Removes and unsubscribes all bindings associated with the current instance.
             * @returns {$entity.EntityBound}
             */
            unbindAll: function () {
                var that = this;

                // querying all binding parameters
                this.entityBindings
                    .queryValuesAsHash('|>|>|>|'.toQuery())
                    .toCollection()
                    .forEachItem(function (bindingInfo) {
                        that._unbindFromEntity(
                            bindingInfo.targetKey,
                            bindingInfo.captureKey,
                            bindingInfo.eventName,
                            bindingInfo.methodName,
                            bindingInfo.bindingType);
                    });

                return this;
            }
        });
});

/*jshint node:true */
if (typeof module === 'object') {
    module.exports = $entity;
}

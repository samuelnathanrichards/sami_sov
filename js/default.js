var app = {};
app.data = app.data || {};
app.widgets = app.widgets || {};

$(document).ready(function (){
    app.widgets.SOVPage.create()
        .setRootWidget();
});

$oop.postpone(app.data, 'Spectrum', function (data, className) {
    "use strict";

    var base = $oop.Base,
        self = base.extend(className);

    /**
     * @name app.Spectrum
     * @function
     * @returns {app.Spectrum}
     */

    /**
     * @class
     * @extends $oop.Base
     */
    app.data.Spectrum = self
        .addMethods(/** @lends app.Spectrum */{
            RdBl: function (val) {
                $assertion.isUnsigned8Bit(val);

                return {r: Math.round(val), g: 0, b: 0};
            },

            BuBl: function (val) {
                $assertion.isUnsigned8Bit(val);

                return {r: 0, g: 0, b: Math.round(val)};
            },

            RdYlBu: function (val) {
                $assertion.isUnsigned8Bit(val);

                var color = {r: 0, g: 0, b: 0};

                if (val < 255 / 2) {
                    color.r = Math.round(255 - (val * 2));
                }

                color.g = Math.round(255 - Math.abs((val * 2) - 255));
                color.r = color.r + Math.round(255 - Math.abs((val * 2) - 255));

                if (val > 255 / 2) {
                    color.b = Math.round((val * 2) - 255);
                }

                return color;
            }
        });
});

$oop.postpone(app.data, 'Maths', function (data, className) {
    "use strict";

    var base = $oop.Base,
        self = base.extend(className);

    /**
     * @name app.Maths
     * @function
     * @returns {app.Maths}
     */

    /**
     * @class
     * @extends $oop.Base
     */
    app.data.Maths = self
        .addMethods(/** @lends app.Maths */{
            /**
             * Returns the value at a given percentile in a sorted numeric array.
             * // "Linear interpolation between closest ranks" method
             */
            percentile: function (arr, p) {
                if (arr.length === 0) return 0;
                if (typeof p !== 'number') throw new TypeError('p must be a number');
                if (p <= 0) return arr[0];
                if (p >= 1) return arr[arr.length - 1];

                var index = arr.length * p,
                    lower = Math.floor(index),
                    upper = lower + 1,
                    weight = index % 1;

                if (upper >= arr.length) return arr[lower];
                return arr[lower] * (1 - weight) + arr[upper] * weight;
            }
        });
});

$oop.postpone(app.widgets, 'SOVPage', function (widgets, className) {
    "use strict";

    var base = $widget.Widget,
        self = base.extend(className);

    /**
     * @name app.SOVPage
     * @function
     * @returns {app.widgets.SOVPage}
     */

    /**
     * @class
     * @extends $widget.Widget
     */
    app.widgets.SOVPage = self
        .addMethods(/** @lends app.Galaxy */{
            init: function (data) {
                base.init.call(this);
                var that = this;

                $commonWidgets.Label.create()
                    .setLabelText('Loading...')
                    .setChildName('strong')
                    .setChildName('A-loading')
                    .addToParent(this);

                $.ajax(
                    'data/all_galaxies.json',
                    {
                        success: function (data) {
                            app.widgets.GalaxyList.create(data)
                                .setChildName('B-galaxyList')
                                .addToParent(that);

                            that.hideLoader();
                        },
                        error: function (data) {
                            console.log(arguments);
                        }
                    }
                );

                this.elevateMethods('onClick');
                this.subscribeTo($commonWidgets.EVENT_BUTTON_CLICK, this.onClick)
            },

            hideLoader: function () {
                $(this.getChild('A-loading').getElement()).hide();
            },

            showLoader: function () {
                $(this.getChild('A-loading').getElement()).show();
            },

            onClick: function (e) {
                var that = this;
                var galaxyId = e.payload.galaxyId;

                this.showLoader();

                if (this.getChild('C-galaxy')) {
                    this.getChild('C-galaxy').removeFromParent();
                }

                $.ajax(
                    'data/' + galaxyId + '.json',
                    {
                        success: function (data) {
                            app.widgets.Galaxy.create(data)
                                .setChildName('C-galaxy')
                                .addToParent(that);

                            that.hideLoader();
                        },
                        error: function (data) {
                            console.log(arguments);
                        }
                    }
                );
            }
        });
});

$oop.postpone(app.widgets, 'Galaxy', function (widgets, className) {
    "use strict";

    var base = $widget.Widget,
        self = base.extend(className);

    /**
     * @name app.Galaxy
     * @function
     * @returns {app.Galaxy}
     */

    /**
     * @class
     * @extends $oop.Base
     */
    app.widgets.Galaxy = self
        .addPublic(/** @lends app.widgets.ContactPage */{
            /**
             * @type {$widget.MarkupTemplate}
             */
            contentTemplate: [
                //@formatter:off
                '<section class="header"></section>',
                '<section class="spec-container"></section>',
                '<section class="img-container"></section>',
                '<section class="detail-container"></section>'
                //@formatter:on
            ].join('').toMarkupTemplate()
        })
        .addMethods(/** @lends app.Galaxy */{
            init: function (data) {
                base.init.call(this);

                this.data = this.addDenormalisedData(data);

                widgets.Header.create(this.data.id)
                    .setChildName('header')
                    .setContainerCssClass('header')
                    .addToParent(this);

                var TspecMax = Math.max(this.data.Tspec_scalar_B, this.data.Tspec_scalar_R);

                [
                    widgets.BSpecGraph.create(
                        this.data.Tspec_B,
                        this.data.Bwave,
                        TspecMax,
                        this.data.Tspec_scalar_B
                    )
                        .setChildName('A-BSpecGraph'),
                    widgets.RSpecGraph.create(
                        this.data.Tspec_R,
                        this.data.Rwave,
                        TspecMax,
                        this.data.Tspec_scalar_R
                    )
                        .setChildName('R-BSpecGraph')
                ]
                    .toWidgetCollection()
                    .setContainerCssClass('spec-container')
                    .addToParent(this);

                [
                    // widgets.RGBImage.create(this.data)
                    //     .setChildName('A-RGB'),

                    widgets.SFRImage.create(this.data)
                        .setChildName('B-SFR'),
                    //
                    // widgets.VelImage.create(this.data)
                    //     .setChildName('C-Vel'),
                    //
                    // widgets.VelDisImage.create(this.data)
                    //     .setChildName('D-VelDis'),
                    //
                    // widgets.BPTClassImage.create(this.data)
                    //     .setChildName('E-BPTClass'),
                    //
                    // widgets.nIIHαImage.create(this.data)
                    //     .setChildName('F-nIIHα'),
                    //
                    // widgets.oIIIHβImage.create(this.data)
                    //     .setChildName('G-oIIIHβ'),
                    //
                    // widgets.BPTScatterGraph.create(this.data)
                    //     .setChildName('H-BPTScatter')
                ]
                    .toWidgetCollection()
                    .setContainerCssClass('img-container')
                    .addToParent(this);

                widgets.Detail.create()
                    .setChildName('detail')
                    .setContainerCssClass('detail-container')
                    .addToParent(this);

                this.elevateMethods('onImageHover');
                this.subscribeTo(widgets.Image.EVENT_PIXEL_HOVER, this.onImageHover);

            },

            addDenormalisedData: function (data) {
                var map = [],
                    point,
                    sfr = [],
                    vel = [],
                    vel_dis = [],
                    nii_ha = [],
                    oiii_hb = [],
                    bpt_class = [];

                data.bpt_points = [];
                data.indexed_spaxel_data = [];

                // x = nii_ha
                // y = oiii

                for (var i = 0; i < data.spaxel_data.length; ++i) {
                    point = data.spaxel_data[i];
                    data.indexed_spaxel_data[point.x] = data.indexed_spaxel_data[point.x] || [];
                    data.indexed_spaxel_data[point.x][point.y] = point;


                    if (point.SspecMax) {
                        point.SspecMax = Math.max.apply(Math, point.Sspec_B.concat(point.Sspec_R));
                    }

                    if (point.sfr) {
                        sfr.push(point.sfr);
                    }

                    if (point.vel) {
                        vel.push(point.vel);
                    }

                    if (point.vel_dis) {
                        vel_dis.push(point.vel_dis);
                    }

                    if (point.nii_ha) {
                        nii_ha.push(point.nii_ha);
                    }

                    if (point.oiii_hb) {
                        oiii_hb.push(point.oiii_hb);
                    }

                    if (point.nii_ha && point.oiii_hb) {
                        point.bpt_class = point.oiii_hb / point.nii_ha;
                        bpt_class.push(point.bpt_class);
                        data.bpt_points.push({
                            x: point.x,
                            y: point.y,
                            oiii_hb: point.oiii_hb,
                            nii_ha: point.nii_ha
                        })
                    }
                }

                vel.sort(function (a, b) {
                    return a - b
                });
                sfr.sort(function (a, b) {
                    return a - b
                });
                vel_dis.sort(function (a, b) {
                    return a - b
                });
                nii_ha.sort(function (a, b) {
                    return a - b
                });
                oiii_hb.sort(function (a, b) {
                    return a - b
                });
                bpt_class.sort(function (a, b) {
                    return a - b
                });

                data.limits = {
                    sfr: {
                        max: app.data.Maths.percentile(sfr, 0.95),
                        min: app.data.Maths.percentile(sfr, 0.05)
                    },
                    vel: {
                        max: app.data.Maths.percentile(vel, 0.95),
                        min: app.data.Maths.percentile(vel, 0.05)
                    },
                    vel_dis: {
                        max: app.data.Maths.percentile(vel_dis, 0.95),
                        min: app.data.Maths.percentile(vel_dis, 0.05)
                    },
                    nii_ha: {
                        max: app.data.Maths.percentile(nii_ha, 0.95),
                        min: app.data.Maths.percentile(nii_ha, 0.05)
                    },
                    oiii_hb: {
                        max: app.data.Maths.percentile(oiii_hb, 0.95),
                        min: app.data.Maths.percentile(oiii_hb, 0.05)
                    },
                    bpt_class: {
                        max: app.data.Maths.percentile(bpt_class, 0.95),
                        min: app.data.Maths.percentile(bpt_class, 0.05)
                    }
                };

                return data;
            },

            onImageHover: function (e) {
                var x = e.payload.x,
                    y = e.payload.y,
                    indexed_spaxel_data = this.data.indexed_spaxel_data;

                if (indexed_spaxel_data[x] && indexed_spaxel_data[x][y]) {
                    this.getChild('detail').updateData(indexed_spaxel_data[x][y]);

                    var limit = Math.max(indexed_spaxel_data[x][y].spaxel_scalar_B, indexed_spaxel_data[x][y].spaxel_scalar_R);
                    [
                        widgets.BSpecGraph.create(
                            indexed_spaxel_data[x][y].Sspec_B,
                            this.data.Bwave,
                            limit,
                            indexed_spaxel_data[x][y].spaxel_scalar_B
                        )
                            .setChildName('A-BSpecGraph'),
                        widgets.RSpecGraph.create(
                            indexed_spaxel_data[x][y].Sspec_R,
                            this.data.Rwave,
                            limit,
                            indexed_spaxel_data[x][y].spaxel_scalar_R
                        )
                            .setChildName('R-BSpecGraph')
                    ]
                        .toWidgetCollection()
                        .setContainerCssClass('spec-container')
                        .addToParent(this);
                }

                this.getChild('A-RGB').setCursorPosition(x, y);
                this.getChild('B-SFR').setCursorPosition(x, y);
                this.getChild('C-Vel').setCursorPosition(x, y);
                this.getChild('D-VelDis').setCursorPosition(x, y);
                this.getChild('E-BPTClass').setCursorPosition(x, y);
                this.getChild('F-nIIHα').setCursorPosition(x, y);
                this.getChild('G-oIIIHβ').setCursorPosition(x, y);
            }
        });
});

$oop.postpone(app.widgets, 'GalaxyList', function (widgets, className) {
    "use strict";

    var base = $widget.Widget,
        self = base.extend(className);

    /**
     * @name app.GalaxyList
     * @function
     * @returns {app.GalaxyList}
     */

    /**
     * @class
     * @extends $oop.Base
     */
    app.widgets.GalaxyList = self
        .addMethods(/** @lends app.Galaxy */{
            init: function (data) {
                base.init.call(this);
                this.setTagName('ul');

                for (var index in data) {
                    if (data.hasOwnProperty(index)) {
                        widgets.GalaxyListItem.create(data[index])
                            .setChildName('item-' + data[index].id)
                            .addToParent(this);
                    }
                }
            }
        });
});

$oop.postpone(app.widgets, 'GalaxyListItem', function (widgets, className) {
    "use strict";

    var base = $commonWidgets.Button,
        self = base.extend(className);

    /**
     * @name app.widgets.GalaxyListItem
     * @function
     * @returns {app.widgets.GalaxyListItem}
     */

    /**
     * @class
     * @extends $commonWidgets.Button
     */
    app.widgets.GalaxyListItem = self
        .addMethods(/** @lends app.widgets.GalaxyListItem */{
            init: function (data) {
                base.init.call(this);

                this.data = data;

                this.setTagName('li');

                [
                    $commonWidgets.Label.create()
                        .setLabelText(data.id)
                        .setChildName('A-id'),

                    $commonWidgets.Label.create()
                        .setLabelText(data.DEC)
                        .setChildName('B-DEC'),

                    $commonWidgets.Label.create()
                        .setLabelText(data.Ms)
                        .setChildName('C-Ms'),

                    $commonWidgets.Label.create()
                        .setLabelText(data.RA)
                        .setChildName('D-RA'),

                    $commonWidgets.Label.create()
                        .setLabelText(data.Re)
                        .setChildName('E-Re'),

                    $commonWidgets.Label.create()
                        .setLabelText(data.Z)
                        .setChildName('F-Z'),

                    $commonWidgets.Label.create()
                        .setLabelText(data.psf)
                        .setChildName('G-psf')
                ]
                    .toWidgetCollection()
                    .addToParent(this);
            },

            onClick: function () {
                this.spawnEvent($commonWidgets.EVENT_BUTTON_CLICK)
                    .setPayloadItems({
                        galaxyId: this.data.id
                    })
                    .triggerSync();
            }
        });
});

$oop.postpone(app.widgets, 'Header', function (widgets, className) {
    "use strict";

    var base = $widget.Widget,
        self = base.extend(className);

    /**
     * @name app.Header
     * @function
     * @returns {app.Header}
     */

    /**
     * @class
     * @extends $widget.Widget
     */
    app.widgets.Header = self
        .addMethods(/** @lends app.widgets.Header# */{
            init: function (galaxyId) {
                base.init.call(this);

                $commonWidgets.Label.create()
                    .setLabelText('Galaxy: ' + galaxyId)
                    .setTagName('h2')
                    .setChildName('header')
                    .addToParent(this);

                $commonWidgets.TextButton.create()
                    .setCaption('Download the full data')
                    .setTagName('a')
                    .addAttribute('href', '/data/' + galaxyId + '.json')
                    .setChildName('link')
                    .addToParent(this)
            }
        });
});

$oop.postpone(app.widgets, 'Detail', function (widgets, className) {
    "use strict";

    var base = $widget.Widget,
        self = base.extend(className);

    /**
     * @name app.widgets.Detail
     * @function
     * @returns {app.widgets.Detail}
     */

    /**
     * @class
     * @extends $widget.Widget
     */
    app.widgets.Detail = self
        .addMethods(/** @lends app.widgets.Detail# */{
            updateData: function (data) {
                $(this.getElement()).html([
                    '<dl>',
                    '<dt>x:</dt>',
                    '<dd>' + data.x + '</dd>',

                    '<dt>y:</dt>',
                    '<dd>' + data.y + '</dd>',

                    '<dt>BPT:</dt>',
                    '<dd>' + data.BPT + '</dd>',

                    '<dt>Aperture Scalar:</dt>',
                    '<dd>' + data.aperture_scalar + '</dd>',

                    '<dt>nII Hα:</dt>',
                    '<dd>' + data.nii_ha + '</dd>',

                    '<dt>oIII Hβ:</dt>',
                    '<dd>' + data.oiii_hb + '</dd>',

                    '<dt>sfr:</dt>',
                    '<dd>' + data.sfr + '</dd>',

                    '<dt>Spaxel Scalar:</dt>',
                    '<dd>' + data.spaxel_scalar + '</dd>',

                    '<dt>Vel:</dt>',
                    '<dd>' + data.vel + '</dd>',

                    '<dt>Vel dis:</dt>',
                    '<dd>' + data.vel_dis + '</dd>',
                    '</dl>'
                ].join(''));
            }
        });
});

$oop.postpone(app.widgets, 'Point', function (widgets, className) {
    "use strict";

    var base = $oop.Base,
        self = base.extend(className);

    /**
     * @name app.Point
     * @function
     * @returns {app.Point}
     */

    /**
     * @class
     * @extends $oop.Base
     */
    app.widgets.Point = self
        .addMethods(/** @lends app.Image# */{
            init: function (x, y, dd) {
                this.x = x;
                this.y = y;

                this.value = dd.indexed_spaxel_data[x] && dd.indexed_spaxel_data[x][y] ? dd.indexed_spaxel_data[x][y][this.getField()] : null;
            },

            getColor: function () {
                return {r: 0, g: 0, b: 0};
            },

            getField: function () {
                // override
            },

            getValue: function () {
                // override
            }
        });
});

$oop.postpone(app.widgets, 'Cursor', function (widgets, className) {
    "use strict";

    var base = $widget.Widget,
        self = base.extend(className);

    /**
     * @name app.Cursor
     * @function
     * @returns {app.Cursor}
     */

    /**
     * @class
     * @extends $widget.Widget
     */
    app.widgets.Cursor = self
        .addMethods(/** @lends app.Cursor# */{
            setPosition: function (x, y) {
                $(this.getElement()).css({
                    left: (y * 2) + '%',
                    top: (x * 2) + '%'
                })
            }
        });
});

$oop.postpone(app.widgets, 'SpectrumIndicator', function (widgets, className) {
    "use strict";

    var base = $widget.Widget,
        self = base.extend(className);

    /**
     * @name app.SpectrumIndicator
     * @function
     * @returns {app.SpectrumIndicator}
     */

    /**
     * @class
     * @extends $widget.Widget
     */
    app.widgets.SpectrumIndicator = self
        .addMethods(/** @lends app.SpectrumIndicator# */{
            setPosition: function (y) {
                $(this.getElement()).css({
                    left: ((y/255*100) - 1.5) + '%'
                })
            }
        });
});

$oop.postpone(app.widgets, 'NormalizedPoint', function (widgets, className) {
    "use strict";

    var base = widgets.Point,
        self = base.extend(className);

    /**
     * @name app.NormalizedPoint
     * @function
     * @returns {app.NormalizedPoint}
     */

    /**
     * @class
     * @extends $oop.Base
     */
    app.widgets.NormalizedPoint = self
        .addMethods(/** @lends app.Image# */{
            init: function (x, y, dd) {
                base.init.call(this, x, y, dd);
                this.max = dd.limits[this.getField()].max;
                this.min = dd.limits[this.getField()].min;

                console.log(this.max, this.min);
            },

            normalize: function (value) {
                var max = Math.max(this.max, Math.abs(this.min));

                value = Math.min(this.max, value);
                value = Math.max(this.min, value);

                value = ((value + max) / (max * 2));

                var color =  value * 255;

                return color;
            },

            getValue: function () {
                return this.normalize(this.value);
            }
        });
});

$oop.postpone(app.widgets, 'VelPoint', function (widgets, className, data) {
    "use strict";

    var base = widgets.NormalizedPoint,
        self = base.extend(className);

    /**
     * @name app.VelPoint
     * @function
     * @returns {app.VelPoint}
     */

    /**
     * @class
     * @extends widgets.NormalizedPoint
     */
    app.widgets.VelPoint = self
        .addMethods(/** @lends app.VelPoint# */{
            getColor: function () {
                if (typeof this.value !== 'number') {
                    return base.getColor.call(this);
                }

                return data.Spectrum.RdYlBu(this.normalize(this.value));
            },

            getField: function () {
                return 'vel';
            }
        });
}, app.data);

$oop.postpone(app.widgets, 'VelDisPoint', function (widgets, className, data) {
    "use strict";

    var base = widgets.NormalizedPoint,
        self = base.extend(className);

    /**
     * @name app.VelDisPoint
     * @function
     * @returns {app.VelDisPoint}
     */

    /**
     * @class
     * @extends widgets.NormalizedPoint
     */
    app.widgets.VelDisPoint = self
        .addMethods(/** @lends app.VelDisPoint# */{
            getColor: function () {
                if (typeof this.value !== 'number') {
                    return base.getColor.call(this);
                }

                return data.Spectrum.RdBl(this.normalize(this.value));
            },

            getField: function () {
                return 'vel_dis';
            }
        });
}, app.data);

$oop.postpone(app.widgets, 'nIIHαPoint', function (widgets, className, data) {
    "use strict";

    var base = widgets.NormalizedPoint,
        self = base.extend(className);

    /**
     * @name app.nIIHαPoint
     * @function
     * @returns {app.nIIHαPoint}
     */

    /**
     * @class
     * @extends widgets.NormalizedPoint
     */
    app.widgets.nIIHαPoint = self
        .addMethods(/** @lends app.VelDisPoint# */{
            getColor: function () {
                if (typeof this.value !== 'number') {
                    return base.getColor.call(this);
                }

                return data.Spectrum.RdBl(this.normalize(this.value));
            },

            getField: function () {
                return 'nii_ha';
            }
        });
}, app.data);

$oop.postpone(app.widgets, 'oIIIHβPoint', function (widgets, className, data) {
    "use strict";

    var base = widgets.NormalizedPoint,
        self = base.extend(className);

    /**
     * @name app.oIIIHβPoint
     * @function
     * @returns {app.oIIIHβPoint}
     */

    /**
     * @class
     * @extends widgets.NormalizedPoint
     */
    app.widgets.oIIIHβPoint = self
        .addMethods(/** @lends app.VelDisPoint# */{
            getColor: function () {
                if (typeof this.value !== 'number') {
                    return base.getColor.call(this);
                }

                return data.Spectrum.BuBl(this.normalize(this.value));
            },

            getField: function () {
                return 'oiii_hb';
            }
        });
}, app.data);

$oop.postpone(app.widgets, 'SFRPoint', function (widgets, className, data) {
    "use strict";

    var base = widgets.NormalizedPoint,
        self = base.extend(className);

    /**
     * @name app.SFRPoint
     * @function
     * @returns {app.SFRPoint}
     */

    /**
     * @class
     * @extends widgets.NormalizedPoint
     */
    app.widgets.SFRPoint = self
        .addMethods(/** @lends app.VelDisPoint# */{
            getColor: function () {
                if (typeof this.value !== 'number') {
                    return base.getColor.call(this);
                }

                return data.Spectrum.RdBl(this.normalize(this.value));
            },

            getField: function () {
                return 'sfr';
            }
        });
}, app.data);

$oop.postpone(app.widgets, 'BPTClassPoint', function (widgets, className, data) {
    "use strict";

    var base = widgets.Point,
        self = base.extend(className);

    /**
     * @name app.BPTClassPoint
     * @function
     * @returns {app.BPTClassPoint}
     */

    /**
     * @class
     * @extends widgets.Point
     */
    app.widgets.BPTClassPoint = self
        .addMethods(/** @lends app.VelDisPoint# */{
            getColor: function () {
                if (typeof this.value !== 'number') {
                    return base.getColor.call(this);
                }

                return [
                    {r: 0, g: 0, b: 0},
                    {r: 255, g: 0, b: 0},   // red
                    {r: 255, g: 0, b: 255}, // magenta
                    {r: 0, g: 255, b: 0},   // green
                    {r: 0, g: 0, b: 255}    // blue
                ][this.value];
            },

            getField: function () {
                return 'BPT';
            },

            getValue: function () {
                return this.value;
            }
        });
}, app.data);

$oop.postpone(app.widgets, 'RGBPoint', function (widgets, className) {
    "use strict";

    var base = widgets.Point,
        self = base.extend(className);

    /**
     * @name app.RGBPoint
     * @function
     * @returns {app.RGBPoint}
     */

    /**
     * @class
     * @extends widgets.Point
     */
    app.widgets.RGBPoint = self
        .addMethods(/** @lends app.VelDisPoint# */{
            getColor: function () {
                if (!this.value) {
                    return base.getColor.call(this);
                }

                return {
                    r: this.value[0],
                    g: this.value[1],
                    b: this.value[2]
                }
            },

            getField: function () {
                return 'rgb';
            },

            getValue: function () {
                return this.value;
            }
        });
});

$oop.postpone(app.widgets, 'Card', function (widgets, className) {
    "use strict";

    var base = $widget.Widget,
        self = base.extend(className);

    /**
     * @name app.Card
     * @function
     * @returns {app.Card}
     */

    /**
     * @class
     * @extends $oop.Base
     */
    app.widgets.Card = self
        .addPublic(/** @lends app.widgets.Image */{
            /**
             * @type {$widget.MarkupTemplate}
             */
            contentTemplate: [
                //@formatter:off
                '<div class="header"></div>'
                //@formatter:on
            ].join('').toMarkupTemplate()
        })
        .addMethods(/** @lends app.Image# */{
            init: function () {
                base.init.call(this);
                 $commonWidgets.Label.create()
                     .setTagName('h3')
                     .setLabelText(this.getTitle())
                     .setContainerCssClass('header')
                     .addToParent(this);
            },

            getTitle: function () {
                return '';
            }
        });
});

$oop.postpone(app.widgets, 'Image', function (widgets, className) {
    "use strict";

    var base = widgets.Card,
        self = base.extend(className);

    /**
     * @name app.Image
     * @function
     * @returns {app.Image}
     */

    /**
     * @class
     * @extends widgets.Card
     * @extends $event.Evented
     */
    app.widgets.Image = self
        .addConstants(/** @lends app.widgets.Image */{
            /** @constant */
            EVENT_PIXEL_HOVER: 'app.widgets.Image.EVENT_PIXEL_HOVER'
        })
        .addPublic(/** @lends app.widgets.Image */{
            /**
             * @type {$widget.MarkupTemplate}
             */
            contentTemplate: [
                //@formatter:off
                '<div class="header"></div>',
                '<div class="img"></div>',
                '<div class="spectrum"></div>',
                '<div class="spectrum-value"></div>'
                //@formatter:on
            ].join('').toMarkupTemplate()
        })
        .addMethods(/** @lends app.widgets.Image# */{
            init: function (data) {
                base.init.call(this);

                widgets.Cursor.create()
                    .setChildName('cursor')
                    .setContainerCssClass('img')
                    .addToParent(this);

                widgets.SpectrumIndicator.create()
                    .setChildName('spectrum-indicator')
                    .setContainerCssClass('spectrum')
                    .addToParent(this);

                $commonWidgets.Label.create()
                    .setChildName('value')
                    .setContainerCssClass('spectrum-value')
                    .addToParent(this);

                this.data = data;
            },

            afterRender: function () {
                base.afterRender.call(this);
                var data = this.data,
                    that = this;

                var html = '',
                    x, y, z, color,
                    $target = $(this.getElement()),
                    that = this;

                for (x = 0; x < data.width; ++x) {
                    html += '<span>';

                    for (y = 0; y < data.height; ++y) {
                        color = this.createPoint(x, y, data).getColor();
                        html += '<i data-x="' + x + '" data-y="' + y + '" style="background-color: rgb(' + color.r + ',' + color.g + ',' + color.b + ')"></i>';
                    }

                    html += '</span>'
                }

                $('.img', this.getElement()).append(html);

                html = '';
                for (z = 0; z < 255; ++z) {
                    color = this.getColor(z);
                    html += '<i style="background-color: rgb(' + color.r + ',' + color.g + ',' + color.b + ')"></i>';
                }

                $('.spectrum', this.getElement()).append(html);

                $('i', $target).on('mouseover click', function (e) {
                    if (e.buttons || e.type === 'click') {
                        var x = e.currentTarget.dataset.x,
                            y = e.currentTarget.dataset.y;

                        that.spawnEvent(that.EVENT_PIXEL_HOVER)
                            .setPayloadItems({
                                x: x,
                                y: y
                            })
                            .triggerSync();
                    }
                });
            },

            setCursorPosition: function (x, y) {
                this.getChild('cursor').setPosition(x, y);

                var value = this.createPoint(x, y, this.data).getValue();
                if (value) {
                    this.getChild('value').setLabelText(value);
                    this.getChild('spectrum-indicator').setPosition(value);
                }
            },

            createPoint: function (x, y, map) {
                // override
            },

            getTitle: function () {
                return '';
            },

            getColor: function (index) {
                return {r: 0, g: 0, b: 0};
            }
        });
});

$oop.postpone(app.widgets, 'RGBImage', function (widgets, className) {
    "use strict";

    var base = widgets.Image,
        self = base.extend(className);

    /**
     * @name app.RGBImage
     * @function
     * @returns {app.RGBImage}
     */

    /**
     * @class
     * @extends widgets.Image
     */
    app.widgets.RGBImage = self
        .addMethods(/** @lends app.Image# */{
            getTitle: function () {
                return 'RGB';
            },

            createPoint: function (x, y, map) {
                return widgets.RGBPoint.create(x, y, map);
            }
        });
});

$oop.postpone(app.widgets, 'SFRImage', function (widgets, className, data) {
    "use strict";

    var base = widgets.Image,
        self = base.extend(className);

    /**
     * @name app.SFRImage
     * @function
     * @returns {app.SFRImage}
     */

    /**
     * @class
     * @extends widgets.Image
     */
    app.widgets.SFRImage = self
        .addMethods(/** @lends app.Image# */{
            getTitle: function () {
                return 'SFR';
            },

            createPoint: function (x, y, map) {
                return widgets.SFRPoint.create(x, y, map);
            },

            getColor: function (index) {
                return data.Spectrum.RdBl(index);
            }
        });
}, app.data);

$oop.postpone(app.widgets, 'VelImage', function (widgets, className, data) {
    "use strict";

    var base = widgets.Image,
        self = base.extend(className);

    /**
     * @name app.VelImage
     * @function
     * @returns {app.VelImage}
     */

    /**
     * @class
     * @extends widgets.Image
     */
    app.widgets.VelImage = self
        .addMethods(/** @lends app.Image# */{
            getTitle: function () {
                return 'VEL';
            },

            createPoint: function (x, y, map) {
                return widgets.VelPoint.create(x, y, map);
            },

            getColor: function (index) {
                return data.Spectrum.RdYlBu(index);
            }
        });
}, app.data);

$oop.postpone(app.widgets, 'VelDisImage', function (widgets, className, data) {
    "use strict";

    var base = widgets.Image,
        self = base.extend(className);

    /**
     * @name app.VelDisImage
     * @function
     * @returns {app.VelDisImage}
     */

    /**
     * @class
     * @extends widgets.Image
     */
    app.widgets.VelDisImage = self
        .addMethods(/** @lends app.Image# */{
            getTitle: function () {
                return 'VEL DIS';
            },

            createPoint: function (x, y, map) {
                return widgets.VelDisPoint.create(x, y, map);
            },

            getColor: function (index) {
                return data.Spectrum.RdBl(index);
            }
        });
}, app.data);

$oop.postpone(app.widgets, 'BPTClassImage', function (widgets, className, data) {
    "use strict";

    var base = widgets.Image,
        self = base.extend(className);

    /**
     * @name app.BPTClassImage
     * @function
     * @returns {app.BPTClassImage}
     */

    /**
     * @class
     * @extends widgets.Image
     */
    app.widgets.BPTClassImage = self
        .addMethods(/** @lends app.Image# */{
            getTitle: function () {
                return 'BPT';
            },

            createPoint: function (x, y, map) {
                return widgets.BPTClassPoint.create(x, y, map);
            },

            getColor: function (index) {
                index = Math.round((index - 25)/255 * 5);
                return [
                    {r: 0, g: 0, b: 0},
                    {r: 255, g: 0, b: 0},   // red
                    {r: 255, g: 0, b: 255}, // magenta
                    {r: 0, g: 255, b: 0},   // green
                    {r: 0, g: 0, b: 255}    // blue
                ][index];
            }
        });
}, app.data);

$oop.postpone(app.widgets, 'nIIHαImage', function (widgets, className, data) {
    "use strict";

    var base = widgets.Image,
        self = base.extend(className);

    /**
     * @name app.nIIHαImage
     * @function
     * @returns {app.nIIHαImage}
     */

    /**
     * @class
     * @extends widgets.Image
     */
    app.widgets.nIIHαImage = self
        .addMethods(/** @lends app.Image# */{
            getTitle: function () {
                return 'nII Hα';
            },

            createPoint: function (x, y, map) {
                return widgets.nIIHαPoint.create(x, y, map);
            },

            getColor: function (index) {
                return data.Spectrum.RdBl(index);
            }
        });
}, app.data);

$oop.postpone(app.widgets, 'oIIIHβImage', function (widgets, className, data) {
    "use strict";

    var base = widgets.Image,
        self = base.extend(className);

    /**
     * @name app.oIIIHβImage
     * @function
     * @returns {app.oIIIHβImage}
     */

    /**
     * @class
     * @extends widgets.Image
     */
    app.widgets.oIIIHβImage = self
        .addMethods(/** @lends app.Image# */{
            getTitle: function () {
                return 'oIII Hβ';
            },

            createPoint: function (x, y, map) {
                return widgets.oIIIHβPoint.create(x, y, map);
            },

            getColor: function (index) {
                return data.Spectrum.BuBl(index);
            }
        });
}, app.data);

$oop.postpone(app.widgets, 'BPTScatterGraph', function (widgets, className) {
    "use strict";

    var base = widgets.Card,
        self = base.extend(className);

    /**
     * @name app.BPTScatterGraph
     * @function
     * @returns {app.BPTScatterGraph}
     */

    /**
     * @class
     * @extends widgets.Image
     */
    app.widgets.BPTScatterGraph = self
        .addMethods(/** @lends app.Image# */{
            init: function (data) {
                base.init.call(this);
                this.data = data;
            },

            afterRender: function () {
                base.afterRender.call(this);

                var data = this.data;

                var points = data.bpt_points.map(function (value) {
                        return {
                            name: 'x:' + value.x + ', y:' + value.y,
                            x: value.oiii_hb,
                            y: value.nii_ha
                        }
                    }),
                    $container = $(this.getElement()),
                    $img = $('<div class="img"></div>');

                $container.append($img);

                var current = $img.highcharts();
                if (current) {
                    current.destroy();
                }

                // need to delay to make sure that it fits in the right box
                setTimeout(function () {
                    $img.highcharts({
                        chart: {
                            type: 'scatter',
                            zoomType: 'xy'
                        },
                        title: null,
                        xAxis: {
                            title: {
                                enabled: true,
                                text: "oIII Hβ"
                            }
                        },
                        yAxis: {
                            title: {
                                enabled: true,
                                text: "nII Hα"
                            }
                        },
                        plotOptions: {
                            scatter: {
                                tooltip: {
                                    headerFormat: '',
                                    pointFormat: '{point.name}, oIII Hβ {point.x}, nII Hα {point.y}'
                                },
                                marker: {
                                    radius: 1
                                }
                            }
                        },
                        credits: {
                            enabled: false
                        },
                        legend: {
                            enabled: false
                        },
                        series: [{
                            data: points
                        }]
                    })
                }, 0);
            },

            getTitle: function () {
                return 'BPT Scatter';
            }
        });
});

$oop.postpone(app.widgets, 'SpecGraph', function (widgets, className) {
    "use strict";

    var base = $widget.Widget,
        self = base.extend(className);

    /**
     * @name app.widgets.SpecGraph
     * @function
     * @returns {app.widgets.SpecGraph}
     */

    /**
     * @class
     * @extends $widget.Widget
     */
    app.widgets.SpecGraph = self
        .addMethods(/** @lends app.Image# */{
            init: function (spec, wave, yMax, scalar) {
                base.init.call(this);

                this.spec = spec;
                this.wave = wave;
                this.yMax = yMax;
                this.scalar = scalar;
            },

            afterRender: function () {
                base.afterRender.call(this);

                var that = this;

                var spec = this.spec,
                    wave = this.wave,
                    yMax = this.yMax;

                if (!spec) {
                    return;
                }

                var $container = $(this.getElement());
                var title = this.getTitle();

                var detailChart,
                    data = [];

                $container.html('');

                var x = wave.min,
                    max = 0;

                for (var i = 0; i < spec.length; ++i) {
                    max = Math.max(max, spec[i]);

                    data.push([x, (spec[i]/255*this.scalar) || null]);

                    x += wave.step;
                }

                // create the detail chart
                function createDetail(masterChart, $detailContainer) {

                    // prepare the detail chart
                    var detailData = [],
                        detailStart = data[0][0];

                    $.each(masterChart.series[0].data, function () {
                        if (this.x >= detailStart) {
                            detailData.push(this.y);
                        }
                    });

                    detailChart = $detailContainer.highcharts({
                        credits: {
                            enabled: false
                        },
                        title: {
                            text: title
                        },
                        xAxis: {
                            type: 'linear',
                            min: wave.min,
                            max: wave.max,
                            tickPixelInterval: 20,
                            minorTickInterval: 'auto',
                            minorGridLineWidth: 0,
                            minorTickWidth: 1,
                            minorTickLength: 5
                        },
                        yAxis: {
                            title: {
                                text: null
                            },
                            min: 0,
                            max: yMax
                        },
                        tooltip: {
                            formatter: function () {
                                return 'x:' + this.points[0].x + ', y:' + this.points[0].y;
                            },
                            shared: true
                        },
                        legend: {
                            enabled: false
                        },
                        plotOptions: {
                            series: {
                                animation: false
                            }
                        },
                        series: [{
                            pointInterval: wave.step,
                            pointStart: data[0][0],
                            step: true,
                            data: data
                        }]

                    }).highcharts(); // return chart
                }

                function zoom(masterChart, detailChart) {

                    var detailData = [],
                        xAxis = masterChart.xAxis[0],
                        min = that.getMin(),
                        max = that.getMax();

                    // reverse engineer the last part of the data
                    $.each(masterChart.series[0].data, function () {
                        if (this.x > min && this.x < max) {
                            detailData.push([this.x, this.y]);
                        }
                    });

                    // move the plot bands to reflect the new detail span
                    xAxis.removePlotBand('mask-before');
                    xAxis.addPlotBand({
                        id: 'mask-before',
                        from: data[0][0],
                        to: min,
                        color: 'rgba(0, 0, 0, 0.2)'
                    });

                    xAxis.removePlotBand('mask-after');
                    xAxis.addPlotBand({
                        id: 'mask-after',
                        from: max,
                        to: data[data.length - 1][0],
                        color: 'rgba(0, 0, 0, 0.2)'
                    });

                    detailChart.xAxis[0].update({
                        min: null,
                        max: null
                    });

                    detailChart.series[0].setData(detailData);
                }
                // create the master chart
                function createMaster($masterContiner, $detailContainer) {
                    $masterContiner.highcharts({
                            chart: {
                                zoomType: 'x',
                                events: {

                                    // listen to the selection event on the master chart to update the
                                    // extremes of the detail chart
                                    selection: function (event) {
                                        var extremesObject = event.xAxis[0],
                                            min = extremesObject.min,
                                            max = extremesObject.max;

                                        that.setMin(min);
                                        that.setMax(max);


                                        zoom($masterContiner.highcharts(), detailChart);

                                        return false;
                                    }
                                }
                            },
                            title: {
                                text: null
                            },
                            xAxis: {
                                type: 'linear',
                                min: wave.min,
                                max: wave.max,
                                visible: false
                            },
                            yAxis: {
                                title: {
                                    text: null
                                },
                                min: 0,
                                max: yMax,
                                showLastLabel: false,
                                showFirstLabel: false
                            },
                            tooltip: {
                                formatter: function () {
                                    return false;
                                }
                            },
                            legend: {
                                enabled: false
                            },
                            credits: {
                                enabled: false
                            },
                            plotOptions: {
                                series: {
                                    animation: false
                                }
                            },
                            series: [{
                                pointInterval: wave.step,
                                pointStart: data[0][0],
                                step: true,
                                data: data,
                                lineWidth: 1
                            }]

                        }, function (masterChart) {
                            createDetail(masterChart, $detailContainer);
                        })
                        .highcharts(); // return chart instance
                }

                var $detailContainer = $('<div class="detail">')
                    .css({
                        height: 225
                    })
                    .appendTo($container);

                var $masterContainer = $('<div class="master">')
                    .css({
                        position: 'absolute',
                        bootom: 0,
                        height: 75,
                        width: '100%'
                    })
                    .appendTo($container);

                // create master and in its callback, create the detail chart
                createMaster($masterContainer, $detailContainer);

                if (that.getMin() && that.getMax()) {
                    zoom($masterContainer.highcharts(), $detailContainer.highcharts());
                }
            },

            removeFromParent: function () {
                $(this.getElement()).children().each(function () {
                    $(this).highcharts().destroy();
                });

                base.removeFromParent.call(this);
            }
        });
});

$oop.postpone(app.widgets, 'BSpecGraph', function (widgets, className) {
    "use strict";

    var base = widgets.SpecGraph,
        self = base.extend(className);

    /**
     * @name app.widgets.BSpecGraph
     * @function
     * @returns {app.widgets.BSpecGraph}
     */

    /**
     * @class
     * @extends widgets.SpecGraph
     */
    app.widgets.BSpecGraph = self
        .addMethods(/** @lends app.Image# */{
            getContainer: function () {
                return $('.b-spec');
            },

            getTitle: function () {
                return 'B Spec';
            },

            setMax: function (max) {
                self.max = max;
            },

            setMin: function (min) {
                self.min = min;
            },

            getMax: function () {
                return self.max;
            },

            getMin: function () {
                return self.min;
            }
        });
});

$oop.postpone(app.widgets, 'RSpecGraph', function (widgets, className) {
    "use strict";

    var base = widgets.SpecGraph,
        self = base.extend(className);

    /**
     * @name app.widgets.RSpecGraph
     * @function
     * @returns {app.widgets.RSpecGraph}
     */

    /**
     * @class
     * @extends widgets.SpecGraph
     */
    app.widgets.RSpecGraph = self
        .addMethods(/** @lends app.Image# */{
            getContainer: function () {
                return $('.r-spec');
            },

            getTitle: function () {
                return 'R Spec';
            },

            setMax: function (max) {
                self.max = max;
            },

            setMin: function (min) {
                self.min = min;
            },

            getMax: function () {
                return self.max;
            },

            getMin: function () {
                return self.min;
            }
        });
});

(function () {
    "use strict";

    $assertion.addTypes(/** @lends $assertion */{
        /** @param {string} expr */
        isUnsigned8Bit: function (expr) {
            return (typeof expr === 'number' || expr instanceof Number) &&
                   expr >= 0 &&
                   expr <= 255;
        }
    });
})();

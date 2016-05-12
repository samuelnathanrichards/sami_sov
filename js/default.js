var app = {};
app.data = app.data || {};
app.widgets = app.widgets || {};

$.ajax(
    'data/91924.json',
    {
        success: function (data) {
            createMaps(data)
        },
        error: function (data) {
            console.log(arguments);
        }
    }
);

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
     * @extends app.Spectrum
     */
    app.data.Spectrum = self
        .addMethods(/** @lends app.Spectrum# */{
            RdBl: function (val) {
                $assertion.isUnsigned8Bit(val);

                return {r: Math.round(val), g: 0, b: 0};
            },

            RdYlBu: function (val) {
                $assertion.isUnsigned8Bit(val);

                var color = {r: 0, g: 0, b: 0};

                if (val < 255/2) {
                    color.r = Math.round(255 - (val * 2));
                }

                color.g = Math.round(255 - Math.abs((val * 2) - 255));
                color.r = color.r + Math.round(255 - Math.abs((val * 2) - 255));

                if (val > 255/2) {
                    color.b = Math.round((val * 2) - 255);
                }

                return color;
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

                this.value = dd.map[x] && dd.map[x][y] ? dd.map[x][y][this.getField()] : null;
            },

            getColor: function () {
                return {r: 0, g: 0, b: 0};
            },

            getField: function() {
                // override
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
                this.max = dd[this.getField()].max;
                this.min = dd[this.getField()].min;
            },

            normalize: function (value) {
                value = Math.min(this.max, value);
                value = Math.max(this.min, value);

                value = ((value - this.min)/(this.max - this.min));

                return value * 255;
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

                return data.Spectrum.RdYlBu(this.normalize(this.value));
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

                return data.Spectrum.RdYlBu(this.normalize(this.value));
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

                return data.Spectrum.RdYlBu(this.normalize(this.value));
            },

            getField: function () {
                return 'sfr';
            }
        });
}, app.data);

$oop.postpone(app.widgets, 'BPTClassPoint', function (widgets, className, data) {
    "use strict";

    var base = widgets.NormalizedPoint,
        self = base.extend(className);

    /**
     * @name app.BPTClassPoint
     * @function
     * @returns {app.BPTClassPoint}
     */

    /**
     * @class
     * @extends widgets.NormalizedPoint
     */
    app.widgets.BPTClassPoint = self
        .addMethods(/** @lends app.VelDisPoint# */{
            getColor: function () {
                if (typeof this.value !== 'number') {
                    return base.getColor.call(this);
                }

                return data.Spectrum.RdYlBu(this.normalize(this.value));
            },

            getField: function () {
                return 'bpt_class';
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
                return this.value || base.getColor.call(this);
            },

            getField: function () {
                return 'rgb';
            }
        });
});

$oop.postpone(app.widgets, 'Image', function (widgets, className) {
    "use strict";

    var base = $oop.Base,
        self = base.extend(className);

    /**
     * @name app.Image
     * @function
     * @returns {app.Image}
     */

    /**
     * @class
     * @extends $oop.Base
     */
    app.widgets.Image = self
        .addMethods(/** @lends app.Image# */{
            init: function (data, map) {
                var html = '',
                    x, y, color,
                    $target = this.getContainer();

                for (x = 0; x < data.width; ++x) {
                    html += '<span>';

                    for (y = 0; y < data.height; ++y) {
                        color =  this.createPoint(x, y, map).getColor();

                        html += '<i data-x="' + x + '" data-y="' + y + '" style="background-color: rgb(' + color.r + ',' + color.g + ',' + color.b + ')"></i>';
                    }

                    html += '</span>'
                }

                $target.html(html);

                $('i', $target).on('mouseover', function (e) {
                    var x = e.currentTarget.dataset.x,
                        y = e.currentTarget.dataset.y;


                    if (map.map[x] && map.map[x][y]) {
                        createPointData(map.map[x][y]);
                        createBGraph(map.map[x][y].Aspec_B, data.Bwave, map.map[x][y].AspecMax);
                        createRGraph(map.map[x][y].Aspec_R, data.Rwave, map.map[x][y].AspecMax);
                    }
                });
            },

            getContainer: function () {
                // override
            },

            createPoint: function (x, y, map) {
                // override
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
            createPoint: function (x, y, map) {
                return widgets.RGBPoint.create(x, y, map);
            },

            getContainer: function () {
                return $('.rgb');
            }
        });
});

$oop.postpone(app.widgets, 'SFRImage', function (widgets, className) {
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
            createPoint: function (x, y, map) {
                return widgets.SFRPoint.create(x, y, map);
            },

            getContainer: function () {
                return $('.sfr');
            }
        });
});

$oop.postpone(app.widgets, 'VelImage', function (widgets, className) {
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
            createPoint: function (x, y, map) {
                return widgets.VelPoint.create(x, y, map);
            },

            getContainer: function () {
                return $('.vel');
            }
        });
});

$oop.postpone(app.widgets, 'VelDisImage', function (widgets, className) {
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
            createPoint: function (x, y, map) {
                return widgets.VelDisPoint.create(x, y, map);
            },

            getContainer: function () {
                return $('.vel_dis');
            }
        });
});

$oop.postpone(app.widgets, 'BPTClassImage', function (widgets, className) {
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
            createPoint: function (x, y, map) {
                return widgets.BPTClassPoint.create(x, y, map);
            },

            getContainer: function () {
                return $('.BPT');
            }
        });
});

$oop.postpone(app.widgets, 'nIIHαImage', function (widgets, className) {
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
            createPoint: function (x, y, map) {
                return widgets.nIIHαPoint.create(x, y, map);
            },

            getContainer: function () {
                return $('.nii_ha');
            }
        });
});

$oop.postpone(app.widgets, 'oIIIHβImage', function (widgets, className) {
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
            createPoint: function (x, y, map) {
                return widgets.oIIIHβPoint.create(x, y, map);
            },

            getContainer: function () {
                return $('.oiii_hb');
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


var createMaps = function (data) {
    var dd = createDenormalisedData(data);

    $('h2').html('Galaxy: ' + data.id);

    var TspecMax = Math.max.apply(Math, data.Tspec_B.concat(data.Tspec_R));

    createBGraph(data.Tspec_B, data.Bwave, TspecMax);
    createRGraph(data.Tspec_R, data.Rwave, TspecMax);

    app.widgets.RGBImage.create(data, dd);
    app.widgets.SFRImage.create(data, dd);
    app.widgets.VelImage.create(data, dd);
    app.widgets.VelDisImage.create(data, dd);
    app.widgets.BPTClassImage.create(data, dd);
    app.widgets.nIIHαImage.create(data, dd);
    app.widgets.oIIIHβImage.create(data, dd);

    $('.sov-loader').hide();
    $('.sov').show();
};

// Returns the value at a given percentile in a sorted numeric array.
// "Linear interpolation between closest ranks" method
function percentile(arr, p) {
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

var createDenormalisedData = function (data) {
    var map = [],
        point,
        sfr = [],
        vel = [],
        vel_dis = [],
        nii_ha = [],
        oiii_hb = [],
        bpt_class = [];


    // x = nii_ha
    // y = oiii

    for (var i = 0; i < data.spaxel_data.length; ++i) {
        point = data.spaxel_data[i];
        map[point.x] = map[point.x] || [];
        map[point.x][point.y] = point;

        point.SspecMax = Math.max.apply(Math, point.Sspec_B.concat(point.Sspec_R));
        point.AspecMax = Math.max.apply(Math, point.Aspec_B.concat(point.Aspec_R));

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
            point.bpt_class = point.oiii_hb/point.nii_ha;
            bpt_class.push(point.bpt_class);
        }
    }

    vel.sort(function(a,b){return a - b});
    sfr.sort(function(a,b){return a - b});
    vel_dis.sort(function(a,b){return a - b});
    nii_ha.sort(function(a,b){return a - b});
    oiii_hb.sort(function(a,b){return a - b});
    bpt_class.sort(function(a,b){return a - b});

    var rd =  {
        sfr: {
            max: percentile(sfr, 0.95),
            min: percentile(sfr, 0.05)
        },
        vel: {
            max: percentile(vel, 0.95),
            min: percentile(vel, 0.05)
        },
        vel_dis: {
            max: percentile(vel_dis, 0.99),
            min: percentile(vel_dis, 0.01)
        },
        nii_ha: {
            max: percentile(nii_ha, 0.99),
            min: percentile(nii_ha, 0.01)
        },
        oiii_hb: {
            max: percentile(oiii_hb, 0.99),
            min: percentile(oiii_hb, 0.01)
        },
        bpt_class: {
            max: percentile(bpt_class, 0.99),
            min: percentile(bpt_class, 0.01)
        },
        map: map // x,y index 2d array
    };

    return rd;
};



var createPointData = function (data) {
    $('.point').html([
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
};

var createBGraph = function (spec, wave, max) {
    createGraph(spec, wave, $('.b-spec'), 'B Spec', max);
};

var createRGraph = function (spec, wave, max) {
    createGraph(spec, wave, $('.r-spec'), 'R Spec', max);
};

var createGraph = function (spec, wave, $container, title, xMax) {
    var detailChart,
        data = [];

    $container.html('');

    var x = wave.min,
        max = 0;
    for (var i = 0; i < spec.length; ++i) {
        max = Math.max(max, spec[i]);

        data.push([x, spec[i] || null]);

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

        // create a detail chart referenced by a global variable
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
                max: xMax,
                tickInterval: 50,
                minorTickInterval: 25
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
                                max = extremesObject.max,
                                detailData = [],
                                xAxis = this.xAxis[0];

                            // reverse engineer the last part of the data
                            $.each(this.series[0].data, function () {
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
                    max: xMax,
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

    var $detailContainer = $('<div>')
        .css({
            height: 225
        })
        .appendTo($container);

    var $masterContainer = $('<div>')
        .css({
            position: 'absolute',
            bootom: 0,
            height: 75,
            width: '100%'
        })
        .appendTo($container);

    // create master and in its callback, create the detail chart
    createMaster($masterContainer, $detailContainer);
};
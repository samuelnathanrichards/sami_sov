

Array.max = function( array ){
    return Math.max.apply( Math, array );
};

Array.min = function( array ){
    return Math.min.apply( Math, array );
};

var spectrum = {
    RdBl: function (val) {
        return {r: Math.round(val), g: 0, b: 0};
    },

    RdGrBu: function (val) {
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
};

var color = {
    rgb: function (x, y, dd) {
        var point;

        if (dd.map[x] && dd.map[x][y]) {
            point = dd.map[x][y];
        }

        // "rgb": [0,0,0]
        //return {r: point.rgb[0], g: point.rgb[1], b: point.rgb[2]};
        return {r: 0, g: 0, b: 0}
    },

    sfr: function (x, y, dd) {
        var sfr = false;

        if (dd.map[x] && dd.map[x][y]) {
            sfr = dd.map[x][y].vel;
        }

        if (sfr === false) {
            return {r: 0, g: 0, b: 0};
        }

        return spectrum.RdGrBu(normalize(sfr, dd.sfr.max, dd.sfr.min));
    },

    BPT: function (x, y, map) {
        return {r: 0, g: 0, b: 0}
    },

    nii_ha: function (x, y, dd) {
        var nii_ha = false;

        if (dd.map[x] && dd.map[x][y]) {
            nii_ha = dd.map[x][y].vel;
        }

        if (nii_ha === false) {
            return {r: 0, g: 0, b: 0};
        }

        return spectrum.RdGrBu(normalize(nii_ha, dd.nii_ha.max, dd.nii_ha.min));
    },

    oiii_hb: function (x, y, dd) {
        var oiii_hb = false;

        if (dd.map[x] && dd.map[x][y]) {
            oiii_hb = dd.map[x][y].vel;
        }

        if (!oiii_hb) {
            return {r: 0, g: 0, b: 0};
        }

        return spectrum.RdGrBu(normalize(oiii_hb, dd.oiii_hb.max, dd.oiii_hb.min));
    },

    vel: function (x, y, dd) {
        var vel = false;

        if (dd.map[x] && dd.map[x][y]) {
            vel = dd.map[x][y].vel;
        }

        if (vel === false) {
            return {r: 0, g: 0, b: 0};
        }
        return spectrum.RdGrBu(normalize(vel, dd.vel.max, dd.vel.min));

    },

    vel_dis: function (x, y, dd) {
        var vel_dis = 0;

        if (dd.map[x] && dd.map[x][y]) {
            vel_dis = dd.map[x][y].vel_dis;
        }

        if (!vel_dis) {
            return {r: 0, g: 0, b: 0};
        }

        return spectrum.RdBl(normalize(vel_dis, dd.vel_dis.max, dd.vel_dis.min));
    }
};

function normalize(value, max, min) {
    value = Math.min(max, value);
    value = Math.max(min, value);

    value = ((value - min)/(max - min));

    return value * 255;
}

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

var createMaps = function (data) {
    var dd = createDenormalisedData(data);

    // x = nii_ha
    // y = oiii

    $('h2').html('Galaxy: ' + data.id);

    var TspecMax = Math.max.apply(Math, data.Tspec_B.concat(data.Tspec_R));

    createBGraph(data.Tspec_B, data.Bwave, TspecMax);
    createRGraph(data.Tspec_R, data.Rwave, TspecMax);

    createImage($('.rgb'), data.width, data.height, color.rgb, dd);
    createImage($('.sfr'), data.width, data.height, color.sfr, dd);
    createImage($('.vel'), data.width, data.height, color.vel, dd);
    createImage($('.vel_dis'), data.width, data.height, color.vel_dis, dd);
    createImage($('.BPT'), data.width, data.height, color.BPT, dd);
    createImage($('.nii_ha'), data.width, data.height, color.nii_ha, dd);
    createImage($('.oiii_hb'), data.width, data.height, color.oiii_hb, dd);



    $('.img i').on('mouseover', function (e) {
        var x = e.currentTarget.dataset.x,
            y = e.currentTarget.dataset.y;

        if (dd.map[x] && dd.map[x][y]) {
            createPointData(dd.map[x][y]);
            createBGraph(dd.map[x][y].Aspec_B, data.Bwave, dd.map[x][y].AspecMax);
            createRGraph(dd.map[x][y].Aspec_R, data.Rwave, dd.map[x][y].AspecMax);
        }
    });

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
        oiii_hb = [];

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
    }

    vel.sort(function(a,b){return a - b});
    sfr.sort(function(a,b){return a - b});
    vel_dis.sort(function(a,b){return a - b});
    nii_ha.sort(function(a,b){return a - b});
    oiii_hb.sort(function(a,b){return a - b});

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
        map: map // x,y index 2d array
    };

    return rd;
};

var createImage = function ($target, width, height, callback, map) {
    var html = '',
        x, y, color;

    for (x = 0; x < width; ++x) {
        html += '<span>';

        for (y = 0; y < height; ++y) {
            color = callback(x, y, map);
            html += '<i data-x="' + x + '" data-y="' + y + '" style="background-color: rgb(' + color.r + ',' + color.g + ',' + color.b + ')"></i>';
        }

        html += '</span>'
    }

    $target.html(html);
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
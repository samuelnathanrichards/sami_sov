var color = {
    sfr: function (x, y, map) {
        return {r: 0, g: 0, b: 0}
    },

    BPT: function (x, y, map) {
        return {r: 0, g: 0, b: 0}
    },

    nii_ha: function (x, y, map) {
        return {r: 0, g: 0, b: 0}
    },

    oiii_hb: function (x, y, map) {
        return {r: 0, g: 0, b: 0}
    },

    vel: function (x, y, map) {
        var vel = 0,
            color = {r: 0, g: 0, b: 0};

        if (map[x] && map[x][y]) {
            vel = map[x][y].vel;
        }

        if (vel > 0) {
            color.r = Math.round(vel / 100 * 255);
        } else if (vel < 0) {
            vel = Math.abs(vel);
            color.b = Math.round(vel / 100 * 255);
        }

        return color;
    },

    vel_dis: function (x, y, map) {
        var vel_dis = 0,
            color = {r: 0, g: 0, b: 0};

        if (map[x] && map[x][y]) {
            vel_dis = map[x][y].vel_dis;
        }

        if (vel_dis > 0) {
            color.r = Math.round(vel_dis / 100 * 255);
        } else if (vel_dis < 0) {
            vel_dis = Math.abs(vel_dis);
            color.b = Math.round(vel_dis / 100 * 255);
        }

        return color;
    }
};

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
    var map = createMap(data);

    $('h2').html('Galaxy: ' + data.id);

    createBGraph(data.Tspec_B, data.Bwave);
    createRGraph(data.Tspec_R, data.Rwave);

    createImage($('.sfr'), data.width, data.height, color.sfr, map);
    createImage($('.vel'), data.width, data.height, color.vel, map);
    createImage($('.vel_dis'), data.width, data.height, color.vel_dis, map);
    createImage($('.BPT'), data.width, data.height, color.BPT, map);
    createImage($('.nii_ha'), data.width, data.height, color.nii_ha, map);
    createImage($('.oiii_hb'), data.width, data.height, color.oiii_hb, map);

    $('.img i').on('mouseover', function (e) {
        var x = e.currentTarget.dataset.x,
            y = e.currentTarget.dataset.y;

        if (map[x] && map[x][y]) {
            createPointData(map[x][y]);
            createBGraph(map[x][y].Aspec_B, data.Bwave);
            createRGraph(map[x][y].Aspec_R, data.Rwave);
        }
    });
};

var createMap = function (data) {
    var map = [],
        point;

    for (var i = 0; i < data.spaxel_data.length; ++i) {
        point = data.spaxel_data[i];
        map[point.x] = map[point.x] || [];
        map[point.x][point.y] = point;
    }

    return map
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

            '<dt>oiii Hβ:</dt>',
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

var createBGraph = function (spec, wave) {
    createGraph(spec, wave, $('.b-spec'), 'B Spec');
};

var createRGraph = function (spec, wave) {
    createGraph(spec, wave, $('.r-spec'), 'R Spec');
};

var createGraph = function (spec, wave, $container, title) {
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
                max: 250,
                tickInterval: 100,
                minorTickInterval: 50
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
                    type: 'area',
                    pointInterval: wave.step,
                    pointStart: data[0][0],
                    step: true,
                    data: data
                }]

            }, function (masterChart) {
                createDetail(masterChart, $detailContainer);
            })
            .highcharts(); // return chart instance
    }

    var $detailContainer = $('<div>')
        .css({
            height: 200
        })
        .appendTo($container);

    var $masterContainer = $('<div>')
        .css({
            position: 'absolute',
            bootom: 0,
            height: 100,
            width: '100%'
        })
        .appendTo($container);

    // create master and in its callback, create the detail chart
    createMaster($masterContainer, $detailContainer);
};

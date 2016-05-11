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
            color.r = Math.round(vel/100*255);
        } else if (vel < 0) {
            vel = Math.abs(vel);
            color.b = Math.round(vel/100*255);
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
            color.r = Math.round(vel_dis/100*255);
        } else if (vel_dis < 0) {
            vel_dis = Math.abs(vel_dis);
            color.b = Math.round(vel_dis/100*255);
        }

        return color;
    }
};

$.ajax(
    'data/91924.json',
    {
        success: function (data) { createMaps(data) },
        error: function (data) { console.log(arguments); }
    }
);

var createMaps = function (data) {
    var map = createMap(data);

    $('.b-spec').html(JSON.stringify(data.Tspec_B));
    $('.r-spec').html(JSON.stringify(data.Tspec_R));

    $('h2').html('Galaxy: ' + data.id);

    /**
     *
     <div><div class="rgb"></div></div>
     <div><div class="sfr"></div></div>
     <div><div class="vel"></div></div>
     <div><div class="vel_dis"></div></div>
     <div><div class="BPT"></div></div>
     <div><div class="nii_ha"></div></div>
     <div><div class="oiii_hb"></div></div>

     */
    createImage($('.sfr'), data.width, data.height, color.sfr, map);
    createImage($('.vel'), data.width, data.height, color.vel, map);
    createImage($('.vel_dis'), data.width, data.height, color.vel_dis, map);
    createImage($('.BPT'), data.width, data.height, color.BPT, map);
    createImage($('.nii_ha'), data.width, data.height, color.nii_ha, map);
    createImage($('.oiii_hb'), data.width, data.height, color.oiii_hb, map);


    $('i').on('mouseover', function (e) {
        var x = e.currentTarget.dataset.x,
            y = e.currentTarget.dataset.y;

        if (map[x] && map[x][y]) {
            $('.b-spec').html(JSON.stringify(map[x][y].Aspec_B));
            $('.r-spec').html(JSON.stringify(map[x][y].Aspec_R));
        }
    });
};

var createMap = function (data) {
    var map = [];

    for (var i = 0; i < data.spaxel_data.length; ++i) {
        map[data.spaxel_data[i].x] = map[data.spaxel_data[i].x] || [];
        map[data.spaxel_data[i].x][data.spaxel_data[i].y] = data.spaxel_data[i];
    }

    return map
};

var createImage = function($target, width, height, callback, map) {
    var html = '',
        x, y;

    for (x = 0; x < width; ++x) {
        html += '<span>';
        for (y = 0; y < height; ++y) {
            var color = callback(x, y, map);
            html += '<i data-x="'+x+'" data-y="'+y+'" style="background-color: rgb('+color.r+','+color.g+','+color.b+')"></i>';
        }

        html += '</span>'
    }

    $target.html(html);
};


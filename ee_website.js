function init() {
    
    var map;
    
    var lines = [
        'fossae',
        'jezero',
        'antoniadi'
    ];
    
    var stops = {
        'fossae': [
            [28.51696944040106, 83.408203125],          // Unnamed Crater
            [26.23430203240673, 79.60693359375],        // Fossae North
            [24.367113562651262, 76.79443359375],       // Fossae Main
            [21.80030805097259, 74.77294921875],        // Fossae South
            [17.035777250427195, 71.82861328125]        // Toro
        ],
        'jezero': [
            [18.375379094031825, 77.71728515624999],    // Jezero
            [20.694461597907797, 75.76171875],          // Hargraves
            [21.80030805097259, 74.77294921875],        // Fossae South
            [22.411028521558706, 74.33349609375001],    // Unnamed Crater
            [24.647017162630366, 74.7509765625],        // Unnamed Crater
            [25.46311452925943, 73.69628906250001],     // Unnamed Crater
            [26.470573022375085, 72.97119140625001],    // Unnamed Crater
            [26.627818226393051, 71.89453125000001],    // Unnamed Crater
            [27.72243591897343, 67.25830078125]         // Huo Hsing Vallis South
        ],
        'antoniadi': [
            [21.391704731036587, 61.17187499999999],    // Antoniadi
            [22.79643932091949, 65.50048828125],        // Baldet
            [22.978623970384913, 67.65380859375],       // Baldet II
            [24.647017162630366, 74.7509765625],        // Unnamed Crater
            [24.367113562651262, 76.79443359375],       // Fossae Main
            [25.443274612305746, 83.8916015625]         // Peridier
        ]
    }
    
    var mbta_train_colors = {
        'red': '#C80000',
        'orange': '#FE6700',
        'green': '#11773C',
        'blue': '#00009C',
        'silver': '#8D8787'
    };
    
    var initMap = function(){
        // All this from: http://openplanetarymap.org/basemaps/#1/-70/229
        // Need to decide whether to keep using Leaflet or switch to OpenLayers for the rest of this.....
        
        // Reason to stay with Leaflet: http://zevross.com/blog/2014/09/30/use-the-amazing-d3-library-to-animate-a-path-on-a-leaflet-map/
        
        map = L.map('map', {
            // Zoom and Center on Nili Fossae
            center: [23.34, 78.06], 
            zoom: 5.5
        });
        
        map.on('click', function(e) {
            //alert("Lat, Lon : " + e.latlng.lat + ", " + e.latlng.lng);
            console.log([e.latlng.lat, e.latlng.lng]);
        });

        var baseUrl = 'http://s3-eu-west-1.amazonaws.com/whereonmars.cartodb.net/';
        var opmAttribution = '<a href="https://github.com/openplanetary/opm/wiki/OPM-Basemaps" target="blank">OpenPlanetaryMap</a>'

        var OPM_MarsBasemap = new L.tileLayer(baseUrl + 'mola-gray/{z}/{x}/{y}.png', {
            maxNativeZoom: 9,
            zoom: 3,
            tms: true,
            attribution: 'NASA/MOLA | ' + opmAttribution
        }).addTo(map).setZIndex(0);
        
        /*// Labels (currently turned off):
        var overlay = new L.tileLayer('https://cartocdn-ashbu.global.ssl.fastly.net/nmanaud/api/v1/map/named/opm-mars-basemap-v0-1/5/{z}/{x}/{y}.png', {
			tms: false,
			opacity: 1,
			attribution: 'USGS'
		}).addTo(map).setZIndex(2);
        //*/
    };
    initMap();
    
    var trainColor = function(lineName) {
        if (lineName == "fossae") {
            return mbta_train_colors.red;
        } else if (lineName == "jezero") {
            return mbta_train_colors.blue;
        } else if (lineName == "antoniadi") {
            return mbta_train_colors.green;
        } else {
            return "#000";
        };
    };
/*  

// TURNED OFF DURING DEVELOPMENT

    for (var i=0; i<lines.length; i++) {
        // add lines
        var l = lines[i];
        var polyline = L.polyline(stops[l], {
            color: trainColor(l),
            weight: 6,
            lineCap: "square"
        }).addTo(map);
        // add stops
        for (var j=0; j<stops[l].length; j++) {
            var stp = stops[l][j];
            var circle = L.circleMarker(stp, {
                radius: 6,
                color: "#000",
                fillColor: '#fff',
                fillOpacity: 1.0
            }).addTo(map);
        };
    };
    
//*/  
};
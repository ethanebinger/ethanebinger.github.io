function init() {
	// initialize map
	var map = L.map('map', {
		center: [23.34, 78.06],
		zoom: 5.5,
		minZoom: 5.5,
		maxZoom: 5.5,
		dragging: true,
		scrollWheelZoom: false,
		doubleClickZoom: false,
		touchZoom: false
	});
	// load martian background
    var baseUrl = 'http://s3-eu-west-1.amazonaws.com/whereonmars.cartodb.net/';
    L.tileLayer(baseUrl + 'mola-gray/{z}/{x}/{y}.png', {
        maxNativeZoom: 9, tms: true, attribution: 'NASA/MOLA'
    }).addTo(map);
	
	// define stop locations by line
    var stops = {
        'fossae': [
            [28.51696944040106, 83.408203125],
            [26.23430203240673, 79.60693359375],
            [24.367113562651262, 76.79443359375],
            [21.80030805097259, 74.77294921875],
            [17.035777250427195, 71.82861328125]
        ],
        'jezero': [
            [18.375379094031825, 77.71728515624999],
            [20.694461597907797, 75.76171875],
            [21.80030805097259, 74.77294921875],
            [22.411028521558706, 74.33349609375001],
            [24.647017162630366, 74.7509765625],
            [25.46311452925943, 73.69628906250001],
            [26.470573022375085, 72.97119140625001],
            [26.627818226393051, 71.89453125000001],
            [27.72243591897343, 67.25830078125]
        ],
        'antoniadi': [
            [21.391704731036587, 61.17187499999999],
            [22.79643932091949, 65.50048828125],
            [22.978623970384913, 67.65380859375],
            [24.647017162630366, 74.7509765625],
            [24.367113562651262, 76.79443359375],
            [25.443274612305746, 83.8916015625]
        ]
    };
	// define station names
    const stationNames = {
        'fossae': ['Unnamed Crater','Fossae North','Fossae Main','Fossae South','Toro'],
        'jezero': ['Jezero','Hargraves','Fossae South','Unnamed Crater','Unnamed Crater','Unnamed Crater','Unnamed Crater','Unnamed Crater','Huo Hsing Vallis South'],
        'antoniadi': ['Antoniadi','Baldet','Baldet II','Unnamed Crater','Fossae Main','Peridier']
    };

    // Line colors (pastel)
    function lineColor(line) {
        if (line === "fossae") return "#a6cee3";
        if (line === "jezero") return "#b2df8a";
        if (line === "antoniadi") return "#beaed4";
        return "#000";
    }

    // Train fill colors
    function trainColor(line) {
        if (line === "fossae") return "#1f78b4";
        if (line === "jezero") return "#33a02c";
        if (line === "antoniadi") return "#7570b3";
        return "#000";
    }

	// add map as D3 object
    L.svg().addTo(map);
    const svg = d3.select(map.getPanes().overlayPane).select("svg");

    const lineOrder = ['antoniadi', 'jezero', 'fossae'];

    lineOrder.forEach((lineName, idx) => {
        const coords = stops[lineName];
        const colorLine = lineColor(lineName);
        const colorTrain = trainColor(lineName);
        const gLine = svg.append("g").attr("class", "leaflet-zoom-hide");

        function project(latlng) { return map.latLngToLayerPoint(latlng); }

        // Draw line
        const path = gLine.append("path")
            .attr("class", "line")
            .attr("stroke", colorLine)
            .attr("fill", "none");

        // Draw stations with hover tooltips
        const stationNodes = gLine.selectAll(`.station-${lineName}`)
            .data(coords)
            .enter()
            .append("circle")
            .attr("class", "station")
            .attr("r", 6)
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("stroke-width", 3)
            .each(function(d,i) {
                d3.select(this).append("title").text(stationNames[lineName][i]);
            });

        // Create two trains per line
        const trains = [
            svg.append("circle").attr("class","train")
               .attr("fill", colorTrain).attr("stroke", "#000").attr("stroke-width", 2),
            svg.append("circle").attr("class","train")
               .attr("fill", colorTrain).attr("stroke", "#000").attr("stroke-width", 2)
        ];

        function update() {
            path.attr("d", d3.line()
                .x(d => project(d).x)
                .y(d => project(d).y)(coords));

            const zoomScale = map.getZoom() / 5.5;
            path.attr("stroke-width", 14 * zoomScale);

            stationNodes
                .attr("cx", d => project(d).x)
                .attr("cy", d => project(d).y)
                .attr("r", 6 * zoomScale);

            trains.forEach(t => t.attr("r", 8 * zoomScale));
        }

        update();
        map.on("zoomend moveend", update);

        // Train animation
        function animateSegment(train, i, forward=true) {
            let from, to;
            if (forward) { from = coords[i]; to = coords[i+1]; }
            else { from = coords[i]; to = coords[i-1]; }

            if (!from || !to) {
                animateSegment(train, forward ? 0 : coords.length-1, !forward);
                return;
            }

            const start = project(from);
            const end = project(to);

            const dist = Math.hypot(end.x - start.x, end.y - start.y);
            const speed = 0.02;
            const duration = dist / speed;

            train
                .attr("cx", start.x)
                .attr("cy", start.y)
                .transition()
                .duration(duration)
                .ease(d3.easeLinear)
                .attr("cx", end.x)
                .attr("cy", end.y)
                .on("end", () => {
                    if (forward && i < coords.length - 2) animateSegment(train, i+1, true);
                    else if (!forward && i > 1) animateSegment(train, i-1, false);
                    else animateSegment(train, forward ? i+1 : i-1, !forward);
                });
        }

        // Start trains
        setTimeout(() => animateSegment(trains[0], 0, true), idx*2000);
        setTimeout(() => animateSegment(trains[1], coords.length-1, false), idx*2000);
    });
}
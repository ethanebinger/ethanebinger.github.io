function init_bikemap() {
    var w = $("#bluebikes_tripmap").width(),
        h = 640;

    var projection = d3.geo.conicConformal()
        .parallels([41 + 43 / 60, 42 + 41 / 60])
        .rotate([71 + 30 / 60, -41 ]);
        //.scale([250000])
        //.translate([-(w/0.75),h*12.20]);

    var path = d3.geo.path()
        .projection(projection);

    var svg = d3.select("#bluebikes_tripmap").insert("svg:svg", "h2")
        .attr("width", w)
        .attr("height", h);

    var towns = svg.append("svg:g")
        .attr("id", "towns");

    d3.json("bluebikes_tripmap/MA_TOWNS_MPO97_TOPO.json", function(error, collection) {
        if (error) throw error;

        var communities = topojson.feature(collection, collection.objects.MA_TOWNS_MPO97).features;
        
        //https://bl.ocks.org/mbostock/4707858
        var boston = communities.filter(function(d) { return d.properties.TOWN_ID === 35; })[0];
        projection.scale(1).translate([0, 0]);
        var b = path.bounds(boston),
            s = .95 / Math.max((b[1][0] - b[0][0]) / w, (b[1][1] - b[0][1]) / h),
            t = [(w - s * (b[1][0] + b[0][0])) / 2, (h - s * (b[1][1] + b[0][1])) / 2];
        projection.scale(s).translate(t);
            
        towns.selectAll("path")
            .data(communities)
            .enter()
            .append("svg:path")
                .attr("d", path);
    });

    function load_trips(filedate) {
        $("#loading").show();
        var circles = svg.append("svg:g")
            .attr("id", "circles");

        var cells = svg.append("svg:g")
            .attr("id", "cells");

        // BlueBikes Trips
        d3.csv("bluebikes_tripmap/"+filedate+'-tripdata.csv', function(trips) {            
            var linksByOrigin = trips[0],
                countByStation = {},
                locationByStation = {},
                positions = [];

            var station_ids = Object.keys(linksByOrigin);
            for (var i=0; i<station_ids.length; i++) {
                var id = station_ids[i];
                for (var t=0; t<linksByOrigin[id].length; t++) {
                    var origin = linksByOrigin[id][t].source,
                        destination = linksByOrigin[id][t].target;
                    countByStation[origin] = (countByStation[origin] || 0) + 1;
                    countByStation[destination] = (countByStation[destination] || 0) + 1;
                };
            };

            var arc = d3.geo.greatArc()
                .source(function(d) { return locationByStation[d.source]; })
                .target(function(d) { return locationByStation[d.target]; });

            d3.json('https://gbfs.bluebikes.com/gbfs/en/station_information.json', function(stations) {
                stations = stations.data.stations;
                // Only consider stations with at least one trip.
                stations = stations.filter(function(station) {
                    if (countByStation[station.station_id]) {
                        var location = [+station.lon, +station.lat];
                        locationByStation[station.station_id] = location;
                        positions.push(projection(location));
                        return true;
                    }
                });

                // Compute the Voronoi diagram of stations' projected positions.
                var polygons = d3.geom.voronoi(positions);

                var g = cells.selectAll("g")
                    .data(stations)
                    .enter().append("svg:g");

                g.append("svg:path")
                    .attr("class", "cell")
                    .attr("d", function(d, i) { return "M" + polygons[i].join("L") + "Z"; })
                    .on("mouseover", function(d, i) { 
                        $("#cur_station").text(d.name);
                        $("#num_trips").text(countByStation[d.station_id].toLocaleString() + " trips originating at this station");
                        var distances = {};
                        $.each(linksByOrigin[d.station_id],function(d,i) {
                           distances[i.target] = (distances[i.target] || 0) + 1;
                        });
                        var d_max = Object.keys(distances).reduce(function(a, b){ 
                            return distances[a] > distances[b] ? a : b 
                        });
                        for (var i=0; i<stations.length; i++) { 
                            if (stations[i].station_id === d_max) { 
                                d_max = stations[i].name;
                            }
                        }
                        $("#freq_dest").text("Most Frequent Destination: " + d_max);
                    });

                g.selectAll("path.arc")
                    .data(function(d) { return linksByOrigin[d.station_id] || []; })
                    .enter()
                    .append("svg:path")
                        .attr("class", "arc")
                        .attr("d", function(d) { 
                            try { return path(arc(d)); } 
                            catch(err) { console.log(err.message); }
                        });

                circles.selectAll("circle")
                    .data(stations)
                    .enter()
                    .append("svg:circle")
                        .attr("cx", function(d, i) { return positions[i][0]; })
                        .attr("cy", function(d, i) { return positions[i][1]; })
                        .attr("r", function(d, i) { return Math.sqrt(countByStation[d.station_id])/4.0; })
                        .sort(function(a, b) { return countByStation[b.station_id] - countByStation[a.station_id]; });

                $("#loading").hide();
            });
        });
    }
    $(".dropdown-content a").on("click", function(e) {
        $("#trips_date").text(this.text);
        $("#cur_station").text("");
        $("#num_trips").text("");
        $("#freq_dest").text("");
        d3.select("#circles").remove()
        d3.select("#cells").remove()
        load_trips(this.id);
    });

    // Load Map
    load_trips("201803");
    $("#trips_date").text("March, 2018");
    
};
// Using Mike Bostock's Towards Reusable Charts Pattern
'use strict';
function mapChart() {
 
    // All options that should be accessible to caller
    //975*610=1300, width/scale.ratio = 0.75, width/height.ratio = 1.6
    var data = []
        , width = 420
        , height = 263
        , scale = 550
        , fillColor = '#003154'
        , strokeColor = '#00649e'
        , pin = () => {}
        , pinZooming = () => {}
        , projection = d3.geoAlbersUsa()
            .translate([width / 2, height / 2])
            .scale(scale)
        , updateData
        , updateWidth

    function chart(selection){
        var path = d3.geoPath()
            .projection(projection)
        var svg  = selection.append('svg')
            .attr('height', height)
            .attr('width', width)

        //Then define the drag behavior
        var zooming = function(d) {

            //Log out d3.event.transform, so you can see all the goodies inside
            //console.log(d3.event.transform);

            //New offset array
            var offset = [d3.event.transform.x, d3.event.transform.y];
            //Calculate new scale
            var newScale = d3.event.transform.k * 2000;
            //Update projection with new offset and scale
            projection.translate(offset) 
                .scale(newScale)           

            //Update all paths and circles
            svg.selectAll("path")
                .attr("d", path)

            pinZooming()
        }

        var zoom = d3.zoom()
            .scaleExtent([0.25, 2.0])
            .translateExtent([[-800, -515], [825, 530]])
            .on("zoom", zooming);

        d3.json("us-states.json")
			.then(mapData => {
				var features = topojson.feature(mapData, mapData.objects.states).features

                var center = projection([-128.0, 48.0]);
                //Create a container in which all pan-able elements will live
                var map = svg.append("g")
                    .attr("id", selection.node().id + "_map")
                    .call(zoom) //Bind the zoom behavior
                    .call(zoom.transform, d3.zoomIdentity //Then apply the initial transform
                        .translate(width/2, height/2)
                        .scale(0.25)
                        .translate(-center[0], -center[1]));
                    
                //Create a new, invisible background rect to catch drag events
                map.append("rect")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", width)
                    .attr("height", height)
                    .attr("opacity", 0);
                                            
                map.append("g")
                    .selectAll("path")
                    .data(features)
                    .enter()
                    .append("path")
                    .attr("fill", fillColor)
                    .attr("d", path)
                    .style("stroke", strokeColor)
                    .style("stroke-width", 0.5)

                pinZooming = pin(map.attr('id'), data, projection)
        
                updateWidth = function () {
                    // use width to make any changes
                    // chart.scale(width * 4 / 3)

                    // projection = d3.geoAlbersUsa()
                    //     .scale(scale)
                    //     .translate([width / 2, height / 2])
                    // svg.transition().duration(1000).attr('width', width);
                    
                }
    
                updateData = function () {
                    pinZooming = pin(map.attr('id'), data, projection)
                }
			})

    }

    chart.data = _ => _ !== undefined ? (data = _, typeof updateData === 'function' ? updateData():null, chart) : data;
    chart.width = _ => _ !== undefined ? (width = _, typeof updateWidth === 'function' ? updateWidth():null, chart) : width;
    chart.height = _ => _ !== undefined ? (height = _, chart) : height;
    chart.scale = _ => _ !== undefined ? (scale = _, chart) : scale;
    chart.strokeColor = _ => _ !== undefined ? (strokeColor = _, chart) : strokeColor;
    chart.fillColor = _ => _ !== undefined ? (fillColor = _, chart) : fillColor;
    chart.pin = _ => _ !== undefined ? (pin = _, chart) : pin;
    chart.projection = _ => _ !== undefined ? (projection = _, chart) : projection;
    
    return chart;
}	

var pinScale = d3.scaleLinear().domain([0, 100]).range([2, 22])

function mouseover(d) {
    if (d.lat !== undefined) {
        var id = '#gct' + d.id
        d3.select(id)
            .transition()
            .duration(200)
            .select('circle')
            .attr("r", 24)
            .style('opacity', 1)
        d3.select(id)
            .transition()
            .duration(200)
            .selectAll('text')
            .style('opacity', 1)
    }
}

function mouseout(d) {
    if (d.lat !== undefined) {
        var id = '#gct' + d.id
        d3.select(id)
            .transition()
            .duration(500)
            .select('circle')
            .attr("r", pinScale(d.value))
            .style('opacity', 0.4)
        d3.select(id)
            .transition()
            .duration(500)
            .selectAll('text')
            .style('opacity', 0)
    }
}

function drawPin(id, data, projection) {
    var color = "#ffffff"; //chartData.Data[0].Colors[2]
    var transform = d => `translate(${projection([d.lon, d.lat])[0]},${projection([d.lon, d.lat])[1]})`
    var matrix_counter = Math.round(+d3.select('.matrixes').style('width').slice(0, -2) / (122 + 15) + 0.3)

    var zooming = function () {
        map.selectAll(".legend-cycle")
            .attr('transform', transform)
    }
    var map = d3.select('#' + id)
        map.select('g:nth-child(3)')
        .remove()

    var g_ct = map.append("g")
        .selectAll('g')
        .data(data.filter((d, i) => i < matrix_counter))
        .enter()
        .append('g')
        .attr('id', d => 'gct' + d.id)
        .attr('transform', transform)
        .attr('class', 'legend-cycle')
        .on('mouseover', mouseover)
        .on('mouseout', mouseout)
    //d3.select('#m_gct' + d.id)
    //    .style('border-color', '#fff')
    //d3.select('#m_gct' + d.id)
    //	.style('border-color', null)

    g_ct.append('circle')
        .attr('r', d => pinScale(d.value))
        .style('fill', color)
        .style('opacity', 0.4)
    g_ct.append('text')
        .attr('dy', -7)
        .style('opacity', 0)
        .style("text-anchor", "middle")
        .text(d => d.abbr)
    g_ct.append('text')
        .attr('dy', 10)
        .style('opacity', 0)
        .style("text-anchor", "middle")
        .text(d => d.value)
        .append("tspan")
        .text('%')

    return zooming
}

function drawMatrix(id, chartData) {
    var matrixHtml = function (d) {
        var dots = [];
        for (var n = 0; n < 100; n++) {
            dots.push(n >= (100 - d.value) ? "yes" : "no");
        }

        var html = `<div class='grid'>`;
        dots.forEach(function (d) {
            html += `<div class="dot ${d}"></div>`;
        });
        html += `</div><div class='legend'><h3>${d.name}</h3><div><span>${d.value}%</span>Available</div></div>`
        return html;
    }
    var dotData = chartData.Data[0].Data
        .concat(chartData.Data[1].Data)
        .sort((a, b) => a.value < b.value ? 1 : -1)
    var change = () => d3.select('#' + id).node().dataset.category = d3.select(`input[name="matrix-category"]:checked`).property('value')

    d3.select('.matrix-controls')
        .on('change', change)

    d3.select('.matrixes')
        .selectAll('div')
        .data(dotData)
        .enter()
        .append('div')
        .attr('class', d => d.lat !== undefined ? 'matrix a' : 'matrix b')
        .attr('id', d => d.lat !== undefined ? `m_gct${d.id}` : null)
        .html(matrixHtml)
        .on('mouseover', mouseover)
        .on('mouseout', mouseout)
}

function globalChart() {

    /***** ALL MATH FUNCTIONS ****/

    var to_radians = Math.PI / 180;
    var to_degrees = 180 / Math.PI;


    // Helper function: cross product of two vectors v0&v1
    function cross(v0, v1) {
        return [v0[1] * v1[2] - v0[2] * v1[1], v0[2] * v1[0] - v0[0] * v1[2], v0[0] * v1[1] - v0[1] * v1[0]];
    }

    //Helper function: dot product of two vectors v0&v1
    function dot(v0, v1) {
        for (var i = 0, sum = 0; v0.length > i; ++i) sum += v0[i] * v1[i];
        return sum;
    }

    // Helper function: 
    // This function converts a [lon, lat] coordinates into a [x,y,z] coordinate 
    // the [x, y, z] is Cartesian, with origin at lon/lat (0,0) center of the earth
    function lonlat2xyz( coord ){

        var lon = coord[0] * to_radians;
        var lat = coord[1] * to_radians;

        var x = Math.cos(lat) * Math.cos(lon);

        var y = Math.cos(lat) * Math.sin(lon);

        var z = Math.sin(lat);

        return [x, y, z];
    }

    // Helper function: 
    // This function computes a quaternion representation for the rotation between to vectors
    // https://en.wikipedia.org/wiki/Rotation_formalisms_in_three_dimensions#Euler_angles_.E2.86.94_Quaternion
    function quaternion(v0, v1) {

        if (v0 && v1) {
            
            var w = cross(v0, v1),  // vector pendicular to v0 & v1
                w_len = Math.sqrt(dot(w, w)); // length of w     

            if (w_len == 0)
                return;

            var theta = .5 * Math.acos(Math.max(-1, Math.min(1, dot(v0, v1)))),

                qi  = w[2] * Math.sin(theta) / w_len,
                qj  = - w[1] * Math.sin(theta) / w_len,
                qk  = w[0]* Math.sin(theta) / w_len,
                qr  = Math.cos(theta);

            return theta && [qr, qi, qj, qk];
        }
    }

    // Helper function: 
    // This functions converts euler angles to quaternion
    // https://en.wikipedia.org/wiki/Rotation_formalisms_in_three_dimensions#Euler_angles_.E2.86.94_Quaternion
    function euler2quat(e) {

        if(!e) return;
        
        var roll = .5 * e[0] * to_radians,
            pitch = .5 * e[1] * to_radians,
            yaw = .5 * e[2] * to_radians,

            sr = Math.sin(roll),
            cr = Math.cos(roll),
            sp = Math.sin(pitch),
            cp = Math.cos(pitch),
            sy = Math.sin(yaw),
            cy = Math.cos(yaw),

            qi = sr*cp*cy - cr*sp*sy,
            qj = cr*sp*cy + sr*cp*sy,
            qk = cr*cp*sy - sr*sp*cy,
            qr = cr*cp*cy + sr*sp*sy;

        return [qr, qi, qj, qk];
    }

    // This functions computes a quaternion multiply
    // Geometrically, it means combining two quant rotations
    // http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/arithmetic/index.htm
    function quatMultiply(q1, q2) {
        if(!q1 || !q2) return;

        var a = q1[0],
            b = q1[1],
            c = q1[2],
            d = q1[3],
            e = q2[0],
            f = q2[1],
            g = q2[2],
            h = q2[3];

        return [
        a*e - b*f - c*g - d*h,
        b*e + a*f + c*h - d*g,
        a*g - b*h + c*e + d*f,
        a*h + b*g - c*f + d*e];

    }

    // This function computes quaternion to euler angles
    // https://en.wikipedia.org/wiki/Rotation_formalisms_in_three_dimensions#Euler_angles_.E2.86.94_Quaternion
    function quat2euler(t){

        if(!t) return;

        return [ Math.atan2(2 * (t[0] * t[1] + t[2] * t[3]), 1 - 2 * (t[1] * t[1] + t[2] * t[2])) * to_degrees, 
                Math.asin(Math.max(-1, Math.min(1, 2 * (t[0] * t[2] - t[3] * t[1])))) * to_degrees, 
                Math.atan2(2 * (t[0] * t[3] + t[1] * t[2]), 1 - 2 * (t[2] * t[2] + t[3] * t[3])) * to_degrees
                ]
    }

    /*  This function computes the euler angles when given two vectors, and a rotation
        This is really the only math function called with d3 code.

        v0 - starting pos in lon/lat, commonly obtained by projection.invert
        v1 - ending pos in lon/lat, commonly obtained by projection.invert
        o0 - the projection rotation in euler angles at starting pos (v0), commonly obtained by projection.rotate
    */

    function eulerAngles(v0, v1, o0) {

        /*
            The math behind this:
            - first calculate the quaternion rotation between the two vectors, v0 & v1
            - then multiply this rotation onto the original rotation at v0
            - finally convert the resulted quat angle back to euler angles for d3 to rotate
        */

        var t = quatMultiply( euler2quat(o0), quaternion(lonlat2xyz(v0), lonlat2xyz(v1) ) );
        return quat2euler(t);	
    }


    /**************end of math functions**********************/

    var width = 600,
    height = 500,
    sens = 0.25,
    focused,
    projection = d3.geoOrthographic()
    .scale(245)
    .rotate([0, 0])
    .translate([width / 2, height / 2])
    .clipAngle(90);

    function chart(selection){
        var path = d3.geoPath()
        .projection(projection);

        var svg  = selection.append('svg')
        .attr('height', height)
        .attr('width', width)

        //Adding water

        svg.append("path")
        .datum({type: "Sphere"})
        .attr("class", "water")
        .attr("d", path)

        var gpos0, o0;

        function dragstarted(){
            //console.log(d3.mouse(this))
            gpos0 = projection.invert(d3.mouse(this));
            o0 = projection.rotate();
        
            svg.insert("path")
                     .datum({type: "Point", coordinates: gpos0})
                     .attr("class", "point")
                     .attr("d", path); 
        }
        
        function dragged(){
        
            var gpos1 = projection.invert(d3.mouse(this));
        
            o0 = projection.rotate();
        
            var o1 = eulerAngles(gpos0, gpos1, o0);
            //console.log(o1)
            if (o1) projection.rotate(o1);
        
            svg.selectAll(".point")
                     .datum({type: "Point", coordinates: gpos1});
          svg.selectAll("path").attr("d", path);
        
        }
        
        function dragended(){
            svg.selectAll(".point").remove();
        }

        var drag = d3.drag()
			.on("start", dragstarted)
			.on("drag", dragged)
			.on("end", dragended);

        //Then define the drag behavior
        var zooming = function(d) {

            //Log out d3.event.transform, so you can see all the goodies inside
            //console.log(d3.event.transform);

            //New offset array
            var offset = [d3.event.transform.x, d3.event.transform.y];
            //Calculate new scale
            var newScale = d3.event.transform.k * 500;
            //Update projection with new offset and scale
            projection.translate(offset) 
                .scale(newScale)           

            //Update all paths and circles
            svg.selectAll("path")
                .attr("d", path)

            //pinZooming()
        }

        var zoom = d3.zoom()
            .scaleExtent([0.25, 2.0])
            .translateExtent([[-800, -515], [825, 530]])
            .on("zoom", zooming);

        d3.json("world-110m.json")
        .then(mapData => {
            var countryById = {}
            var countries = topojson.feature(mapData, mapData.objects.countries).features
            var center = projection([-128.0, 48.0]);
            //Drawing countries on the globe
            var world = svg.selectAll("path.land")
            .data(countries)
            .enter().append("path")
            .attr("class", "land")
            .attr("d", path)

            svg.call(drag)
            .call(zoom) //Bind the zoom behavior
            // .call(zoom.transform, d3.zoomIdentity //Then apply the initial transform
            //     .translate(width/2, height/2)
            //     .scale(0.25)
            //     .translate(-center[0], -center[1])
            //     );

            //Drag event
            // .call(d3.behavior.drag()
            // .origin(function() { var r = projection.rotate(); return {x: r[0] / sens, y: -r[1] / sens}; })
            // .on("drag", function() {
            //     var rotate = projection.rotate();
            //     projection.rotate([d3.event.x * sens, -d3.event.y * sens, rotate[2]]);
            //     svg.selectAll("path.land").attr("d", path);
            //     svg.selectAll(".focused").classed("focused", focused = false);
            // }))
        })
    }

    return chart;
}

var chartData = {"Data":[{"Colors":["#003154","#00649e","#ffffff"],"Data":[{"id":"15","name":"New York","abbr":"NY","value":58.0,"lat":40.71,"lon":-74.0},{"id":"12","name":"Salt Lake","abbr":"SL","value":24.0,"lat":40.77,"lon":-111.89},{"id":"19","name":"Dallas","abbr":"DAL","value":22.0,"lat":32.85,"lon":-96.85},{"id":"17","name":"Seattle","abbr":"SEA","value":32.0,"lat":47.45,"lon":-122.3},{"id":"25","name":"Atlanta","abbr":"ATL","value":20.0,"lat":33.65,"lon":-84.42},{"id":"16","name":"Chicago","abbr":"CHI","value":36.0,"lat":41.9,"lon":-87.65},{"id":"18","name":"Los Angeles","abbr":"LA","value":27.0,"lat":33.93,"lon":-118.4},{"id":"26","name":"San Francisco","abbr":"SFO","value":16.0,"lat":37.62,"lon":-122.38},{"id":"28","name":"Yakutat","abbr":"YAK","value":7.0,"lat":59.52,"lon":-139.67},{"id":"29","name":"Denver","abbr":"DEN","value":2.0,"lat":39.75,"lon":-104.87},{"id":"27","name":"Phoenix","abbr":"PHX","value":12.0,"lat":33.43,"lon":-112.02}]},{"Colors":["#003154","#00649e","#ffffff"],"Data":[{"name":"Criminal","value":41.0},{"name":"Tax","value":25.0},{"name":"Corporate","value":17.0},{"name":"Real Estate","value":36.0},{"name":"Commercial","value":78.0},{"name":"Finance","value":29.0},{"name":"Litigation","value":8.0}]}]}
var pinData1 = [
    {name: 'New YorK', lat: 40.71455, lon: -74.007124 },
    {name: 'Seattle', lat: 47.60356, lon: -122.329439 },
    {name: 'Los Angeles',   lat: 34.05349, lon: -118.245319}    
];
var pinData2 = [
    {name: 'Chicago',       lat: 41.88415, lon: -87.632409},
    {name: 'Houston',       lat: 29.76045, lon: -95.369784},
    {name: 'Philadelphia',  lat: 39.95228, lon: -75.162454}
]

function drawMap(id, chartData) {
    var pinData = chartData.Data[0].Data.sort((a, b) => a.value < b.value ? 1 : -1)
    var usChart = mapChart().pin(drawPin).data(pinData)

    d3.select('#' + id).call(usChart)

    return () => drawPin(id + '_map', pinData1, usChart.projection());
}

var drawPin2 = drawMap('usmap', chartData)
drawPin2()

drawMatrix('panel', chartData)
//d3.select('#btn').on('click', () => usChart.data(pinData2))

var globalChart = globalChart()
d3.select('#globalmap').call(globalChart)
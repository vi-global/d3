// Using Mike Bostock's Towards Reusable Charts Pattern
'use strict';

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


var globalChart = globalChart()
d3.select('#globalmap').call(globalChart)
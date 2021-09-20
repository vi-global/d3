// Using Mike Bostock's Towards Reusable Charts Pattern
function mapChart() {
 
    // All options that should be accessible to caller
    var data = [];
    //975*610=1300, width/scale.ratio = 0.75, width/height.ratio = 1.6
    var width = 420;
    var height = width / 1.6;
    var scale = 1000;
    var fillColor = '#003154';
    var boardColor = '#00649e';

    var pinData = [
        {name: 'New YorK', lat: 40.71455, lon: -74.007124 },
        {name: 'Los Angeles',   lat: 34.05349, lon: -118.245319},
        {name: 'Chicago',       lat: 41.88415, lon: -87.632409},
        {name: 'Houston',       lat: 29.76045, lon: -95.369784},
        {name: 'Philadelphia',  lat: 39.95228, lon: -75.162454}
    ]

    var updateData;
    var updateWidth;

    function chart(selection){
        var projection = d3.geoAlbersUsa()
            .translate([width / 2, height / 2])
            .scale(scale)
        var path = d3.geoPath()
            .projection(projection)
        var svg  = selection.append('svg')
            .attr('height', height)
            .attr('width', width)

        //Then define the drag behavior
        var dragging = function(d) {

            //Log out d3.event, so you can see all the goodies inside
            //console.log(d3.event);

            //Get the current (pre-dragging) translation offset
            var offset = projection.translate()

            //Augment the offset, following the mouse movement
            offset[0] += d3.event.dx
            offset[1] += d3.event.dy

            //Update projection with new offset
            projection.translate(offset)

            //Update all paths and circles
            svg.selectAll("path")
                .attr("d", path)

            svg.selectAll("circle")
                .attr("cx", d => projection([d.lon, d.lat])[0])
                .attr("cy", d => projection([d.lon, d.lat])[1])

        }

        var drag = d3.drag().on("drag", dragging);

        d3.json("us-states.json")
			.then(mapData => {
				var features = topojson.feature(mapData, mapData.objects.states).features

                //Create a container in which all pan-able elements will live
                var map = svg.append("g")
                    .attr("id", "map")
                    .call(drag);  //Bind the dragging behavior
                    
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
                    .style("stroke", boardColor)
                    .style("stroke-width", 0.5)
                    //.on("click", clicked)

                map.selectAll("circle")
                    .data(pinData)
                    .enter()
                    .append("circle")
                    .attr("cx", d => projection([d.lon, d.lat])[0])
                    .attr("cy", d => projection([d.lon, d.lat])[1])
                    .attr("r", 5)
                    .style("fill", "white")
                    .style("stroke", "gray")
                    .style("stroke-width", 0.25)
                    .style("opacity", 0.75)   
                    .append("title") //Simple tooltip
                    .text(d => d.name); 
                        
        
                updateWidth = function () {
                    // use width to make any changes
                    // chart.scale(width * 4 / 3)

                    // projection = d3.geoAlbersUsa()
                    //     .scale(scale)
                    //     .translate([width / 2, height / 2])
                    // svg.transition().duration(1000).attr('width', width);
                    
                }
    
                updateData = function () {
                    // use D3 update pattern with data
                }
			})

    }

    chart.data = function (value) {
        if (!arguments.length) return data;
        data = value;
        if (typeof updateData === 'function') updateData();
        return chart;
    }

    chart.width = function(value) {
        if (!arguments.length) return width;
        width = value;
        if (typeof updateWidth === 'function') updateWidth();
        return chart;
    };

    chart.scale = function(value) {
        if (!arguments.length) return scale;
        scale = value;
        if (typeof updateScale === 'function') updateScale();
        return chart;
    };

    chart.height = function(value) {
        if (!arguments.length) return height;
        height = value;
        return chart;
    };

    chart.boardColor = function(value) {
        if (!arguments.length) return boardColor;
        boardColor = value;
        return chart;
    };

    chart.fillColor = function(value) {
        if (!arguments.length) return fillColor;
        fillColor = value;
        return chart;
    };

    return chart;
}	


var milesRun = [2, 5, 4, 1, 2, 6, 5];

var usChart = mapChart().data(milesRun)
d3.select('#usmap').call(usChart)


d3.select('#btn').on('click', () => usChart.fillColor('red'))

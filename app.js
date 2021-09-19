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
    console.log(scale, width, height)
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
        var path = d3.geoPath().projection(projection)

        d3.json("us-states.json")
			.then(mapData => {
				var features = topojson.feature(mapData, mapData.objects.states).features

                selection.each(function (data) {
                    
                    //var drawMap = function () {
                        var svg = d3.select(this).append('svg')
                            .attr('height', height)
                            .attr('width', width)

                        svg.append("g")
                            .selectAll("path")
                            .data(features)
                            .enter()
                            .append("path")
                            .attr("fill", fillColor)
                            .attr("d", path)
                            .style("stroke", boardColor)
                            .style("stroke-width", 0.5)
                            //.on("click", clicked)

                        svg.selectAll("circle")
                            .data(pinData)
                            .enter()
                            .append("circle")
                            .attr("cx", function(d) {
                            return projection([d.lon, d.lat])[0];
                            })
                            .attr("cy", function(d) {
                            return projection([d.lon, d.lat])[1];
                            })
                            .attr("r", 5)
                            .style("fill", "white")
                            .style("stroke", "gray")
                            .style("stroke-width", 0.25)
                            .style("opacity", 0.75)   
                            .append("title") //Simple tooltip
                            .text(function(d) {
                                return d.name;
                            }); 
                        
                            createPanButtons(svg)
                    //}
        
                    updateWidth = function () {
                        // use width to make any changes
                        chart.scale(width * 4 / 3)
                        console.log(scale, width, height)
                        projection = d3.geoAlbersUsa()
                            .scale(scale)
                            .translate([width / 2, height / 2])
                        svg.transition().duration(1000).attr('width', width);
                        
                    }
        
                    updateData = function () {
                        // use D3 update pattern with data
                    }
                });
			})

        var createPanButtons = function(svg) {

            //Create the clickable groups

            //North
            var north = svg.append("g")
                .attr("class", "pan")	//All share the 'pan' class
                .attr("id", "north");	//The ID will tell us which direction to head

            north.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", width)
                .attr("height", 30);

            north.append("text")
                .attr("class", "arrow")
                .attr("x", width/2)
                .attr("y", 20)
                .html("&uarr;");
            
            //South
            var south = svg.append("g")
                .attr("class", "pan")
                .attr("id", "south");

            south.append("rect")
                .attr("x", 0)
                .attr("y", height - 30)
                .attr("width", width)
                .attr("height", 30);

            south.append("text")
            .attr("class", "arrow")
            .attr("x", width/2)
                .attr("y", height - 10)
                .html("&darr;");

            //West
            var west = svg.append("g")
                .attr("class", "pan")
                .attr("id", "west");

            west.append("rect")
                .attr("x", 0)
                .attr("y", 30)
                .attr("width", 30)
                .attr("height", height - 60);

            west.append("text")
            .attr("class", "arrow")
            .attr("x", 10)
                .attr("y", height/2)
                .html("&larr;");

            //East
            var east = svg.append("g")
                .attr("class", "pan")
                .attr("id", "east");

            east.append("rect")
                .attr("x", width - 30)
                .attr("y", 30)
                .attr("width", 30)
                .attr("height", height - 60);

            east.append("text")
            .attr("class", "arrow")
            .attr("x", width - 20)
                .attr("y", height/2)
                .html("&rarr;");

            //Panning interaction

            d3.selectAll(".pan")
                .on("click", function() {
                    
                    //Get current translation offset
                    var offset = projection.translate();

                    //Set how much to move on each click
                    var moveAmount = 50;
                    
                    //Which way are we headed?
                    var direction = d3.select(this).attr("id");

                    //Modify the offset, depending on the direction
                    switch (direction) {
                        case "north":
                            offset[1] += moveAmount;  //Increase y offset
                            break;
                        case "south":
                            offset[1] -= moveAmount;  //Decrease y offset
                            break;
                        case "west":
                            offset[0] += moveAmount;  //Increase x offset
                            break;
                        case "east":
                            offset[0] -= moveAmount;  //Decrease x offset
                            break;
                        default:
                            break;
                    }

                    //Update projection with new offset
                    projection.translate(offset);

                    //Update all paths and circles
                    svg.selectAll("path")
                        .transition()
                        .attr("d", path);

                    svg.selectAll("circle")
                    .transition()
                        .attr("cx", function(d) {
                            return projection([d.lon, d.lat])[0];
                        })
                        .attr("cy", function(d) {
                            return projection([d.lon, d.lat])[1];
                        });

                });

        };
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

var usChart = mapChart();
    d3.select('#map')
        .datum(milesRun)
        .call(usChart);
;

d3.select('#btn').on('click', () => usChart.width(700))

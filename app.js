// Using Mike Bostock's Towards Reusable Charts Pattern
function mapChart() {
 
    // All options that should be accessible to caller
    var data = [];
    //975*610=1300, width/scale.ratio = 0.75, width/height.ratio = 1.6
    var opts = {
        width: 420,
        height: 263,
        scale: 550,
        fillColor: '#003154',
        strokeColor: '#00649e'
    }

    var updateData;

    function chart(selection){
        var projection = d3.geoAlbersUsa()
            .translate([this.width / 2, this.height / 2])
            .scale(this.scale)
        var path = d3.geoPath()
            .projection(projection)
        var svg  = selection.append('svg')
            .attr('height', this.height)
            .attr('width', this.width)

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

            svg.selectAll("circle")
                .attr("cx", d => projection([d.lon, d.lat])[0])
                .attr("cy", d => projection([d.lon, d.lat])[1])

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
                    .attr("id", "map")
                    .call(zoom) //Bind the zoom behavior
                    .call(zoom.transform, d3.zoomIdentity //Then apply the initial transform
                        .translate(this.width/2, this.height/2)
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

                map.selectAll("circle")
                    .data(data)
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
                        
                updateData = function () {
                    map.selectAll("circle")
                    //.transition().duration(500)
                    .remove()
                    .exit()
                    .data(data)
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
                }
			})

    }

    for (var key in opts) {
        chart[key] = etter(key, chart).bind(opts);
    }
    
    function etter(option, key) {

        return function(_) {
            if (!arguments.length) return this[option];
            this[option] = _;
  
            return key;
        }
    }

    chart.data = function (value) {
        if (!arguments.length) return data;
        data = value;
        if (typeof updateData === 'function') updateData();
        return chart;
    }

    // chart.width = function(value) {
    //     if (!arguments.length) return width;
    //     width = value;
    //     return chart;
    // };

    // chart.scale = function(value) {
    //     if (!arguments.length) return scale;
    //     scale = value;
    //     return chart;
    // };

    // chart.height = function(value) {
    //     if (!arguments.length) return height;
    //     height = value;
    //     return chart;
    // };

    // chart.strokeColor = function(value) {
    //     if (!arguments.length) return strokeColor;
    //     strokeColor = value;
    //     return chart;
    // };

    // chart.fillColor = function(value) {
    //     if (!arguments.length) return fillColor;
    //     fillColor = value;
    //     return chart;
    // };

    return chart;
}	


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

var usChart = mapChart().data(pinData1).fillColor('#ff0')
console.log(usChart.prototype)
d3.select('#usmap').call(usChart)

d3.select('#btn').on('click', () => usChart.data(pinData2))

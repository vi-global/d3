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
        .on('mouseover', module.mouseover)
        .on('mouseout', module.mouseout)
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

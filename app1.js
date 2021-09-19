var milesRun = [2, 5, 4, 1, 2, 6, 5];
var highTemperatures = [77, 71, 82, 87, 84, 78, 80, 84, 86, 72, 71, 68, 75, 73, 80, 85, 86, 80];

function drawChart(dom, data, options) {
    var width = options.width || 800;
    var height = options.height || 200;
    var barPadding = options.barPadding || 1;
    var fillColor = options.fillColor || 'steelblue';

    var barSpacing = height / data.length;
    var barHeight = barSpacing - barPadding;
    var maxValue = d3.max(data);
    var widthScale = width / maxValue;

    d3.select(dom).append('svg')
            .attr('height', height)
            .attr('width', width)
            .selectAll('rect')
            .data(data)
            .enter()
            .append('rect')
            .attr('y', function (d, i) { return i * barSpacing })
            .attr('height', barHeight)
            .attr('x', 0)
            .attr('width', function (d) { return d*widthScale})
            .style('fill', fillColor);
}

var weatherOptions = {fillColor: 'coral'};
drawChart('#weatherHistory', highTemperatures, weatherOptions);

var runningOptions = {barPadding: 2};
drawChart('#runningHistory', milesRun, runningOptions);

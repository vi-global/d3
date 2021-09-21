function base() {
    console.log('base run')
    config = {
      rdata: [500],
      selector: 'body',
      width: 50,
      height: 100,
      barg: "0"
    };
  
    function setup() {
      config.svg = d3.select(config.selector)
          .append("svg")
          .attr("width", 800)
          .attr("height", 600);
  
      return config;
    }
  
    for (var key in config) {
        setup[key] = etter(key, setup, config);
    }

  
    return setup;
}
  
  
function drawcircles(_b, append_class) {
    console.log('draw circles run')
    _c = _b;
    _c.fill = "red";


    function chart() {
    var circle = _c.svg.selectAll("."+append_class)
        .data(_c.rdata, function(d) { return d; });

    circle.enter().append("circle").transition()
        .attr("class", append_class)
        .attr('fill', _c.fill)
        .attr("cy", _c.height)
        .attr("cx", function(d, i) { return i * _c.width; })
        .attr("r", function(d) { return Math.sqrt(d); });

    circle.exit().remove();

    return chart;
    }


    for (var key in _c) {
        chart[key] = etter(key, chart, _c);
    }


    return chart;
}

  
function etter(option, attach, config) {
    return function (_) {
        if (!arguments.length) return config[option];
        config[option] = _;
        return attach;
    };
}


var base2 = new base().rdata([32, 57, 293, 150]).selector('#example')();
var chart1 = new drawcircles(base2, 'set1').fill('steelblue')();
var chart2 = new drawcircles(base2, 'set2').width(60).height(110).fill('black')();
var chart3 = new drawcircles(base2, 'set3').width(70).height(120).fill('green')();
var chart4 = new drawcircles(base2, 'set4').width(80).height(130).fill('red')();

setTimeout(function(){
chart1.rdata([45, 68, 900, 200, 321])();
chart2.rdata([45, 68, 900, 200, 321])();
chart3.rdata([45, 68, 900, 200, 321])();
chart4.rdata([45, 68, 900, 200, 321])();
console.log('delay run');
}, 3000);
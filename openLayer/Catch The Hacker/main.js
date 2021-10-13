(function(){

	var timer;
	var msRemaining = 60000;
	var	timerDiv;
	
	document.addEventListener('DOMContentLoaded',init);

	function init() {
		setupMap();
		initializeStartButton();
		initializeTimer();
	}

	function setupMap() {

		var hackerCoords = ol.proj.transform([-79.32268946851717, 43.81519696505743], 'EPSG:4326', 'EPSG:3857')

		var hackerFeature = new ol.Feature({
			geometry: new ol.geom.Point(hackerCoords)
		})

		var hackerStyle = new ol.style.Style({
			image: new ol.style.Icon({
				src: 'hacker.png'
			})
		})

		hackerFeature.setStyle(hackerStyle)

		var vectorSource = new ol.source.Vector({
			features: [hackerFeature]
		})

		var vectorLayer = new ol.layer.Vector({
			source: vectorSource,
			maxResolution: 4
		})

		var streetmapLayer = new ol.layer.Tile({
			source: new ol.source.OSM()
		});

        var myView = new ol.View({
    		center: ol.proj.transform([-95, 42], 'EPSG:4326', 'EPSG:3857'),
    		zoom: 1 
    	});
        
        var map = new ol.Map({
    		target: 'map',
    		layers: [streetmapLayer, vectorLayer],
    		view: myView,
			controls: ol.control.defaults().extend(
				[new ol.control.OverviewMap({})]
			)
    	});

        map.on('click', function(evt){
            map.forEachFeatureAtPixel(evt.pixel, function(feature, layer){
                if (feature) {
					catchHacker();
				}
            })
        })
	}

	function initializeTimer() {
		timerDiv = document.getElementById('timer');
	}

	function initializeStartButton() {
		var startDiv = document.getElementById("start");
		startDiv.addEventListener("click", function() {
			quiz.style.display = "block";
			startDiv.style.display = "none";
			startTimer();
		});
	}

	function startTimer() {
		timer = setInterval(function() {
			msRemaining -= 100;
			timerDiv.innerHTML = parseFloat(msRemaining/1000).toFixed(1);
			if(msRemaining == 0) {
				alert("The Hacker has escaped!");
				clearInterval(timer);
			}
		},100);
	}
	
	function catchHacker() {
		clearInterval(timer);
		alert("You caught The Hacker!");
	}

})();
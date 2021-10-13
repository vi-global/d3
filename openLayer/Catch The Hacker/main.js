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

		var streetmapLayer = new ol.layer.Tile({
			source: new ol.source.OSM()
		});

        var myView = new ol.View({
    		center: ol.proj.transform([-95, 42], 'EPSG:4326', 'EPSG:3857'),
    		zoom: 1 
    	});
        
        var map = new ol.Map({
    		target: 'map',
    		layers: [streetmapLayer],
    		view: myView
    	});

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
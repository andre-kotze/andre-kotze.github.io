var spinal = L.tileLayer('https://{s}.tile.thunderforest.com/spinal-map/{z}/{x}/{y}.png?apikey={apikey}', {
        attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        apikey: 'ad0f4f73069d4a6fb733a82c1f52aff0',
        maxZoom: 22
    });
    var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });
    var aliDark = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key={apikey}', {
        apikey: '8688727e-73f8-4e11-ba9d-0d676d65cb28',
        maxZoom: 20,
        attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
    });
    var ali = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png?api_key={apikey}', {
        apikey: '8688727e-73f8-4e11-ba9d-0d676d65cb28',
        maxZoom: 20,
        attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
    });
    var positron = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
    });
    var darkMatter = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
    });

    var map = L.map('map', {
        center: [51.028, 10.334],
        zoom: 5,
        minZoom:2,
        layers: [osm]
    })
    L.control.locate().addTo(map);
    L.control.scale().addTo(map);
    const ZoomViewer = L.Control.extend({
		onAdd() {
			const gauge = L.DomUtil.create('div');
			gauge.style.width = '20px';
			gauge.style.background = 'rgba(255,255,255,0.5)';
			gauge.style.textAlign = 'right';
			map.on('zoomstart zoom zoomend', (ev) => {
				gauge.innerHTML = `${map.getZoom()}`;
			});
			return gauge;
		}
	});

	const zoomViewer = (new ZoomViewer()).addTo(map);

    styleDict = {
        "Rail":{color: 'darkred', weight: 2},
        "Road":{color: 'red', weight: 2},
        "Ferries":{color: 'orange', weight: 2, dashArray: '12, 4'},
        "Tracks (long)":{color: 'red', weight: 2},
        "Tracks (short)":{color: 'red', weight: 2},
        "Flights":{color: 'green', weight: 2, opacity: 0.4, dashArray: '10, 6'}
    }

    async function addGeoJSONLineLayer(data, style) {
        //console.log("adding "+ data.slice(12,14))
        var response = await fetch(data)
        var GeoJson = await response.json()
        //var lyrLbl = label + " Potenzial"
        var geoJSONLayer = L.geoJSON(GeoJson, {
            style: style    
        });
        return geoJSONLayer;
    }
    async function loadGeoJSONfile(gjUrl, label, add) {
        layerStyle = styleDict[label]
        var gjLayer = await addGeoJSONLineLayer(gjUrl, layerStyle)
        if (add) {
            gjLayer.addTo(map)
        }
        layerControl.addOverlay(gjLayer, label)
        return gjLayer
    }


    var baseMaps = {
    "OpenStreetMap": osm,
    "OpenTopoMap":topo,
    "CartoDB Positron": positron,
    "CartoDB Dark Matter": darkMatter,
    "Stadia Alidade Smooth": ali,
    "Stadia Alidade Smooth Dark": aliDark,
    "Thunderforest Spinal Map": spinal
    };


    var layerControl = L.control.layers(baseMaps).addTo(map);
    railLayer = loadGeoJSONfile('../ako_route_2d/rail.geojson', "Rail", true)

    // Zoom Toncrol
    //map.on("zoomend", function() {
    //    var zoomlevel = map.getZoom();
    //    if (zoomlevel > 6) {
    //        if (!map.hasLayer(layerM)) {
    //            map.addLayer(layerM);
    //        } else {
    //            console.log("no point layer active");
    //        }
    //    }
    //    if (zoomlevel >= 10) {
    //        if (!map.hasLayer(layerS)) {
    //            map.addLayer(layerS);
    //        } else {
    //            console.log("no point layer active");
    //        }
    //    }
    //});
    roadLayer = loadGeoJSONfile('../ako_route_2d/road.geojson', "Road", true)
    flightsLayer = loadGeoJSONfile('../ako_route_2d/flights.geojson', "Flights", true)
    ferriesLayer = loadGeoJSONfile('../ako_route_2d/ferries.geojson', "Ferries", true)
    gpsLongLayer = loadGeoJSONfile('../ako_route_2d/gps_long.geojson', "Tracks (long)", true)
    gpsShortLayer = loadGeoJSONfile('../ako_route_2d/gps_short.geojson', "Tracks (short)", true)

    //function trackYou() {
    //    map.locate({
    //        watch: true, 
    //        setView: true, 
    //        maxZoom: 16,
    //        maximumAge: 5000,
    //        enableHighAccuracy: true
    //    });
    //}
    //
    //var locMarker = L.marker()
    //var accCircle = L.circle(e.latlng, radius, {
    //        color: "black",
    //        fillColor: 'grey',
    //        fillOpacity: 0.5
    //    }).addTo(map);
    //function onLocationFound(e) {
    //    var radius = e.accuracy;

    //    locMarker.setLatLng(e.latlng).addTo(map)
    //        .bindPopup("Current position to " + radius + " meters");
    //    accCircle.addTo(map);
    //    
    //}
    //function onLocationError(e) {
    //    console.error(e.message);
    //}

    //trackYou()
    //map.on('locationerror', onLocationError);
    //map.on('locationfound', onLocationFound);
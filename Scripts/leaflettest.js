$(document).ready(function () {
    //var SelectArea = require('leaflet-area-select');
    var app = {};
    app.workspace = 'saylortest:';
    setupMap();
    bindEvents();
    function setupMap() {
        //http://localhost:8080/geoserver/wfs?service=wfs&version=2.0.0&request=GetFeature&typeNames=saylortest:ROADS_LL&bbox=39.9,-77.76,39.95,-77.69,urn:ogc:def:crs:EPSG::4326&outputFormat=json

        app.map = L.map('mapDiv').setView([39, -78], 8);
        app.map.selectArea.enable();
        app.map.selectArea.setShiftKey(true);
        app.baseLayer = L.tileLayer.wms('http://localhost:8080/geoserver/wms?', {
            layers: 'saylortest:MUNIS_LL,saylortest:ROADS_LL,saylortest:POINTS_LL',
            transparent: true,
            attribution: 'TazDog'
        }).addTo(app.map);
        //null, {
        //    onEachFeature: function (feature, layer) {
        //        var ff = 5;
        //    }
        //}
        app.geojsonLayer = L.geoJSON(false, {
            onEachFeature: function (feature, layer) {
                var ff = 5;
            }
        }).addTo(app.map);
        //L.tileLayer.wms('http://localhost:8080/geoserver/wms?', {
        //    layers: 'saylortest:MUNIS,saylortest:ROADS_FRANKLIN,saylortest:POINTS_FRANKLIN',
        //    transparent: true,
        //    attribution: 'TazDog'
        //}).addTo(app.map);
        //L.tileLayer.wms('http://localhost:8080/geoserver/wms?', {
        //    layers: 'saylortest:MUNIS,saylortest:ROADS_FRANKLIN,saylortest:POINTS_FRANKLIN',
        //    transparent: true,
        //    attribution: 'TazDog'
        //}).addTo(app.map);
        //var muniLayer = L.tileLayer.wms('http://localhost:8080/geoserver/wms?', {
        //    layers: 'saylortest:MUNIS',
        //    transparent: true,
        //    attribution: 'TazDog'
        //});
        //var roadLayer = L.tileLayer.wms('http://localhost:8080/geoserver/wms?', {
        //    layers: 'saylortest:ROADS_FRANKLIN',
        //    transparent: true,
        //    attribution: 'TazDog'
        //});
        //var pointLayer = L.tileLayer.wms('http://localhost:8080/geoserver/wms?', {
        //    layers: 'saylortest:POINTS_FRANKLIN',
        //    transparent: true,
        //    attribution: 'TazDog'
        //});

        //var overlays = {
        //    "Municipalities": muniLayer,
        //    "Roads": roadLayer,
        //    "Points": pointLayer
        //};
        //L.control.layers(null, overlays).addTo(app.map);
    }
    function bindEvents() {

        app.map.on('areaselected', function (e) {
            //console.log(e);
            //console.log(app.map.latLngToLayerPoint(e.bounds._northEast));
            //console.log(app.map.latLngToLayerPoint());
            //console.log(e.bounds.toBBoxString());
            var queryUrl = 'http://localhost:8080/geoserver/wfs?service=wfs&version=2.0.0&request=GetFeature&typeNames=saylortest:ROADS_LL&bbox=' + e.bounds._southWest.lat + ','+ e.bounds._southWest.lng + ',' + e.bounds._northEast.lat + ',' + e.bounds._northEast.lng + ',urn:ogc:def:crs:EPSG::4326&outputFormat=json';
            console.log(queryUrl);
            //http://localhost:8080/geoserver/wfs?service=wfs&version=2.0.0&request=GetFeature&typeNames=saylortest:ROADS_LL&bbox=39.9,-77.76,39.95,-77.69,urn:ogc:def:crs:EPSG::4326&outputFormat=json
            $.ajax({
                url: queryUrl,
                type: 'GET',
                dataType: 'json'
            }).done(function (json) {
                app.geojsonLayer.clearLayers();
                var ggg = 5;
                for (var cnt = 0; cnt < json.features.length; cnt++) {
                    app.geojsonLayer.addData(json.features[cnt]);
                }
            }).fail(function (xkr, status, errorThrown) {
                var dd = 4;
            });


        });
        $('.layerCheckbox').on('change', function () {
            var onLayers = [];
            $('.layerCheckbox').each(function () {
                if (this.checked) onLayers.push(app.workspace + $(this).attr('data-layer'));
            });
            console.log(onLayers);
            app.baseLayer.setParams(
                {
                    layers: onLayers.join(),
                    transparent: true,
                    attribution: 'TazDog'
                });
        });
    }

});
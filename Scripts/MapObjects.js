
function MapLayerNew(obj, parentUrl) {
    var _parentUrl = parentUrl;

    var me = this;

    this.SubLayers = null;
    this.LayerMetadata = null;
    this.Id = 0;
    this.LayerId = 0;
    this.Queryable = false;
    this.Visible = false;
    this.Fields = null;
    this.ShowSubLayers = false;
    this.IsDefaultExtent = false;
    this.Relationships = null;
    this.LoadSublayers = _loadSublayers;
    this.Url = null;
    if (obj) {
        this.Id = obj.Id;
        this.LayerId = obj.LayerId;
        this.Name = obj.Name;
        this.Queryable = obj.Queryable;
        this.Visible = obj.Visible;
        this.Fields = obj.Fields;
        this.ShowSubLayers = obj.ShowSubLayers;
        this.IsDefaultExtent = obj.IsDefaultExtent;
        this.Relationships = obj.Relationships;
    }

    this.LoadMetadata = _loadMetadata;
    this.PopulateRelationshipMetadata = _populateRelationshipMetadata;
    this.SetInitialExtent = _setInitialExtent;
    if (parentUrl) {
        this.Url = parentUrl + '/' + this.LayerId;
    }

    function _populateRelationshipMetadata(serviceUrl) {
        var baseUrl = serviceUrl;
        require(["esri/request"], function (esriRequest) {

            var requestUrl = baseUrl + '/' + me.LayerId;
            var request = new esriRequest({
                url: requestUrl,
                content: { f: "json" },
                handleAs: "json",
                callbackParamName: "callback"
            });
            request.then(function (requestResponse) {
                if (!requestResponse.relationships || requestResponse.relationships.length === 0) return;
                var relationshipInfo = null;
                for (var relCount = 0; relCount < requestResponse.relationships.length; relCount++) {
                    if (me.Relationships[0].RelationshipName === requestResponse.relationships[relCount].name) {
                        relationshipInfo = requestResponse.relationships[relCount];
                        break;
                    }
                }
                var relationshipRequestUrl = baseUrl + '/' + relationshipInfo.relatedTableId;
                var relRequest = new esriRequest({
                    url: relationshipRequestUrl,
                    content: { f: "json" },
                    handleAs: "json",
                    callbackParamName: "callback"
                });
                relRequest.then(function (relationshipRequestResponse) {
                    var matchingRelationshipInfo = null;
                    for (var relCount = 0; relCount < relationshipRequestResponse.relationships.length; relCount++) {
                        if (relationshipInfo.id === relationshipRequestResponse.relationships[relCount].id) {
                            matchingRelationshipInfo = relationshipRequestResponse.relationships[relCount];
                            break;
                        }
                    }
                    //me.Relationships[0].RelationshipName = me.Relationships[0].Name;
                    me.Relationships[0].FieldInfo = relationshipRequestResponse.fields;
                    me.Relationships[0].PrimaryKeyField = relationshipInfo.keyField;
                    me.Relationships[0].ForeignKeyField = matchingRelationshipInfo.keyField;
                    me.Relationships[0].RelatedTableId = relationshipInfo.relatedTableId;
                    me.Relationships[0].Id = relationshipInfo.id;

                });
            });
        });
    }


    function _loadSublayers(callback) {
        var _loadCount = 0;
        for (var subLayerCount = 0; subLayerCount < me.SubLayers.length; subLayerCount++) {
            me.SubLayers[subLayerCount].LoadMetadata(_parentUrl, _sublayerLoaded);
        }
        function _sublayerLoaded() {
            _loadCount = _loadCount + 1;
            if (_loadCount == me.SubLayers.length) {
                callback();
            }
        }
    }

    function _loadMetadata(serviceUrl, callback) {
        var _serviceUrl = serviceUrl;
        var _callback = callback;
        var _subLayerLoadedCount = 0;
        require(["esri/request"], function (esriRequest) {

            var requestUrl = _serviceUrl + '/' + me.LayerId;
            if (requestUrl === 'https://maps.sussexcountyde.gov/gis/rest/services/County_Layers/WatershedsLayers/MapServer/1') {
                var ggg = 6;
            }
            var request = new esriRequest({
                url: requestUrl,
                content: { f: "json" },
                handleAs: "json",
                callbackParamName: "callback"
            });
            request.then(function (requestResponse) {
                //closure start here

                me.LayerMetadata = requestResponse;
                if (me.ShowSubLayers === true && me.LayerMetadata.subLayers) {
                    me.SubLayers = [];
                    for (var subLayerCount = 0; subLayerCount < me.LayerMetadata.subLayers.length; subLayerCount++) {
                        var subLayer = new MapLayerNew(me, _parentUrl);
                        subLayer.Name = me.LayerMetadata.subLayers[subLayerCount].name;
                        subLayer.LayerId = me.LayerMetadata.subLayers[subLayerCount].id;
                        subLayer.ShowSubLayers = false;
                        subLayer.Url = _parentUrl + '/' + me.LayerMetadata.subLayers[subLayerCount].id;
                        me.SubLayers.push(subLayer);
                    }
                    me.LoadSublayers(_callback);
                }
                else {
                    _callback();
                }


            });

            //closure end here
        });
    }



    function _setInitialExtent(serviceUrl) {
        require(["esri/request", "esri/tasks/GeometryService", "esri/tasks/ProjectParameters", "esri/geometry/Extent"], function (esriRequest, esriGeometryService, esriProjectParameters, esriExtent) {
            var requestUrl = serviceUrl + '/' + me.LayerId;
            var request = new esriRequest({
                url: requestUrl,
                content: { f: "json" },
                handleAs: "json",
                callbackParamName: "callback"
            });
            request.then(function (requestResponse) {
                var layerExtent = new esriExtent(requestResponse.extent);
                if (layerExtent.spatialReference.wkid !== app.Map.spatialReference.wkid) {
                    var geometryService = new esriGeometryService(app.config.GeometryServiceUrl);
                    var projectParameters = new esriProjectParameters();
                    projectParameters.geometries = [layerExtent];
                    projectParameters.outSR = app.Map.spatialReference;
                    geometryService.project(projectParameters, function (projectGeometry) {
                        app.InitialExtent = projectGeometry[0];
                        app.Map.setExtent(app.InitialExtent);
                    }, function (projectError) {
                        var errorText = "??";
                    });
                }
                else {
                    app.Map.setExtent(layerExtent);
                }
            });
        });
    }
}
function MapServiceNew(obj, count) {
    var me = this;
    this.Url = obj.Url;
    this.Id = count + 1;
    this.LoadOrder = obj.LoadOrder;
    this.Layers = [];
    this.LayerObject = null;
    this.LoadMetadata = _loadMetadata;
    this.LegendInfo = null;
    for (var layerCount = 0; layerCount < obj.Layers.length; layerCount++) {
        this.Layers.push(new MapLayerNew(obj.Layers[layerCount], this.Url));
    }
    this.Load = _load;

    var _layerMetadataLoadedCount = 0;
    function _loadMetadata(metadataLoadedCallback) {
        for (var layerCount = 0; layerCount < me.Layers.length; layerCount++) {
            me.Layers[layerCount].LoadMetadata(me.Url, _metadataLoaded);

        }

        function _metadataLoaded() {
            _layerMetadataLoadedCount = _layerMetadataLoadedCount + 1;
            if (_layerMetadataLoadedCount == me.Layers.length) {
                _loadLegendInfo();
            }
        }

        function _loadLegendInfo() {
            require(["esri/request"], function (esriRequest) {

                var requestUrl = me.Url + '/legend';
                var request = new esriRequest({
                    url: requestUrl,
                    content: { f: "json" },
                    handleAs: "json",
                    callbackParamName: "callback"
                });
                request.then(function (requestResponse) {
                    if (me.Url === 'https://maps.sussexcountyde.gov/gis/rest/services/County_Layers/WatershedsLayers/MapServer') {
                        var ggg = 5;
                    }
                    for (var responseLayerCount = 0; responseLayerCount < requestResponse.layers.length; responseLayerCount++) {
                        var layerId = requestResponse.layers[responseLayerCount].layerId;
                        for (var layerCount = 0; layerCount < me.Layers.length; layerCount++) {
                            if (me.Layers[layerCount].LayerId === requestResponse.layers[responseLayerCount].layerId) {
                                me.Layers[layerCount].LegendInfo = {};
                                if (me.Layers[layerCount].LayerMetadata.drawingInfo.renderer.type === 'simple') {
                                    me.Layers[layerCount].LegendInfo.SimpleRenderer = {};
                                    me.Layers[layerCount].LegendInfo.SimpleRenderer.Symbology = requestResponse.layers[responseLayerCount].legend[0];
                                }
                                else {
                                    me.Layers[layerCount].LegendInfo.UniqueRenderer = {};
                                    if (me.Layers[layerCount].LayerMetadata.drawingInfo.renderer.type === 'classBreaks') {
                                        me.Layers[layerCount].LegendInfo.UniqueRenderer.FieldName = me.Layers[layerCount].LayerMetadata.drawingInfo.renderer.field;
                                    }
                                    else {
                                        me.Layers[layerCount].LegendInfo.UniqueRenderer.FieldName = me.Layers[layerCount].LayerMetadata.drawingInfo.renderer.field1;
                                    }
                                    me.Layers[layerCount].LegendInfo.UniqueRenderer.UniqueValues = [];
                                    for (var legendCount = 0; legendCount < requestResponse.layers[responseLayerCount].legend.length; legendCount++) {
                                        me.Layers[layerCount].LegendInfo.UniqueRenderer.UniqueValues.push({
                                            Label: requestResponse.layers[responseLayerCount].legend[legendCount].label,
                                            Symbology: requestResponse.layers[responseLayerCount].legend[legendCount]
                                        });
                                    }
                                    me.Layers[layerCount].LegendInfo.UniqueRenderer.UniqueValues.sort(function (a, b) {
                                        var textA = a.Label;
                                        var textB = b.Label;
                                        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                                    });
                                }
                                break;
                            }
                            else if (me.Layers[layerCount].SubLayers) {
                                for (var subLayerCount = 0; subLayerCount < me.Layers[layerCount].SubLayers.length; subLayerCount++) {
                                    if (me.Layers[layerCount].SubLayers[subLayerCount].LayerId === requestResponse.layers[responseLayerCount].layerId) {
                                        me.Layers[layerCount].SubLayers[subLayerCount].LegendInfo = {};
                                        if (me.Layers[layerCount].SubLayers[subLayerCount].LayerMetadata.drawingInfo.renderer.type === 'simple') {
                                            me.Layers[layerCount].SubLayers[subLayerCount].LegendInfo.SimpleRenderer = {};
                                            me.Layers[layerCount].SubLayers[subLayerCount].LegendInfo.SimpleRenderer.Symbology = requestResponse.layers[responseLayerCount].legend[0];
                                        }
                                        else {
                                            me.Layers[layerCount].SubLayers[subLayerCount].LegendInfo.UniqueRenderer = {};
                                            if (me.Layers[layerCount].SubLayers[subLayerCount].LayerMetadata.drawingInfo.renderer.type === 'classBreaks') {
                                                me.Layers[layerCount].SubLayers[subLayerCount].LegendInfo.UniqueRenderer.FieldName = me.Layers[layerCount].LayerMetadata.drawingInfo.renderer.field;
                                            }
                                            else {
                                                me.Layers[layerCount].SubLayers[subLayerCount].LegendInfo.UniqueRenderer.FieldName = me.Layers[layerCount].LayerMetadata.drawingInfo.renderer.field1;
                                            }
                                            me.Layers[layerCount].SubLayers[subLayerCount].LegendInfo.UniqueRenderer.UniqueValues = [];
                                            for (var legendCount = 0; legendCount < requestResponse.layers[responseLayerCount].legend.length; legendCount++) {
                                                me.Layers[layerCount].SubLayers[subLayerCount].LegendInfo.UniqueRenderer.UniqueValues.push({
                                                    Label: requestResponse.layers[responseLayerCount].legend[legendCount].label,
                                                    Symbology: requestResponse.layers[responseLayerCount].legend[legendCount]
                                                });
                                            }
                                            me.Layers[layerCount].SubLayers[subLayerCount].LegendInfo.UniqueRenderer.UniqueValues.sort(function (a, b) {
                                                var textA = a.Label;
                                                var textB = b.Label;
                                                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                                            });
                                        }
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    me.LegendInfo = requestResponse;
                    metadataLoadedCallback();
                });
            });
        }
    }
    function _load(serviceLoadedCallback) {
        require(["esri/layers/ArcGISDynamicMapServiceLayer", "esri/layers/ImageParameters", "esri/request", "esri/geometry/Extent", "esri/tasks/GeometryService", "esri/tasks/ProjectParameters", "dojo/promise/all", "dojo/on"],
            function (esriDynamicLayer, esriImageParameters, esriRequest, esriExtent, esriGeometryService, esriProjectParameters, dojoPromiseAll, on) {
                //var additionalRequests = [];
                //var additionalRequestLayers = [];
                var img = new esriImageParameters();
                img.format = 'png32';
                me.LayerObject = new esriDynamicLayer(me.Url, { "imageParameters": img });
                me.LayerObject.on("load", function (evt) {
                    var visibleLayers = [];
                    for (var layerCount = 0; layerCount < me.Layers.length; layerCount++) {
                        if (me.Layers[layerCount].Visible === true) {
                            visibleLayers.push(me.Layers[layerCount].LayerId);
                        }
                        if (me.Layers[layerCount].IsDefaultExtent) me.Layers[layerCount].SetInitialExtent(me.Url);
                        if (me.Layers[layerCount].Relationships) me.Layers[layerCount].PopulateRelationshipMetadata(me.Url);

                    }
                    if (visibleLayers.length === 0) {
                        if (me.LayerObject.layerInfos.length === 1) {
                            me.LayerObject.hide();
                        }
                        else {
                            me.LayerObject.setVisibleLayers([-1]);
                        }
                    }
                    else {
                        me.LayerObject.setVisibleLayers(visibleLayers);
                    }

                    serviceLoadedCallback(evt.layer.url);
                }, function (err) {
                    alert(err);
                });
            });
    }
}

function ServiceCollection(services) {
    var me = this;
    this.Services = [];
    this.LoadServices = _loadServices;
    this.LoadMetadata = _loadMetadata;
    this.PopulateLegendInformation = _populateLegendInformation;
    for (var serviceCount = 0; serviceCount < services.length; serviceCount++) {
        this.Services.push(new MapServiceNew(services[serviceCount], serviceCount))
    }

    function GetLayerOrder(url) {
        for (var serviceCount = 0; serviceCount < me.Services.length; serviceCount++) {

        }

    }


    for (var x = 0; x < this.Services.length; x++) {
        this.Services[x].Id = x + 1;
    }

    function _populateLegendInformation(serviceInfo, layerInfo) {

    }
    function _loadMetadata(metadataLoadedCallback) {
        for (var serviceCount = 0; serviceCount < me.Services.length; serviceCount++) {
            me.Services[serviceCount].LoadMetadata(_metadataLoaded);
        }
        function _metadataLoaded() {
            _loadedServiceMetadataCount = _loadedServiceMetadataCount + 1;
            if (_loadedServiceMetadataCount == me.Services.length) {
                metadataLoadedCallback();
            }
        }
    }

    var _loadedServiceCount = 0;
    var _loadedServiceMetadataCount = 0;



    function _loadServices(servicesLoadedCallback) {
        for (var serviceCount = 0; serviceCount < me.Services.length; serviceCount++) {
            me.Services[serviceCount].Load(_serviceLoaded);
        }
        function _serviceLoaded(url) {
            _loadedServiceCount = _loadedServiceCount + 1;
            //for (var serviceCount = 0; serviceCount < me.Services.length; serviceCount++) {
            //    if (layer.url === me.Services[serviceCount].Url) {
            //        me.Services[serviceCount].LayerObject = layer;
            //        break;
            //    }
            //}
            if (_loadedServiceCount == me.Services.length) {
                servicesLoadedCallback();
            }
        }
    }



}
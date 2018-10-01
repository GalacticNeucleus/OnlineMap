
//var gGeometryServiceUrl = 'https://maps.sussexcountyde.gov/gis/rest/services/Utilities/Geometry/GeometryServer'



var app = {};
app.ParcelSearchConfiguration = null;
app.SearchConfiguration = null;
//ConfigureLayers();

app.idResults = null;
app.BasemapGallery = null;
app.IsFirstBasemap = true;
//app.PrintServiceUrl = 'https://maps.sussexcountyde.gov/gis/rest/services/Geoprocessing/TemplatePrinting/GPServer/Export%20Web%20Map';
app.ResultCount = 0;
app.selPrintTemplate = null;
app.selPrintFormat = null;

app.selPrintTemplateParcel = null;
app.selPrintFormatParcel = null;
//number of results to display at a time (reduce this if you want to remove scrolling)
app.ResultsPerPage = 5;
app.AllResultsStore = null;
app.SearchInProgressSpinner = null;
//zero-based index of the first result currently displayed
app.ResultsDisplayIndex = 0;

//new override for results of subdivision and parcels by subdivision searches
app.DisplayAllResults = false;


function redirect() {
    window.location = 'http://www.sussexcountyde.gov/sussex-county-mapping-applications';
}



require([
    "esri/map",
 //   "esri/layers/ArcGISDynamicMapServiceLayer",
    "esri/layers/GraphicsLayer",
    "esri/graphic",
    "esri/toolbars/draw",
    "esri/toolbars/navigation",
    "esri/dijit/BasemapGallery",
    "esri/dijit/Scalebar",
//    "esri/dijit/OverviewMap",
    "esri/geometry/Extent",
//    "esri/SpatialReference",
    "esri/arcgis/utils",
    "esri/tasks/GeometryService",
//    "esri/tasks/ProjectParameters",
    "esri/tasks/query",
    "esri/tasks/RelationshipQuery",
    "esri/tasks/QueryTask",
//    "esri/geometry/webMercatorUtils",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleFillSymbol",
    "esri/Color",
    "esri/geometry/geometryEngine",
    "esri/geometry/geometryEngineAsync",
    "esri/geometry/Point",
    "esri/tasks/PrintTask",
    "esri/tasks/PrintParameters",
    "esri/tasks/PrintTemplate",
    "esri/tasks/locator",
    "esri/tasks/IdentifyTask",
    "esri/tasks/IdentifyParameters",

// DOJO //

    "esri/request",
    "dgrid/OnDemandGrid",
    "dgrid/tree",
    "dojo/_base/declare",
    "dojo/promise/all",
    "dojo/store/Memory",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/parser",
    "dijit/registry",
//    "dijit/Tooltip",
    "dojo/on",
    "dojo/dom",
    "dijit/layout/ContentPane",
    "dijit/layout/BorderContainer",
    "dijit/layout/TabContainer",
    "dijit/layout/AccordionContainer",
    "dijit/form/ComboBox",
    "dojo/aspect",
//    "dojo/_base/lang",
    "dojo/dom-attr",
//    "dojo/request/xhr",
    "dijit/TitlePane",
    "dijit/form/Button",
    "dijit/Dialog",
    "dojo/domReady!"],
    function (
        esriMap,
 //       esriDynamicLayer,
        esriGraphicsLayer,
        esriGraphic,
        esriDraw,
        esriNavigation,
        esriBasemapGallery,
        esriScalebar,
//        esriOverviewMap,
        esriExtent,
//        esriSpatialReference,
        esriUtils,
        esriGeometryService,
//        esriProjectParameters,
        esriQuery,
        esriRelationshipQuery,
        esriQueryTask,
//        esriWebMercatorUtils,
        esriSimpleMarkerSymbol,
        esriSimpleLineSymbol,
        esriSimpleFillSymbol,
        esriColor,
        esriGeometryEngine,
        esriGeometryEngineAsync,
        esriPoint,
        esriPrintTask,
        esriPrintParameters,
        esriPrintTemplate,
        esriLocator,
        esriIdentifyTask,
        esriIdentifyParameters,
        esriRequest,

// DOJO //

        dojoOnDemandGrid,
        dojoTreeGrid,
        dojoDeclare,
        dojoPromiseAll,
        dojoMemoryStore,
        dojoDomStyle,
        dojoDomConstruct,
        dojoArray,
        parser,
        registry,
//        dijitTooltip,
        on,
        dom,
        dojoContentPane,
        dojoBorderContainer,
        dojoTabContainer,
        dojoAccordionContainer,
       dojoComboBox,
        dojoAspect,
//        dojoLang,
        domAttr
//        dojoXhr
        ) {
        parser.parse();
        esriConfig.defaults.io.corsEnabledServers.push('firstmap.gis.delaware.gov');
        esriConfig.defaults.io.corsEnabledServers.push('firstmap.delaware.gov');





        function loadJSON(callback) {
            var xobj = new XMLHttpRequest();
            xobj.overrideMimeType("application/json");
            xobj.open('GET', 'Scripts/config.json', true); // Replace 'my_data' with the path to your file
            //xobj.open('GET', 'Scripts/sussex_config_011018.json', true); // Replace 'my_data' with the path to your file
            xobj.onreadystatechange = function () {
                if (xobj.readyState == 4 && xobj.status == "200") {
                    // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
                    callback(xobj.responseText);
                }
            };
            xobj.send(null);
        }


        app.selPrintFormat = $("#selPrintFormat");
        app.selPrintTemplate = $("#selPrintTemplate");

        app.selPrintFormatParcel = $("#selPrintParcelFormat");
        app.selPrintTemplateParcel = $("#selPrintParcelTemplate");

        //$("#selPrintParcelTemplate").on("change", function () {
        //    console.log('selPrintParcelTemplate change');
        //    console.log($(this).val());
        //    var id = Number($(this).val());
        //    if (!id) return false;

        //    for (var x = 0; x < app.config.ParcelPrintServices.length; x++) {
        //        if (app.config.ParcelPrintServices[x].Id == id) {
        //            //console.log(app.config.ParcelPrintServices[x]);
        //            $("#selPrintParcelFormat").empty();

        //            for (var y = 0; y < app.config.ParcelPrintServices[x].Formats.length; y++) {
        //                console.log("formats", app.config.ParcelPrintServices[x].Formats) 
        //                if (y === 1) {
        //                    var txt = '<option selected value = "' + app.config.ParcelPrintServices[x].Formats[y] + '">' + app.config.ParcelPrintServices[x].Formats[y] + '</option>';
        //                    $("#selPrintParcelFormat").append(txt);

        //                }
        //                else {
        //                    var txt = '<option value = "' + app.config.ParcelPrintServices[x].Formats[y] + '">' + app.config.ParcelPrintServices[x].Formats[y] + '</option>';
        //                    $("#selPrintParcelFormat").append(txt);
        //                }
        //            }


        //        }
        //        else {
        //            console.log(id + ' <> ' + app.config.ParcelPrintServices[x].Id);

        //        }
        //    }

        //});
        $("#selPrintParcelTemplate").on("change", function () {
            console.log('selPrintParcelTemplate change');
            console.log($(this).val());
            var id = Number($(this).val());
            if (!id) return false;

            for (var x = 0; x < app.config.ParcelPrintServices.length; x++) {
                if (app.config.ParcelPrintServices[x].Id == id) {
                    //console.log(app.config.ParcelPrintServices[x]);
                    $("#selPrintParcelFormat").empty();

                    for (var y = 0; y < app.config.ParcelPrintServices[x].Formats.length; y++) {
                        if (app.config.ParcelPrintServices[x].Formats[y] === 'PDF') {
                            var txt = '<option selected value = "' + app.config.ParcelPrintServices[x].Formats[y] + '">' + app.config.ParcelPrintServices[x].Formats[y] + '</option>';
                            $("#selPrintParcelFormat").append(txt);

                        }
                        else {
                            var txt = '<option value = "' + app.config.ParcelPrintServices[x].Formats[y] + '">' + app.config.ParcelPrintServices[x].Formats[y] + '</option>';
                            $("#selPrintParcelFormat").append(txt);
                        }
                    }
                }
                else {
                    console.log(id + ' <> ' + app.config.ParcelPrintServices[x].Id);

                }
            }
        });


        $("#spanZoomAll").hide();
        registry.byId("btnMoveToStart").setDisabled(true);
        registry.byId("btnMovePreviousPage").setDisabled(true);
        registry.byId("btnMoveNextPage").setDisabled(true);
        registry.byId("btnMoveToEnd").setDisabled(true);
        registry.byId("btnMovePreviousFeature").setDisabled(true);
        registry.byId("btnMoveNextFeature").setDisabled(true);

        $(document).on("click", "#close-results", function () {
            $('#search-results').animate({ width: "toggle" });

            return false;
        });

        $(document).on("click", "#searchResultsBtn", function () {
            showSearchResults();

            return false;
        });

        var showSearchResults = function () {
            if ($('#search-results').is(":visible")===false) {
                $('#search-results').animate({ width: "toggle" });
            }
        }


        //setup spinner used during searches
        var spinnerOptions = {
            lines: 13, // The number of lines to draw
            length: 20, // The length of each line
            width: 10, // The line thickness
            radius: 30, // The radius of the inner circle
            corners: 1, // Corner roundness (0..1)
            rotate: 0, // The rotation offset
            direction: 1, // 1: clockwise, -1: counterclockwise
            color: '#000', // #rgb or #rrggbb or array of colors
            speed: 1, // Rounds per second
            trail: 60, // Afterglow percentage
            shadow: false, // Whether to render a shadow
            hwaccel: false, // Whether to use hardware acceleration
            className: 'spinner', // The CSS class to assign to the spinner
            zIndex: 2e9, // The z-index (defaults to 2000000000)
            top: '50%', // Top position relative to parent
            left: '50%' // Left position relative to parent
        };




        app.Map = new esriMap("mapDiv",
            {
                zoom: 13,
                basemap: "topo",
                sliderStyle: "large"
            });

        var scalebar = new esriScalebar({
            map: app.Map,
            scalebarUnit: "english"
        });


        app.BasemapGallery = new esriBasemapGallery({
            showArcGISBasemaps: true,
            map: app.Map
        }, "basemapGallery");
        app.BasemapGallery.startup();
        app.BasemapGallery.on("error", function (e) {
            alert(e);
        });

        $("#rbPrintParcelsYes").on("change", function () {
            if ($(this).is(":checked")) {
                $(".no-print-parcel-template").hide();
                $(".print-parcel-template").show();
            }
            else {
                $(".no-print-parcel-template").show();
                $(".print-parcel-template").hide();
            }
        });
        $("#rbPrintParcelsNo").on("change", function () {
            if ($(this).is(":checked")) {
                $(".no-print-parcel-template").show();
                $(".print-parcel-template").hide();
            }
            else {
                $(".no-print-parcel-template").hide();
                $(".print-parcel-template").show();
            }
        });
        $("#selResultsLayer").on("change", function () {
            var isParcel = $("#selResultsLayer option:selected").attr('data-parcel-layer') === 'true';

            var resultsId = parseInt($("#selResultsLayer").val());
            if (resultsId) {
                if (isParcel) {
                    $(".print-parcel-options").show();
                    $(".no-print-parcel-template").hide();
                    $(".print-parcel-template").show();
                    $("#rbPrintParcelsYes").prop('checked', true);
                    $("#rbPrintParcelsNo").prop('checked', false);
                }
                else {
                    $(".print-parcel-options").hide();
                    $(".no-print-parcel-template").show();
                    $(".print-parcel-template").hide();
                    $("#rbPrintParcelsYes").prop('checked', false);
                    $("#rbPrintParcelsNo").prop('checked', true);
                }
                var results = app.AllResultsStore.get(resultsId);
                app.LayerResultsStore = new dojoMemoryStore({
                    data: results.features,
                    idProperty: "id"
                });
                if (app.DisplayAllResults === true) {
                    //instead of doing these 5 at a time, we do them all
                    app.ActivePointGraphicsLayer.clear();
                    app.ActivePolygonGraphicsLayer.clear();
                    app.ActiveLineGraphicsLayer.clear();
                    app.SelectedPointGraphicsLayer.clear();
                    app.SelectedPolygonGraphicsLayer.clear();
                    app.SelectedLineGraphicsLayer.clear();
                    for (var resCount = 0; resCount < results.features.length; resCount++) {
                        var currentFeature = results.features[resCount]
                        currentFeature.id = app.ResultCount;
                        if (currentFeature.geometry.type == 'point') {
                            var appFeature = new esriGraphic(currentFeature.geometry, app.BlueSquarePointSymbol, { id: currentFeature.id });
                            app.SelectedPointGraphicsLayer.add(appFeature);
                        }
                        else if (currentFeature.geometry.type == 'polyline') {
                            var appFeature = new esriGraphic(currentFeature.geometry, app.BlueLineSymbol, { id: currentFeature.id });
                            app.SelectedLineGraphicsLayer.add(appFeature);
                        }
                        else {
                            var appFeature = new esriGraphic(currentFeature.geometry, app.BluePolygonSymbol, { id: currentFeature.id });
                            app.SelectedPolygonGraphicsLayer.add(appFeature);
                        }

                        app.ResultCount++;
                    }
                }
            }
            else {
                //no result showing
                $(".print-parcel-options").hide();
                $(".no-print-parcel-template").show();
                $(".print-parcel-template").hide();
            }

            UpdateResultsGrid(0);


        });

        //Widget Toggle
        $(".widget-button").on("click", function () {
            console.log('widget button click');
            app.Map.enableMapNavigation();
            app.MapDraw.deactivate();
            // app.Map.enableKeyboardNavigation();
            var isActive = $(this).hasClass('active');
            $('.widget, #divLayerVisibility').hide();
            console.log('removing active class widget-button clicked');
            $(".widget-button").removeClass('active');

            if (isActive) {
                //deactivating
            }
            else {
                //activating
                $(this).addClass('active');

                if ($(this).attr('id') === 'select-button') {
                    app.Map.disableMapNavigation();
                    app.MapDraw.activate(esriDraw.RECTANGLE);
                }
                else {
                    $("#" + $(this).attr('title')).show();
                    app.Map.disableKeyboardNavigation();
                    app.Map.enableMapNavigation();
                }


            }




            //var widget = '#' + $(this).attr('title');

            //$('.button').removeClass('active');
            //$(this).addClass('active');

            ////Close other widgets
            //$('.widget, #divLayerVisibility').hide();

            ////Toggle Widget (if not already open)
            //if (!$(widget).hasClass('visible')) {
            //    $(widget).show().addClass('visible');
            //} else {
            //    $(widget).hide().removeClass('visible');
            //    $(this).removeClass('active');
            //}
        });

        $(".close-widget").on("click", function () {
            //$('.widget').removeClass('visible').hide();
            $('.widget').hide();
            console.log('removing active class close-widget clicked');
            $('.button').removeClass('active');
        });

        //$(".widget-select-tool").on("click", function () {
        //    $('.button').removeClass('active');
        //    $('.widget, #divLayerVisibility').hide();

        //    if ($(this).attr('data-active') === 'false') {
        //        //activate
        //        $(this).attr('data-active', 'true');
        //        $(this).css('background-color', 'gray');

        //        app.Map.disableMapNavigation();
        //        app.MapDraw.activate(esriDraw.RECTANGLE);
        //        //NavigationToolbarClicked('btnIdentify');
        //    }
        //    else {
        //        //deactivate
        //        $(this).attr('data-active', 'false');
        //        $(this).css('background-color', '#D67E0A');

        //        app.Map.enableMapNavigation();
        //        app.MapDraw.deactivate();
        //        //NavigationToolbarClicked('btnDeactivate');
        //    }
        //});

        app.Map.on("zoom-end", function (zoomArgs) {
            UpdateLegendByScale();
        });



        app.Map.on("load", function (loadArgs) {
            app.Map.disableMapNavigation();
            //*****************************************this is the new way as of 3/2017
            loadJSON(function (response) {
                //note service load order - b/c we group layers from different services, we cannot perfectly configure the loading order
                //optimally, we would nest the service information inside each LegendGroup object, but we can't b/c a group can have layers from different services
                //all layers from one service must be above or below all layers from other services

                app.config = JSON.parse(response);
                console.log('app config');
                console.log(app.config);
                InitializeSymbols();
                LoadPrintOptions();

                $("#selFieldName").empty();
                for (var x = 0; x < app.config.ParcelSearchConfiguration.Options.length; x++) {
                    $("#selFieldName").append('<option value=' + app.config.ParcelSearchConfiguration.Options[x].Id + '>' + app.config.ParcelSearchConfiguration.Options[x].Label + '</option>');
                }

                //comment the following line out to remove the address locator option
                $("#selFieldName").append('<option value=addresslocator>Address Locator</option>');
                $("#selFieldName").append('<option value=addresslayer>Address Layer</option>');
                $("#selFieldName").append('<option value="subdivisions">Subdivisions</option>');
                $("#selFieldName").append('<option value="subdivisionparcels">Parcels by Subdivision</option>');
                $("#selFieldName").append('<option value="taxidnew">Address by Tax Id</option>');



                app.MapServices = new ServiceCollection(app.config.Services);
                app.MapServices.LoadServices(function () {
                    //all 
                    app.MapServices.Services.sort(function (a, b) {
                        return b.LoadOrder - a.LoadOrder;
                    });

                    for (var serviceCount = 0; serviceCount < app.MapServices.Services.length; serviceCount++) {
                        app.Map.addLayer(app.MapServices.Services[serviceCount].LayerObject);
                    }

                    //app.SearchInProgressSpinner.spin(document.getElementById('divLayerVisibility'));
                    app.SearchInProgressSpinner.spin(document.getElementById('mapDiv'));

                    app.MapServices.LoadMetadata(function () {
                        CreateServiceLegendNew();
                        ParseQueryString();
                    });
                    app.SelectedPolygonGraphicsLayer = new esriGraphicsLayer();
                    app.Map.addLayer(app.SelectedPolygonGraphicsLayer);
                    app.SelectedPolygonGraphicsLayer.on("click", function (evt) {
                        console.log("selected polygon");

                        if (app.LayerResultsStore == null) return;

                        //use count because id is always changed due to the widgit id problem
                        var res = app.LayerResultsStore.query(function (x) {
                            return x.id == parseInt(evt.graphic.attributes['id']);
                        });
                        if (res.length == 0) return;

                        var acc = registry.byId("divApplicationDetails");
                        var child = registry.byId("cp_" + res[0].id.toString());
                        acc.selectChild(child, true);
                    });

                    app.SelectedLineGraphicsLayer = new esriGraphicsLayer();
                    app.Map.addLayer(app.SelectedLineGraphicsLayer);
                    app.SelectedLineGraphicsLayer.on("click", function (evt) {
                        console.log("selected line graphics layer");

                        if (app.LayerResultsStore == null) return;
                        var res = app.LayerResultsStore.query(function (x) {
                            return x.id == parseInt(evt.graphic.attributes['id']);
                        });
                        if (res.length == 0) return;

                        var acc = registry.byId("divApplicationDetails");
                        var child = registry.byId("cp_" + res[0].id.toString());
                        acc.selectChild(child, true);
                    });

                    app.SelectedPointGraphicsLayer = new esriGraphicsLayer();
                    app.Map.addLayer(app.SelectedPointGraphicsLayer);
                    app.SelectedPointGraphicsLayer.on("click", function (evt) {
                        console.log("selected point graphics layers");

                        if (app.LayerResultsStore == null) return;
                        var res = app.LayerResultsStore.query(function (x) {
                            return x.id == parseInt(evt.graphic.attributes['id']);
                        });
                        if (res.length == 0) return;

                        var acc = registry.byId("divApplicationDetails");
                        var child = registry.byId("cp_" + res[0].id.toString());
                        acc.selectChild(child, true);
                    });

                    app.ActivePolygonGraphicsLayer = new esriGraphicsLayer();
                    app.Map.addLayer(app.ActivePolygonGraphicsLayer);

                    app.ActiveLineGraphicsLayer = new esriGraphicsLayer();
                    app.Map.addLayer(app.ActiveLineGraphicsLayer);

                    app.ActivePointGraphicsLayer = new esriGraphicsLayer();
                    app.Map.addLayer(app.ActivePointGraphicsLayer);

                });
            });


            function ParseQueryString() {
                var qs = window.location.search;
                //qs = '?ApplicationId=11204';
                if (qs != '') {
                    var splitString = qs.substring(1).split('=');
                    if (splitString[0] = 'ParcelId') {
                        var pid = splitString[1].toUpperCase();
                        $("#txtSearchValue").val(pid);
                        $("#selFieldName").val('taxid');
                        DoSearch();
                    }
                }
                else {
                    dojoDomStyle.set(registry.byId("disclaimer").closeButtonNode, "display", "none");
                    registry.byId('disclaimer').show();
                    registry.byId('disclaimer').resize();
                }
            }

            app.MapDraw = new esriDraw(loadArgs.map, { showTooltips: false });
            app.MapDraw.on("draw-end", function (drawArgs) {
                app.DisplayAllResults = false;
                doIdentifyNew(drawArgs.geometry);
                $(".widget-select-tool").css('background-color', '#D67E0A');
                $(".widget-select-tool").attr('data-active', 'false');
            });
            app.Map.on("click", function (evt) {

                console.log(app.AllResultsStore);
                console.log(app.LayerResultsStore);
                app.DisplayAllResults = false;
                //check to see if the event is associated with a graphic layer click
                if (evt.graphic != null) return;
                app.SelectedPolygonGraphicsLayer.clear();
                app.SelectedPointGraphicsLayer.clear();
                app.SelectedLineGraphicsLayer.clear();
                app.ActivePointGraphicsLayer.clear();
                app.ActivePolygonGraphicsLayer.clear();
                app.ActiveLineGraphicsLayer.clear();
                app.AllResultsStore = null;
                app.LayerResultsStore = null;
                ClearAccordion();
                showSearchResults();
                app.SearchInProgressSpinner.spin(document.getElementById('divApplicationDetails'));
                doIdentifyNew(evt.mapPoint);
                //doIdentify(evt.mapPoint);
            });

            //setup navigation
            app.NavToolbar = new esriNavigation(loadArgs.map);




            //Print
            registry.byId('btnPrintParcel').on("click", function () {
                PrintParcel();
                //Print();
            });
            registry.byId('btnPrintNoParcel').on("click", function () {
                Print();
                //Print();
            });

            //Search Widget
            $('#btnSearch').on("click", function () {
                app.DisplayAllResults = false;
                DoSearch();
            });

            $("#txtSearchValue").on("keypress", function (e) {
                if (e.keyCode === 13 || e.which === 13) {
                    $("#btnSearch").click();
                }
            });


            //Identify Button
            $('#btnIdentify').on("click", function () {
                if ($('#btnIdentify').hasClass('active')) {
                    $('#btnIdentify').removeClass('active').css("background", "none");
                    $('#btnIdentify').parent().css("background", "#D67E0A");
                    NavigationToolbarClicked('btnDeactivate');

                } else {
                    $('#btnIdentify').addClass('active');
                    $('#btnIdentify').css("background", "#777777");
                    $('#btnIdentify').parent().css("background", "#777777");
                    NavigationToolbarClicked('btnIdentify');
                }


                return false;
            });

            $(document).on("click", '#btnClearSelected', function () {
                console.log('clear');
                NavigationToolbarClicked('btnDeactivate');
                $("#selResultsLayer").empty();
                $("#selResultsLayer").attr('disabled', 'disabled');
                ClearAccordion();
                app.SelectedPolygonGraphicsLayer.clear();
                app.SelectedPointGraphicsLayer.clear();
                app.SelectedLineGraphicsLayer.clear();
                app.ActivePointGraphicsLayer.clear();
                app.ActivePolygonGraphicsLayer.clear();
                app.ActiveLineGraphicsLayer.clear();
                app.AllResultsStore = null;
                app.LayerResultsStore = null;
                $("#spanSelectedApplications").html("No Applications Selected");
                $("#spanZoomAll").hide();
            });




            function ClearAccordion() {

                //flag to avoid zooming when removing the accordion items
                app.UpdatingResults = true;
                var acc = registry.byId("divApplicationDetails");
                if (acc.hasChildren()) {
                    var kids = acc.getChildren();
                    for (var childCount = 0; childCount < kids.length; childCount++) {
                        acc.removeChild(kids[childCount]);
                        //dojoDomConstruct.destroy(kids[childCount]);
                    }
                }
                app.UpdatingResults = false;
            }

            $("#spanZoomAll").on("click", function () {
                if (app.LayerResultsStore == null) return;
                var zoomGeom = [];
                for (var cnt = 0; cnt < app.LayerResultsStore.data.length; cnt++) {
                    var geom = app.LayerResultsStore.data[cnt].geometry;
                    zoomGeom.push(geom);
                }
                esriGeometryEngineAsync.union(zoomGeom).then(function (res) {
                    app.Map.setExtent(res.getExtent());
                });
            });


            registry.byId("btnMoveToStart").on("click", function () {
                if (app.LayerResultsStore == null) return;
                UpdateResultsGrid(0);
            });
            registry.byId("btnMovePreviousPage").on("click", function () {
                if (app.LayerResultsStore == null) return;
                UpdateResultsGrid(app.ResultsDisplayIndex - app.ResultsPerPage);
            });
            registry.byId("btnMovePreviousFeature").on("click", function () {
                if (app.LayerResultsStore == null) return;
                NavigateFeature(false)
            });
            registry.byId("btnMoveNextFeature").on("click", function () {
                console.log('test');
                if (app.LayerResultsStore == null) return;
                NavigateFeature(true);
            });
            registry.byId("btnMoveNextPage").on("click", function () {
                if (app.LayerResultsStore == null) return;
                //current from = 0, to = 
                UpdateResultsGrid(app.ResultsDisplayIndex + app.ResultsPerPage);
            });
            registry.byId("btnMoveToEnd").on("click", function () {
                if (app.LayerResultsStore == null) return;
                var rem = app.LayerResultsStore.data.length % app.ResultsPerPage;
                if (rem > 0) {
                    UpdateResultsGrid(app.LayerResultsStore.data.length - rem);
                }
                else {
                    UpdateResultsGrid(app.LayerResultsStore.data.length - app.ResultsPerPage);
                }


            });

            dojoAspect.after(registry.byId("s-bar"), "resize", function () {
                if (app.LayerGrid != null) {
                    app.LayerGrid.resize();
                }
            })


            function DoAddressLayerSearch(addressText) {


                var abbrevDict = [];
                abbrevDict.push({ Code: 'ST', Value: 'STREET' });
                abbrevDict.push({ Code: 'RD', Value: 'ROAD' });
                abbrevDict.push({ Code: 'DR', Value: 'DRIVE' });
                abbrevDict.push({ Code: 'AVE', Value: 'AVENUE' });
                abbrevDict.push({ Code: 'AV', Value: 'AVENUE' });
                abbrevDict.push({ Code: 'BLVD', Value: 'BOULEVARD' });
                abbrevDict.push({ Code: 'HWY', Value: 'HIGHWAY' });
                abbrevDict.push({ Code: 'CT', Value: 'COURT' });
                abbrevDict.push({ Code: 'WY', Value: 'WAY' });
                abbrevDict.push({ Code: 'LN', Value: 'LANE' });
                abbrevDict.push({ Code: 'TR', Value: 'TRAIL' });




                var qt = new esriQueryTask(app.config.AddressLayerSearchConfiguration.Url);
                var q = new esriQuery();


                var updatedSearch = [];
                var splitAry = addressText.toUpperCase().split(' ');
                for (var aryCount = 0; aryCount < splitAry.length; aryCount++) {
                    var currentString = splitAry[aryCount].toUpperCase().trim();

                    //strip out trailing commas, periods
                    if (currentString[currentString.length - 1] == '.' | currentString[currentString.length - 1] == ',') {
                        currentString = currentString.substring(0, currentString.length - 1);
                    }

                    var currentSearchText = "UPPER(" + app.config.AddressLayerSearchConfiguration.SearchFieldName + ") LIKE '%" + currentString + "%'";
                    updatedSearch.push(currentSearchText);
                }
                var newSearch = updatedSearch.join(' AND ');


                q.where = newSearch;


                //q.where = "UPPER(" + app.AddressLayerSearchConfiguration.SearchFieldName + ") LIKE '%" + addressText.toUpperCase() + "%'";
                q.outFields = ["*"];
                q.outSpatialReference = app.Map.spatialReference;
                q.returnGeometry = true;
                qt.execute(q, function (results) {
                    if (results.features.length == 0) {
                        $("#selResultsLayer").empty();
                        app.SearchInProgressSpinner.stop();
                        alert('No Addresses Found');
                        return false;
                    }
                    //now we're going to sort by a numeric field
                    //results.features.sort(function (a, b) {
                    //    var textA = a.attributes[app.config.AddressLayerSearchConfiguration.SearchFieldName];
                    //    var textB = b.attributes[app.config.AddressLayerSearchConfiguration.SearchFieldName];
                    //    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                    //})
                    results.features.sort(function (a, b) {
                        var num1 = Number(a.attributes[app.config.AddressLayerSearchConfiguration.SortFieldName]);
                        var num2 = Number(b.attributes[app.config.AddressLayerSearchConfiguration.SortFieldName]);
                        return num1 - num2;
                    })

                    var addressLayerInfo;
                    for (var serviceCount = 0; serviceCount < app.MapServices.Services.length; serviceCount++) {
                        if (addressLayerInfo) break;
                        if (app.config.AddressLayerSearchConfiguration.Url.indexOf(app.MapServices.Services[serviceCount].Url > -1)) {
                            for (var layerCount = 0; layerCount < app.MapServices.Services[serviceCount].Layers.length; layerCount++) {
                                var layerUrl = app.MapServices.Services[serviceCount].Url + '/' + app.MapServices.Services[serviceCount].Layers[layerCount].LayerId;
                                if (layerUrl == app.config.AddressLayerSearchConfiguration.Url) {
                                    addressLayerInfo = app.MapServices.Services[serviceCount].Layers[layerCount].LayerInfo;
                                    break;
                                }
                            }
                        }
                    }


                    var idResultsAry = [];
                    var idResults = {};
                    idResults.id = 1;

                    var fCount = 1;

                    for (var featureCount = 0; featureCount < results.features.length; featureCount++) {
                        //var displayName = results.features[featureCount].attributes['PrimaryAddress'] + ', ' + results.features[featureCount].attributes['ZN'] + ', ' + results.features[featureCount].attributes['Zip'];;
                        var displayName = results.features[featureCount].attributes['Address'] + ', ' + results.features[featureCount].attributes['ZipCommunity'] + ', ' + results.features[featureCount].attributes['Zip'];;
                        results.features[featureCount].DisplayName = displayName;
                    }
                    for (var featureCount = 0; featureCount < results.features.length; featureCount++) {
                        var currentFeature = results.features[featureCount];
                        results.features[featureCount].id = fCount;
                        results.features[featureCount].count = fCount;
                        if (addressLayerInfo) {
                            var newAtts = [];
                            for (attName in results.features[featureCount].attributes) {
                                if (attName.toUpperCase() != 'OBJECTID' & attName.toUpperCase() != 'SHAPE') {
                                    var alias = GetArrayItemString(addressLayerInfo.fields, "name", attName);
                                    if (alias) {
                                        newAtts[alias.alias] = results.features[featureCount].attributes[attName];
                                    }
                                    else {
                                        newAtts[attName] = results.features[featureCount].attributes[attName];
                                    }
                                }
                            }
                            results.features[featureCount].setAttributes(newAtts);
                        }

                        fCount++;
                    }
                    idResults.features = results.features;
                    $("#selResultsLayer").empty();
                    $("#selResultsLayer").removeAttr('disabled');
                    var txt = '<option  data-parcel-layer="false" value="1">Addresses (' + results.features.length + ')</option>';
                    $("#selResultsLayer").append(txt);
                    $('#selResultsLayer').prop("selectedIndex", 0);
                    idResultsAry.push(idResults);
                    app.AllResultsStore = new dojoMemoryStore({
                        data: idResultsAry,
                        idProperty: "id"
                    });

                    app.SearchInProgressSpinner.stop();
                    $('#selResultsLayer').change();
                //    showSearchResults();

                });
            }
            function DoAddressLocatorSearch(addressText) {

                var locator = new esriLocator(app.config.AddressLocatorSearchConfiguration.LocatorUrl);

                var address = {};
                address[app.config.AddressLocatorSearchConfiguration.SingleLineFieldName] = addressText;
                var options = {
                    address: address,
                    outFields: ['*']
                };
                locator.addressToLocations(options,
                    function (addressResults) {
                        var idResultsAry = [];
                        var idResults = {};
                        idResults.features = [];
                        idResults.id = 1;
                        var fCount = 1;

                        addressResults.sort(function (a, b) {
                            return b.score - a.score;
                        });

                        if (addressResults.length == 0) {
                            app.SearchInProgressSpinner.stop();
                            alert('No Matching Addresses Found');
                            return false;
                        }
                        else {
                            var addressPoints = [];
                            for (var addCount = 0; addCount < addressResults.length; addCount++) {
                                var addressPoint = new esriGraphic();

                                addressPoint.setAttributes(addressResults[addCount].attributes);
                                addressPoint.attributes['score'] = addressResults[addCount].score;
                                addressPoint.attributes['address'] = addressResults[addCount].address;
                                addressPoint.setGeometry(addressResults[addCount].location);
                                addressPoints.push(addressPoint);
                            }
                            AddressSearchComplete(addressPoints);
                        }
                    }
                );


                function AddressSearchComplete(resultFeatures) {
                    var idResultsAry = [];
                    var idResults = {};
                    idResults.id = 1;

                    var fCount = 1;

                    for (var featureCount = 0; featureCount < resultFeatures.length; featureCount++) {
                        resultFeatures[featureCount].DisplayName = resultFeatures[featureCount].attributes['address'] +
                            ' (' + resultFeatures[featureCount].attributes['score'] + '%)';
                    }
                    for (var featureCount = 0; featureCount < resultFeatures.length; featureCount++) {
                        var currentFeature = resultFeatures[featureCount];
                        resultFeatures[featureCount].id = fCount;
                        resultFeatures[featureCount].count = fCount;
                        fCount++;
                    }
                    idResults.features = resultFeatures;
                    $("#selResultsLayer").empty();
                    $("#selResultsLayer").removeAttr('disabled');
                    var txt = '<option  data-parcel-layer="false" value="1">Addresses (' + resultFeatures.length + ')</option>';
                    $("#selResultsLayer").append(txt);
                    $('#selResultsLayer').prop("selectedIndex", 0);
                    idResultsAry.push(idResults);
                    app.AllResultsStore = new dojoMemoryStore({
                        data: idResultsAry,
                        idProperty: "id"
                    });

                    app.SearchInProgressSpinner.stop();
                    $('#selResultsLayer').change();
                //    showSearchResults();
                }

            }
            function DoNewTaxIdSearch(nameText) {
                var qt = new esriQueryTask(app.config.AddressPointsSearchConfiguration.Url);
                var q = new esriQuery();

                var splitAry = nameText.toUpperCase().split('-');
                var query = '';
                if (splitAry.length >= 1) {
                    query += app.config.AddressPointsSearchConfiguration.SearchFields[0] + " LIKE '" + splitAry[0].trim() + "%'";
                }
                if (splitAry.length >= 2) {
                    query += " AND " + app.config.AddressPointsSearchConfiguration.SearchFields[1] + " LIKE '" + splitAry[1].trim() + "%'";
                }
                if (splitAry.length >= 3) {
                    query += " AND " + app.config.AddressPointsSearchConfiguration.SearchFields[2] + " LIKE '" + splitAry[2].trim() + "%'";
                }
                if (splitAry.length >= 4) {
                    query += " AND " + app.config.AddressPointsSearchConfiguration.SearchFields[3] + " LIKE '" + splitAry[3].trim() + "%'";
                }
                q.where = query;
                q.outFields = ["*"];
                q.outSpatialReference = app.Map.spatialReference;
                q.returnGeometry = true;
                qt.execute(q, function (results) {
                    if (results.features.length == 0) {
                        $("#selResultsLayer").empty();
                        app.SearchInProgressSpinner.stop();
                        alert('No Tax Parcels Found');
                        return false;
                    }

                    for (var x = 0; x < results.features.length; x++) {

                    }

                    //results.features.sort(function (a, b) {
                    //    var textA = a.attributes[app.config.SubdivisionSearchConfiguration.SearchFieldName];
                    //    var textB = b.attributes[app.config.SubdivisionSearchConfiguration.SearchFieldName];
                    //    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                    //})

                    //var subdivisionLayerInfo;
                    //for (var serviceCount = 0; serviceCount < app.MapServices.Services.length; serviceCount++) {
                    //    if (subdivisionLayerInfo) break;
                    //    if (app.config.SubdivisionSearchConfiguration.Url.indexOf(app.MapServices.Services[serviceCount].Url > -1)) {
                    //        for (var layerCount = 0; layerCount < app.MapServices.Services[serviceCount].Layers.length; layerCount++) {
                    //            var layerUrl = app.MapServices.Services[serviceCount].Url + '/' + app.MapServices.Services[serviceCount].Layers[layerCount].LayerId;
                    //            if (layerUrl == app.config.SubdivisionSearchConfiguration.Url) {
                    //                subdivisionLayerInfo = app.MapServices.Services[serviceCount].Layers[layerCount].LayerInfo;
                    //                break;
                    //            }
                    //        }
                    //    }
                    //}


                    var idResultsAry = [];
                    var idResults = {};
                    idResults.id = 1;

                    var fCount = 1;
                    for (var featureCount = 0; featureCount < results.features.length; featureCount++) {
                        //var displayName = results.features[featureCount].attributes['PrimaryAddress'] + ', ' + results.features[featureCount].attributes['ZN'] + ', ' + results.features[featureCount].attributes['Zip'];;
                        results.features[featureCount].DisplayName = results.features[featureCount].attributes[app.config.SubdivisionSearchConfiguration.SearchFieldName];
                    }

                    for (var featureCount = 0; featureCount < results.features.length; featureCount++) {
                        var currentFeature = results.features[featureCount];
                        results.features[featureCount].id = fCount;
                        results.features[featureCount].count = fCount;

                        var ary = [];
                        for (var y = 0; y < app.config.AddressPointsSearchConfiguration.DisplayFields.length; y++) {
                            if (currentFeature.attributes[app.config.AddressPointsSearchConfiguration.DisplayFields[y]] != null) {
                                ary.push(currentFeature.attributes[app.config.AddressPointsSearchConfiguration.DisplayFields[y]]);
                            }
                        }
                        currentFeature.DisplayName = ary.join('-');
                        //console.log(currentFeature.DisplayName);
                        fCount++;
                    }
                    idResults.features = results.features;
                    $("#selResultsLayer").empty();
                    $("#selResultsLayer").removeAttr('disabled');
                    var txt = '<option  data-parcel-layer="false" value="1">Address Points (' + results.features.length + ')</option>';
                    $("#selResultsLayer").append(txt);
                    $('#selResultsLayer').prop("selectedIndex", 0);
                    idResultsAry.push(idResults);
                    app.AllResultsStore = new dojoMemoryStore({
                        data: idResultsAry,
                        idProperty: "id"
                    });

                    app.SearchInProgressSpinner.stop();
                    $('#selResultsLayer').change();
//                    showSearchResults();
                });
            }
            function DoSubdivisionParcelSearch(nameText) {

                var qt = new esriQueryTask(app.config.SubdivisionSearchConfiguration.Url);
                var q = new esriQuery();

                var searchQuery = "UPPER(" + app.config.SubdivisionSearchConfiguration.SearchFieldName + ") LIKE '%" + nameText.toUpperCase() + "%'";
                q.where = searchQuery;
                q.outFields = ["*"];
                q.outSpatialReference = app.Map.spatialReference;
                q.returnGeometry = true;
                qt.execute(q, function (results) {
                    if (results.features.length === 0) {
                        alert('No Subdivisions Found');
                        return false;
                    }
                    app.DisplayAllResults = true;
                    if (results.features.length > 1) {
                        var geoms = [];
                        for (var x = 0; x < results.features.length; x++) {
                            geoms.push(results.features[x].geometry);
                        }
                        var gs = new esriGeometryService(app.config.GeometryServiceUrl);
                        gs.union(geoms, function (unionResult) {
                            SearchParcelsByGeometry(unionResult);
                        }, function (error) {
                            alert(error);
                        });
                    }
                    else {
                        SearchParcelsByGeometry(results.features[0].geometry);

                    }




                });


                function parcelGeometrySearchComplete(resultFeatures, displayName) {
                    var idResultsAry = [];
                    var idResults = {};
                    idResults.id = 1;

                    var fCount = 1;

                    for (var featureCount = 0; featureCount < resultFeatures.length; featureCount++) {
                        if (!displayName) resultFeatures[featureCount].DisplayName = resultFeatures[featureCount].attributes['PIN'];
                        else {
                            resultFeatures[featureCount].DisplayName = resultFeatures[featureCount].attributes[displayName];
                        }
                    }
                    resultFeatures.sort(function (a, b) {
                        var textA = a.DisplayName;
                        var textB = b.DisplayName;
                        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                    });
                    for (var featureCount = 0; featureCount < resultFeatures.length; featureCount++) {
                        var currentFeature = resultFeatures[featureCount];
                        //resultFeatures.setAttributes(formatAttributes(currentFeature.attributes, idResults[resultCount].LayerInfo, idResults[resultCount].Fields));
                        resultFeatures[featureCount].id = fCount;
                        resultFeatures[featureCount].count = fCount;
                        fCount++;
                    }



                    idResults.features = resultFeatures;
                    if (resultFeatures.length == 1) {
                        app.Map.setExtent(resultFeatures[0].geometry.getExtent());
                    }
                    $("#selResultsLayer").empty();
                    $("#selResultsLayer").removeAttr('disabled');
                    var txt = '<option data-parcel-layer="true" value="1">Parcels (' + resultFeatures.length + ')</option>';
                    $("#selResultsLayer").append(txt);
                    $('#selResultsLayer').prop("selectedIndex", 0);
                    idResultsAry.push(idResults);
                    app.AllResultsStore = new dojoMemoryStore({
                        data: idResultsAry,
                        idProperty: "id"
                    });

                    app.SearchInProgressSpinner.stop();
                    $('#selResultsLayer').change();
//                    showSearchResults();

                }
                function SearchParcelsByGeometry(geometry) {

                    //change search text logiv
                    var qt = new esriQueryTask(app.config.ParcelSearchConfiguration.ParcelLayerUrl);
                    var q = new esriQuery();
                    q.geometry = geometry;
                    q.outFields = app.config.ParcelSearchConfiguration.LayerFields;
                    if (q.outFields.indexOf('OBJECTID') == -1) {
                        q.outFields.push('OBJECTID');
                    }
                    q.outSpatialReference = app.Map.spatialReference;
                    q.returnGeometry = true;
                    qt.execute(q, function (results) {
                        if (results.features.length == 0) {
                            app.SearchInProgressSpinner.stop();
                            alert('No Parcels Found');
                            return false;
                        }

                        var oids = [];
                        for (var x = 0; x < results.features.length; x++) {
                            oids.push(parseInt(results.features[x].attributes.OBJECTID))
                        }
                        var rq = new esriRelationshipQuery();
                        rq.outFields = ['*'];
                        rq.objectIds = oids;
                        rq.relationshipId = app.config.ParcelSearchConfiguration.RelationshipId;

                        //find the field/alias info og thr 

                        qt.executeRelationshipQuery(rq, function (relResults) {
                            (function (relResults, results) {
                                //results are the parcel features
                                var foundMultiple = false;
                                var finalResults = [];
                                for (var resCount = 0; resCount < results.features.length; resCount++) {
                                    var oid = parseInt(results.features[resCount].attributes['OBJECTID']);
                                    if (relResults[oid]) {
                                        for (relCount = 0; relCount < relResults[oid].features.length; relCount++) {
                                            //each related feature
                                            //add table attributes to each parcel feature
                                            if (relCount == 0) {
                                                var newAtts = {};
                                                for (var fieldCount = 0; fieldCount < app.config.ParcelSearchConfiguration.TableFields.length; fieldCount++) {
                                                    var currentField = app.config.ParcelSearchConfiguration.TableFields[fieldCount];
                                                    var aliasItem = GetArrayItem(app.config.ParcelSearchConfiguration.RelatedTableInfo, 'name', currentField);
                                                    if (aliasItem) {
                                                        newAtts[aliasItem.alias] = relResults[oid].features[relCount].attributes[currentField]
                                                    }
                                                    else {
                                                        newAtts[currentField] = relResults[oid].features[relCount].attributes[currentField]
                                                    }
                                                }
                                                relResults[oid].features[relCount].setAttributes(newAtts);
                                                relResults[oid].features[relCount].setGeometry(results.features[resCount].geometry);
                                                finalResults.push(relResults[oid].features[relCount]);
                                            }
                                            else {

                                                //create a new feature and assign it the related table attributes and parcel geometry
                                                var attObj = {};
                                                var ownerPoly = new esriGraphic(results.features[resCount].geometry, null, attObj);
                                                for (var fieldCount = 0; fieldCount < app.config.ParcelSearchConfiguration.TableFields.length; fieldCount++) {
                                                    var currentField = app.config.ParcelSearchConfiguration.TableFields[fieldCount];
                                                    var aliasItem = GetArrayItem(app.config.ParcelSearchConfiguration.RelatedTableInfo, 'name', currentField);
                                                    if (aliasItem) {
                                                        ownerPoly.attributes[aliasItem.alias] = relResults[oid].features[relCount].attributes[currentField]
                                                    }
                                                    else {
                                                        ownerPoly.attributes[currentField] = relResults[oid].features[relCount].attributes[currentField]
                                                    }
                                                }
                                                finalResults.push(ownerPoly);
                                                foundMultiple = true;
                                            }
                                        }
                                    }
                                }
                                //135-15.13-60.00
                                var dispField = 'PINWASSEMENTUNIT';
                                var aliasItem = GetArrayItem(app.config.ParcelSearchConfiguration.RelatedTableInfo, 'name', dispField);
                                if (aliasItem) {
                                    dispField = aliasItem.alias;
                                }
                                parcelGeometrySearchComplete(finalResults, dispField);

                            })(relResults, results);
                        }, function (relError) {
                            var sadbear = 5;
                        });

                    }, function (err) {
                        var sadbear = err;
                    });
                }
            }
            function DoSubdivisionSearch(nameText) {

                var qt = new esriQueryTask(app.config.SubdivisionSearchConfiguration.Url);
                var q = new esriQuery();

                var searchQuery = "UPPER(" + app.config.SubdivisionSearchConfiguration.SearchFieldName + ") LIKE '%" + nameText.toUpperCase() + "%'";
                q.where = searchQuery;
                q.outFields = ["*"];
                q.outSpatialReference = app.Map.spatialReference;
                q.returnGeometry = true;
                qt.execute(q, function (results) {
                    if (results.features.length == 0) {
                        $("#selResultsLayer").empty();
                        app.SearchInProgressSpinner.stop();
                        alert('No Addresses Found');
                        return false;
                    }
                    results.features.sort(function (a, b) {
                        var textA = a.attributes[app.config.SubdivisionSearchConfiguration.SearchFieldName];
                        var textB = b.attributes[app.config.SubdivisionSearchConfiguration.SearchFieldName];
                        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                    })

                    var subdivisionLayerInfo;
                    for (var serviceCount = 0; serviceCount < app.MapServices.Services.length; serviceCount++) {
                        if (subdivisionLayerInfo) break;
                        if (app.config.SubdivisionSearchConfiguration.Url.indexOf(app.MapServices.Services[serviceCount].Url > -1)) {
                            for (var layerCount = 0; layerCount < app.MapServices.Services[serviceCount].Layers.length; layerCount++) {
                                var layerUrl = app.MapServices.Services[serviceCount].Url + '/' + app.MapServices.Services[serviceCount].Layers[layerCount].LayerId;
                                if (layerUrl == app.config.SubdivisionSearchConfiguration.Url) {
                                    subdivisionLayerInfo = app.MapServices.Services[serviceCount].Layers[layerCount].LayerInfo;
                                    break;
                                }
                            }
                        }
                    }


                    var idResultsAry = [];
                    var idResults = {};
                    idResults.id = 1;

                    var fCount = 1;
                    for (var featureCount = 0; featureCount < results.features.length; featureCount++) {
                        //var displayName = results.features[featureCount].attributes['PrimaryAddress'] + ', ' + results.features[featureCount].attributes['ZN'] + ', ' + results.features[featureCount].attributes['Zip'];;
                        results.features[featureCount].DisplayName = results.features[featureCount].attributes[app.config.SubdivisionSearchConfiguration.SearchFieldName];
                    }

                    for (var featureCount = 0; featureCount < results.features.length; featureCount++) {
                        var currentFeature = results.features[featureCount];
                        results.features[featureCount].id = fCount;
                        results.features[featureCount].count = fCount;
                        if (subdivisionLayerInfo) {
                            var newAtts = [];
                            for (attName in results.features[featureCount].attributes) {
                                if (attName.toUpperCase() != 'OBJECTID' & attName.toUpperCase() != 'SHAPE') {
                                    var alias = GetArrayItemString(subdivisionLayerInfo.fields, "name", attName);
                                    if (alias) {
                                        newAtts[alias.alias] = results.features[featureCount].attributes[attName];
                                    }
                                    else {
                                        newAtts[attName] = results.features[featureCount].attributes[attName];
                                    }
                                }
                            }
                            results.features[featureCount].setAttributes(newAtts);
                        }

                        fCount++;
                    }
                    idResults.features = results.features;
                    $("#selResultsLayer").empty();
                    $("#selResultsLayer").removeAttr('disabled');
                    var txt = '<option data-parcel-layer="false" value="1">Subdivisions (' + results.features.length + ')</option>';
                    $("#selResultsLayer").append(txt);
                    $('#selResultsLayer').prop("selectedIndex", 0);
                    idResultsAry.push(idResults);
                    app.AllResultsStore = new dojoMemoryStore({
                        data: idResultsAry,
                        idProperty: "id"
                    });

                    app.SearchInProgressSpinner.stop();

                    app.DisplayAllResults = true;
                    $('#selResultsLayer').change();
                  //  showSearchResults();
                });
            }
            function DoSearch() {
            //    console.log('do search');
                showSearchResults();
                var searchVal = $("#txtSearchValue").val();
                var fieldName = $("#selFieldName").val();
                if (searchVal != null && fieldName != null) {


                    app.MapDraw.deactivate();
                    $("#select-button").removeClass('active');
                    app.Map.enableMapNavigation();
                    app.AllResultsStore = null;
                    app.LayerResultsStore = null;
                    app.SelectedPolygonGraphicsLayer.clear();
                    app.SelectedPointGraphicsLayer.clear();
                    app.SelectedLineGraphicsLayer.clear();
                    app.ActivePointGraphicsLayer.clear();
                    app.ActivePolygonGraphicsLayer.clear();
                    app.ActiveLineGraphicsLayer.clear();
                    var acc = registry.byId("divApplicationDetails");
                    app.UpdatingResults = true;
                    if (acc.hasChildren()) {
                        var kids = acc.getChildren();
                        for (var childCount = 0; childCount < kids.length; childCount++) {
                            acc.removeChild(kids[childCount]);
                            //dojoDomConstruct.destroy(kids[childCount]);
                        }
                    }
                    app.UpdatingResults = false;

                    app.SearchInProgressSpinner.spin(document.getElementById('divApplicationDetails'));

                    if (fieldName == 'addresslocator') {
                        DoAddressLocatorSearch(searchVal);
                        return;
                    }
                    else if (fieldName == 'addresslayer') {
                        DoAddressLayerSearch(searchVal);
                        return;
                    }
                    else if (fieldName == 'subdivisions') {
                        DoSubdivisionSearch(searchVal);
                        return;
                    }
                    else if (fieldName == 'subdivisionparcels') {
                        var _searchVal = searchVal;
                        if (app.config.ParcelSearchConfiguration.RelatedTableInfo == null) {
                            var aliasRequest = new esriRequest(
                                {
                                    url: app.config.ParcelSearchConfiguration.RelatedTableUrl,
                                    content: { f: "json" },
                                    handleAs: "json",
                                    callbackParamName: "callback"
                                });

                            aliasRequest.then(function (resp) {

                                app.config.ParcelSearchConfiguration.RelatedTableInfo = resp.fields;
                                console.log('app.config.ParcelSearchConfiguration.RelatedTableInfo');
                                console.log(app.config.ParcelSearchConfiguration.RelatedTableInfo);
                                DoSubdivisionParcelSearch(_searchVal);
                            });
                        } else {
                            DoSubdivisionParcelSearch(_searchVal);
                        }
                    }
                    else if (fieldName == 'taxidnew') {
                        DoNewTaxIdSearch(searchVal);
                    }
                    else {
                        if (app.config.ParcelSearchConfiguration.RelatedTableInfo == null) {
                            var aliasRequest = new esriRequest(
                                {
                                    url: app.config.ParcelSearchConfiguration.RelatedTableUrl,
                                    content: { f: "json" },
                                    handleAs: "json",
                                    callbackParamName: "callback"
                                });

                            aliasRequest.then(function (resp) {

                                app.config.ParcelSearchConfiguration.RelatedTableInfo = resp.fields;
                                console.log('app.config.ParcelSearchConfiguration.RelatedTableInfo');
                                console.log(app.config.ParcelSearchConfiguration.RelatedTableInfo);
                                StartSearch();
                            });
                        } else {
                            StartSearch();
                        }
                    }




                    function StartSearch() {
                        var fieldName = $("#selFieldName").val();
                        var searchOptions = GetArrayItem(app.config.ParcelSearchConfiguration.Options, 'Id', fieldName);
                        if (searchOptions.SearchType == 'layer') {
                            console.log('searchlayerfirst');
                            SearchLayerFirst(searchOptions, searchVal);
                        }
                        else {
                            console.log('searchtablefirst');
                            //start with table, link back to features
                            SearchTableFirst(searchOptions, searchVal);
                        }
                    }


                    function SearchLayerFirst(searchOptions, searchText, aliases) {
                        var qt = new esriQueryTask(app.config.ParcelSearchConfiguration.ParcelLayerUrl);
                        var q = new esriQuery();
                        q.where = "UPPER(" + searchOptions.FieldName + ") LIKE '%" + searchVal.toUpperCase() + "%'";
                        q.outFields = app.config.ParcelSearchConfiguration.LayerFields;
                        if (q.outFields.indexOf('OBJECTID') == -1) {
                            q.outFields.push('OBJECTID');
                        }
                        q.outSpatialReference = app.Map.spatialReference;
                        q.returnGeometry = true;
                        qt.execute(q, function (results) {
                            if (results.features.length == 0) {
                                app.SearchInProgressSpinner.stop();
                                alert('No Parcels Found');
                                return false;
                            }

                            var oids = [];
                            for (var x = 0; x < results.features.length; x++) {
                                oids.push(parseInt(results.features[x].attributes.OBJECTID))
                            }
                            var rq = new esriRelationshipQuery();
                            rq.outFields = ['*'];
                            rq.objectIds = oids;
                            rq.relationshipId = app.config.ParcelSearchConfiguration.RelationshipId;

                            //find the field/alias info og thr 

                            qt.executeRelationshipQuery(rq, function (relResults) {
                                (function (relResults, results) {
                                    //results are the parcel features
                                    var foundMultiple = false;
                                    var finalResults = [];
                                    for (var resCount = 0; resCount < results.features.length; resCount++) {
                                        var oid = parseInt(results.features[resCount].attributes['OBJECTID']);
                                        if (relResults[oid]) {
                                            for (relCount = 0; relCount < relResults[oid].features.length; relCount++) {
                                                //each related feature
                                                //add table attributes to each parcel feature
                                                if (relCount == 0) {
                                                    var newAtts = {};
                                                    for (var fieldCount = 0; fieldCount < app.config.ParcelSearchConfiguration.TableFields.length; fieldCount++) {
                                                        var currentField = app.config.ParcelSearchConfiguration.TableFields[fieldCount];
                                                        var aliasItem = GetArrayItem(app.config.ParcelSearchConfiguration.RelatedTableInfo, 'name', currentField);
                                                        if (aliasItem) {
                                                            newAtts[aliasItem.alias] = relResults[oid].features[relCount].attributes[currentField]
                                                        }
                                                        else {
                                                            newAtts[currentField] = relResults[oid].features[relCount].attributes[currentField]
                                                        }
                                                    }
                                                    relResults[oid].features[relCount].setAttributes(newAtts);
                                                    relResults[oid].features[relCount].setGeometry(results.features[resCount].geometry);
                                                    finalResults.push(relResults[oid].features[relCount]);
                                                }
                                                else {

                                                    //create a new feature and assign it the related table attributes and parcel geometry
                                                    var attObj = {};
                                                    var ownerPoly = new esriGraphic(results.features[resCount].geometry, null, attObj);
                                                    for (var fieldCount = 0; fieldCount < app.config.ParcelSearchConfiguration.TableFields.length; fieldCount++) {
                                                        var currentField = app.config.ParcelSearchConfiguration.TableFields[fieldCount];
                                                        var aliasItem = GetArrayItem(app.config.ParcelSearchConfiguration.RelatedTableInfo, 'name', currentField);
                                                        if (aliasItem) {
                                                            ownerPoly.attributes[aliasItem.alias] = relResults[oid].features[relCount].attributes[currentField]
                                                        }
                                                        else {
                                                            ownerPoly.attributes[currentField] = relResults[oid].features[relCount].attributes[currentField]
                                                        }
                                                    }
                                                    finalResults.push(ownerPoly);
                                                    foundMultiple = true;
                                                }
                                            }
                                        }
                                    }
                                    //135-15.13-60.00
                                    var dispField = 'PINWASSEMENTUNIT';
                                    var aliasItem = GetArrayItem(app.config.ParcelSearchConfiguration.RelatedTableInfo, 'name', dispField);
                                    if (aliasItem) {
                                        dispField = aliasItem.alias;
                                    }
                                    parcelSearchComplete(finalResults, dispField);

                                })(relResults, results);
                            }, function (relError) {
                                var sadbear = 5;
                            });

                        }, function (err) {
                            var sadbear = err;
                        });
                    }
                    function SearchTableFirst(searchOptions, searchText, aliases) {

                        var updatedSearch = [];
                        var splitAry = searchText.split(' ');
                        for (var aryCount = 0; aryCount < splitAry.length; aryCount++) {
                            var currentSearchText = "UPPER(" + searchOptions.FieldName + ") LIKE '%" + splitAry[aryCount].toUpperCase() + "%'";
                            updatedSearch.push(currentSearchText);
                        }
                        var newSearch = updatedSearch.join(' AND ');


                        var qt = new esriQueryTask(app.config.ParcelSearchConfiguration.RelatedTableUrl);
                        var q = new esriQuery();
                        //q.where = "UPPER(" + searchOptions.FieldName + ") LIKE '%" + searchVal.toUpperCase() + "%'";
                        q.where = newSearch;
                        q.outFields = ['*'];
                        qt.execute(q, function (results) {
                            console.log('first results');
                            console.log(results);
                            if (results.features.length == 0) {
                                app.SearchInProgressSpinner.stop();
                                alert('No Parcels Found');
                                return false;
                            }
                            var oids = [];
                            for (var x = 0; x < results.features.length; x++) {
                                oids.push(parseInt(results.features[x].attributes.OBJECTID))
                            }

                            var rq = new esriRelationshipQuery();
                            rq.outFields = app.config.ParcelSearchConfiguration.LayerFields;
                            rq.objectIds = oids;
                            rq.returnGeometry = true;
                            rq.outSpatialReference = app.Map.spatialReference;
                            rq.relationshipId = app.config.ParcelSearchConfiguration.RelationshipId;
                            qt.executeRelationshipQuery(rq, function (relResults) {
                                console.log('relResults');
                                console.log(relResults);
                                (function (relResults, results) {

                                    var foundMultiple = false;
                                    var finalResults = [];
                                    //loop through the original table results first
                                    for (var resCount = 0; resCount < results.features.length; resCount++) {
                                        var oid = parseInt(results.features[resCount].attributes['OBJECTID']);
                                        if (relResults[oid]) {
                                            //relresults[oid] holds the parcel geometry

                                            for (relCount = 0; relCount < relResults[oid].features.length; relCount++) {

                                                var newAtts = {};
                                                for (var fieldCount = 0; fieldCount < app.config.ParcelSearchConfiguration.TableFields.length; fieldCount++) {
                                                    var currentField = app.config.ParcelSearchConfiguration.TableFields[fieldCount];
                                                    var aliasItem = GetArrayItem(app.config.ParcelSearchConfiguration.RelatedTableInfo, 'name', currentField);
                                                    if (aliasItem) {
                                                        newAtts[aliasItem.alias] = results.features[resCount].attributes[currentField]
                                                    }
                                                    else {
                                                        newAtts[currentField] = results.features[resCount].attributes[currentField]
                                                    }
                                                }

                                                relResults[oid].features[relCount].setAttributes(newAtts);
                                                finalResults.push(relResults[oid].features[relCount]);
                                            }
                                        }
                                    }
                                    //here we're querying the owner table first, so we should always show assessment unti
                                    var dispField = 'PINWASSEMENTUNIT';
                                    var aliasItem = GetArrayItem(app.config.ParcelSearchConfiguration.RelatedTableInfo, 'name', dispField);
                                    if (aliasItem) {
                                        dispField = aliasItem.alias;
                                    }
                                    parcelSearchComplete(finalResults, dispField);



                                })(relResults, results);
                            }, function (relError) {
                                alert(relError.message);
                            });
                        }, function (err) {
                            alert(err.message);
                        });
                    }


                }

                function parcelSearchComplete(resultFeatures, displayName) {
                //    console.log('parcelsearchcomplete');
                //    console.log(resultFeatures);
                    var idResultsAry = [];
                    var idResults = {};
                    idResults.id = 1;

                    var fCount = 1;

                    for (var featureCount = 0; featureCount < resultFeatures.length; featureCount++) {
                        if (!displayName) resultFeatures[featureCount].DisplayName = resultFeatures[featureCount].attributes['PIN'];
                        else {
                            resultFeatures[featureCount].DisplayName = resultFeatures[featureCount].attributes[displayName];
                        }
                    }
                    resultFeatures.sort(function (a, b) {
                        var textA = a.DisplayName;
                        var textB = b.DisplayName;
                        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                    });
                    for (var featureCount = 0; featureCount < resultFeatures.length; featureCount++) {
                        var currentFeature = resultFeatures[featureCount];
                        //resultFeatures.setAttributes(formatAttributes(currentFeature.attributes, idResults[resultCount].LayerInfo, idResults[resultCount].Fields));
                        resultFeatures[featureCount].id = fCount;
                        resultFeatures[featureCount].count = fCount;
                        fCount++;
                    }



                    idResults.features = resultFeatures;
                    if (resultFeatures.length == 1) {
                        app.Map.setExtent(resultFeatures[0].geometry.getExtent());
                    }
                    $("#selResultsLayer").empty();
                    $("#selResultsLayer").removeAttr('disabled');
                    var txt = '<option data-parcel-layer="true" value="1">Parcels (' + resultFeatures.length + ')</option>';
                    $("#selResultsLayer").append(txt);
                    $('#selResultsLayer').prop("selectedIndex", 0);
                    idResultsAry.push(idResults);
                    app.AllResultsStore = new dojoMemoryStore({
                        data: idResultsAry,
                        idProperty: "id"
                    });

                    app.SearchInProgressSpinner.stop();
                    $('#selResultsLayer').change();
//                    showSearchResults();
                }
            }

        });


        function GetArrayIndex(aryToSearch, propName, val) {
            for (var x = 0; x < aryToSearch.length; x++) {
                if (aryToSearch[x][propName] == val) {
                    return x;
                }
            }
            return -1;
        }
        function GetArrayItem(aryToSearch, propName, val) {
            for (var x = 0; x < aryToSearch.length; x++) {
                if (aryToSearch[x][propName] == val) {
                    return aryToSearch[x];
                }
            }
            return null;
        }
        function GetArrayItemString(aryToSearch, propName, val) {
            for (var x = 0; x < aryToSearch.length; x++) {
                if (aryToSearch[x][propName].toUpperCase() == val.toUpperCase()) {
                    return aryToSearch[x];
                }
            }
            return null;
        }
        function formatAttributes(inAtts, layerInfo, fieldsToDisplay, displayField) {
            var outAtts = {};

            if (fieldsToDisplay) {
                //order by fields
                var foundValidAttribute = false;
                for (var fieldCount = 0; fieldCount < fieldsToDisplay.length; fieldCount++) {
                    var currentFieldName = fieldsToDisplay[fieldCount];
                    if (inAtts[currentFieldName]) {
                        //fieldsToDisplay[fieldCount] = 
                        outAtts[currentFieldName] = inAtts[currentFieldName];
                        foundValidAttribute = true;
                    }
                }
                if (foundValidAttribute === false) {
                    for (attName in inAtts) {
                        if (attName.toUpperCase() != 'OBJECTID' && attName.toUpperCase() != 'SHAPE' && attName.toUpperCase().indexOf('SHAPE.') === -1) {
                            outAtts[attName] = inAtts[attName];
                        }

                    }
                }

            }
            else {
                for (attName in inAtts) {
                    if (attName.toUpperCase() != 'OBJECTID' & attName.toUpperCase() != 'SHAPE' && attName.toUpperCase().indexOf('SHAPE.') === -1) {
                        outAtts[attName] = inAtts[attName];
                    }

                }
            }


            //add a displayname attribute
            if (!displayField) {
                var alias = GetArrayItemString(layerInfo.fields, "name", layerInfo.displayField);
                if (alias) {
                    if (inAtts[alias.name]) {
                        outAtts.AppDisplayName = inAtts[alias.name];
                    }
                    else {
                        //display field may be in caps and atrribute name may not be, or vise versa
                        for (var attName in inAtts) {
                            if (attName.toUpperCase() === alias.name.toUpperCase()) {
                                outAtts.AppDisplayName = inAtts[attName];
                                break;
                            }
                        }
                    }
                }
                else {
                    //may need to reverse search and look for the alias

                    //for some reason, the 911 Address layerInfo.displayName field returns "NAME", even though that field doesnt exist
                    if (inAtts['Primary Address']) {
                        outAtts.AppDisplayName = inAtts['Primary Address'];
                    }
                }
            }
            else {
                if (inAtts[displayField]) {
                    outAtts.AppDisplayName = inAtts[displayField];
                }
                else {
                    var alias = GetArrayItemString(layerInfo.fields, "name", layerInfo.displayField);
                    if (alias) {
                        if (inAtts[alias.name]) {
                            outAtts.AppDisplayName = inAtts[alias.name];
                        }
                        else {
                            //display field may be in caps and atrribute name may not be, or vise versa
                            for (var attName in inAtts) {
                                if (attName.toUpperCase() === alias.name.toUpperCase()) {
                                    outAtts.AppDisplayName = inAtts[attName];
                                    break;
                                }
                            }
                        }
                    }
                }
            }


            return outAtts;
            //layerInfo tells us about field names, types, aliases, etc.
            //fieldsToDisplay is the list of fields the configuation file says to show
        }

        function doIdentifyNew(geom) {

            app.MapDraw.deactivate();
            $("#select-button").removeClass('active');
            app.Map.enableMapNavigation();
            app.AllResultsStore = null;
            app.SelectedPolygonGraphicsLayer.clear();
            app.SelectedPointGraphicsLayer.clear();
            app.SelectedLineGraphicsLayer.clear();
            app.ActivePointGraphicsLayer.clear();
            app.ActivePolygonGraphicsLayer.clear();
            app.ActiveLineGraphicsLayer.clear();

            //ClearAccordion();

            app.UpdatingResults = true;
            var acc = registry.byId("divApplicationDetails");
            if (acc.hasChildren()) {
                var kids = acc.getChildren();
                for (var childCount = 0; childCount < kids.length; childCount++) {
                    acc.removeChild(kids[childCount]);
                    //dojoDomConstruct.destroy(kids[childCount]);
                }
            }
            app.UpdatingResults = false;
            showSearchResults();
            app.SearchInProgressSpinner.spin(document.getElementById('divApplicationDetails'));

            var layersToSearch = []; //url, layerIds[]
            $("#divLayerVisibility :checked[data-itemtype='identify']").each(function () {

                if ($(this).is(':enabled')) {
                    //checkbox will be disabled if we're outside the visible extent
                    var serviceId = parseInt($(this).attr('data-serviceid'));
                    var mapLayerId;
                    if ($(this).attr('data-maplayerid')) {
                        mapLayerId = parseInt($(this).attr('data-maplayerid'));
                    }
                    for (var serviceCount = 0; serviceCount < app.MapServices.Services.length; serviceCount++) {
                        if (app.MapServices.Services[serviceCount].Id == serviceId) {

                            var currentService = app.MapServices.Services[serviceCount].LayerObject;


                            //check if we've added this map server to the list yet
                            var currentIndex = -1;
                            for (var searchCount = 0; searchCount < layersToSearch.length; searchCount++) {
                                if (layersToSearch[searchCount].layerUrl == currentService.url) {
                                    currentIndex = searchCount;
                                    break;
                                }
                            }
                            if (currentIndex == -1) {
                                var searchInfo = {};
                                searchInfo.layerUrl = currentService.url;
                                searchInfo.layerIds = [];
                                searchInfo.layerNames = [];
                                currentIndex = layersToSearch.push(searchInfo) - 1;
                            }
                            var layerName = 'Missing';
                            for (var liCount = 0; liCount < app.MapServices.Services[serviceCount].Layers.length; liCount++) {
                                if (app.MapServices.Services[serviceCount].Layers[liCount].LayerId == mapLayerId) {
                                    layerName = app.MapServices.Services[serviceCount].Layers[liCount].Name;
                                    break;
                                }
                            }
                            var sublayers = [];
                            $("#divLayerVisibility :checkbox[data-itemtype='layer'][data-serviceid='" + serviceId + "'][data-maplayerid='" + mapLayerId + "'][data-sublayerid!='-1']").each(function () {
                                sublayers.push(Number($(this).attr('data-sublayerid')));
                            });
                            if (sublayers.length === 0) {
                                layersToSearch[currentIndex].layerIds.push(mapLayerId);
                            }
                            else {
                                layersToSearch[currentIndex].layerIds = sublayers;
                                layersToSearch[currentIndex].hasSubLayers = true;
                            }
                            //here we need to look for layer checkboxes wehere serviceid, maplayerid and sublayerid <> -1

                            layersToSearch[currentIndex].layerNames.push(layerName);
                            break;
                        }
                    }
                }

            });

            var idTasks = [];
            for (var searchCount = 0; searchCount < layersToSearch.length; searchCount++) {
                var idTask = new esriIdentifyTask(layersToSearch[searchCount].layerUrl);
                var idParams = new esriIdentifyParameters();
                idParams.geometry = geom;
                idParams.layerIds = layersToSearch[searchCount].layerIds;
                idParams.mapExtent = app.Map.extent;
                idParams.layerOption = esriIdentifyParameters.LAYER_OPTION_ALL;
                idParams.tolerance = 1;
                idParams.returnGeometry = true;
                idTasks.push(idTask.execute(idParams));
            }
            var _layersToSearch = layersToSearch;
            //var _idResponses = idResponses;
            promises = dojoPromiseAll(idTasks);
            promises.then(function (idResponses) {
                (function (layersToSearch, idResponses) {
                    var idResults = [];
                    $("#selResultsLayer").empty();
                    var resultsCount = 0;
                    //var layerRequests = [];
                    for (var responseCount = 0; responseCount < idResponses.length; responseCount++) {
                        var serviceResponse = idResponses[responseCount];
                        var currentUrl = layersToSearch[responseCount].layerUrl;
                        for (var featureCount = 0; featureCount < serviceResponse.length; featureCount++) {
                            //if this result has sublayers, we need featurelayerurl to be the url of the parent layer listed in the config
                            var featureLayerUrl = layersToSearch[responseCount].layerUrl + '/' + serviceResponse[featureCount].layerId;


                            var layerName;
                            for (var nameCount = 0; nameCount < layersToSearch[responseCount].layerIds.length; nameCount++) {
                                if (layersToSearch[responseCount].layerIds[nameCount] == serviceResponse[featureCount].layerId) {
                                    if (layersToSearch[responseCount].hasSubLayers) {
                                        layerName = layersToSearch[responseCount].layerNames[0];
                                    }
                                    else {
                                        layerName = layersToSearch[responseCount].layerNames[nameCount];
                                    }

                                    break;
                                }
                            }

                            var serviceIndex = GetArrayIndex(app.MapServices.Services, 'Url', currentUrl);
                            var layerIndex = -1;
                            var layerInfo = null;
                            var fields = null;
                            var relationships = null;
                            var existingResultsIndex = -1;

                            if (layersToSearch[responseCount].hasSubLayers) {
                                //what if they use a single service that has multiple group layers?  hypothetical...
                                //find the parent layer based on sub layer?
                                var parentLayerIndex = -1;
                                for (var layerCount = 0; layerCount < app.MapServices.Services[serviceIndex].Layers.length; layerCount++) {
                                    if (parentLayerIndex !== -1) break;
                                    if (app.MapServices.Services[serviceIndex].Layers[layerCount].SubLayers && app.MapServices.Services[serviceIndex].Layers[layerCount].SubLayers.length > 0) {
                                        for (var subLayerCount = 0; subLayerCount < app.MapServices.Services[serviceIndex].Layers[layerCount].SubLayers.length; subLayerCount++) {
                                            if (app.MapServices.Services[serviceIndex].Layers[layerCount].SubLayers[subLayerCount].LayerId === serviceResponse[featureCount].layerId) {
                                                featureLayerUrl = layersToSearch[responseCount].layerUrl + '/' + app.MapServices.Services[serviceIndex].Layers[layerCount].LayerId;
                                                parentLayerIndex = layerCount;
                                                break;
                                            }
                                        }
                                    }
                                }
                                for (var existingResultsCount = 0; existingResultsCount < idResults.length; existingResultsCount++) {
                                    if (idResults[existingResultsCount].serviceUrl == featureLayerUrl) {
                                        existingResultsIndex = existingResultsCount;
                                        break;
                                    }
                                }
                                layerIndex = GetArrayIndex(app.MapServices.Services[serviceIndex].Layers[parentLayerIndex].SubLayers, 'LayerId', serviceResponse[featureCount].layerId);
                                layerInfo = app.MapServices.Services[serviceIndex].Layers[parentLayerIndex].SubLayers[layerIndex].LayerMetadata;
                                fields = layerInfo.fields;
                                if (existingResultsIndex == -1) {
                                    //one of these per parent layer - so we need a sub layer array
                                    var res = {};
                                    res.serviceUrl = featureLayerUrl;
                                    res.layerUrl = featureLayerUrl;
                                    res.layerName = layerName;
                                    res.subLayers = [];

                                    var subRes = {};
                                    //or should fields come from the parent layer from config?
                                    subRes.Fields = fields;
                                    subRes.layerId = serviceResponse[featureCount].layerId;
                                    subRes.LayerInfo = layerInfo;
                                    subRes.layerUrl = layersToSearch[responseCount].layerUrl + '/' + serviceResponse[featureCount].layerId;
                                    subRes.relationships = relationships;
                                    subRes.features = [];
                                    subRes.features.push(serviceResponse[featureCount].feature);
                                    if (layerName && layerName != 'Missing') {
                                        subRes.layerName = layerName;
                                    }
                                    else {
                                        subRes.layerName = serviceResponse[featureCount].layerName;
                                    }
                                    res.subLayers.push(subRes);
                                    existingResultsIndex = idResults.push(res) - 1;
                                }
                                else {


                                    var subLayerResultsIndex = GetArrayIndex(idResults[existingResultsIndex].subLayers, 'layerId', serviceResponse[featureCount].layerId);
                                    if (subLayerResultsIndex === -1) {
                                        var subRes = {};
                                        subRes.Fields = fields;
                                        subRes.layerId = serviceResponse[featureCount].layerId;
                                        subRes.LayerInfo = layerInfo;
                                        subRes.layerUrl = layersToSearch[responseCount].layerUrl + '/' + serviceResponse[featureCount].layerId;
                                        subRes.relationships = relationships;
                                        subRes.features = [];
                                        subRes.features.push(serviceResponse[featureCount].feature);
                                        if (layerName && layerName != 'Missing') {
                                            subRes.layerName = layerName;
                                        }
                                        else {
                                            subRes.layerName = serviceResponse[featureCount].layerName;
                                        }
                                        idResults[existingResultsIndex].subLayers.push(subRes);
                                    }
                                    else {
                                        idResults[existingResultsIndex].subLayers[subLayerResultsIndex].features.push(serviceResponse[featureCount].feature);
                                    }



                                }
                            }
                            else {
                                layerIndex = GetArrayIndex(app.MapServices.Services[serviceIndex].Layers, 'LayerId', serviceResponse[featureCount].layerId);
                                layerInfo = app.MapServices.Services[serviceIndex].Layers[layerIndex].LayerMetadata;
                                fields = app.MapServices.Services[serviceIndex].Layers[layerIndex].Fields;
                                relationships = app.MapServices.Services[serviceIndex].Layers[layerIndex].Relationships;
                                for (var existingResultsCount = 0; existingResultsCount < idResults.length; existingResultsCount++) {
                                    if (idResults[existingResultsCount].layerUrl == featureLayerUrl) {
                                        existingResultsIndex = existingResultsCount;
                                        break;
                                    }
                                }
                                //see if we have a results group for this unique layer url yet
                                if (existingResultsIndex == -1) {
                                    var res = {};
                                    res.Fields = fields;
                                    res.serviceUrl = currentUrl
                                    res.LayerInfo = layerInfo;
                                    res.layerUrl = featureLayerUrl;
                                    res.relationships = relationships;
                                    res.features = [];
                                    if (layerName && layerName != 'Missing') {
                                        res.layerName = layerName;
                                    }
                                    else {
                                        res.layerName = serviceResponse[featureCount].layerName;
                                    }

                                    existingResultsIndex = idResults.push(res) - 1;
                                }

                                idResults[existingResultsIndex].features.push(serviceResponse[featureCount].feature);
                            }

                        }
                    }

                    //loop through results and see if any of them (parcels) need a secondary related query?
                    //if no, callback immediately
                    //if yes, do query then callback after updating attributes
                    var subqueryNeeded = false;
                    for (var resCount = 0; resCount < idResults.length; resCount++) {
                        if (idResults[resCount].relationships) {
                            subqueryNeeded = true;
                            break;
                        }
                    }

                    if (!subqueryNeeded) {
                        //related query not needed
                        idResultsReady(idResults);
                    }
                    else {
                        //make an array of queries (even though one will be needed - this allows up to be flexible if they add more later)
                        var subqueries = [];
                        var queryInfo = [];
                        for (var resCount = 0; resCount < idResults.length; resCount++) {
                            if (idResults[resCount].relationships) {
                                for (var relCount = 0; relCount < idResults[resCount].relationships.length; relCount++) {
                                    var oids = [];
                                    for (var fCount = 0; fCount < idResults[resCount].features.length; fCount++) {
                                        oids.push(parseInt(idResults[resCount].features[fCount].attributes['OBJECTID']));
                                    }
                                    var pk = idResults[resCount].relationships[relCount].PrimaryKeyField;
                                    var fk = idResults[resCount].relationships[relCount].ForeignKeyField;
                                    var fld = GetArrayItem(idResults[resCount].LayerInfo.fields, 'name', pk);
                                    var aliasName = fld.alias;
                                    var subquerytask = new esriQueryTask(idResults[resCount].layerUrl);
                                    var subquery = new esriRelationshipQuery();
                                    subquery.outFields = ["*"];
                                    subquery.objectIds = oids;
                                    subquery.relationshipId = idResults[resCount].relationships[relCount].Id;
                                    subqueries.push(subquerytask.executeRelationshipQuery(subquery));
                                    queryInfo.push(
                                        {
                                            fields: idResults[resCount].relationships[relCount].Fields,
                                            aliasInfo: idResults[resCount].relationships[relCount].FieldInfo,
                                            primaryKey: aliasName,
                                            foreignKey: fk,
                                            url: idResults[resCount].layerUrl,
                                            name: idResults[resCount].relationships[relCount].RelationshipName
                                        });
                                }
                            }
                        }

                        promises = dojoPromiseAll(subqueries);
                        promises.then(function (relResponses) {
                            (function (relResponses, queryInfo, idResults) {
                                //match up the results with the related table info
                                //loop through each results layer in case multiple have relationship
                                for (var resCount = 0; resCount < idResults.length; resCount++) {
                                    var duplicateOwnerFeatures = [];
                                    //because each response doesnt have an id/url associated with it, look through the queryInfo array - the order will be the same as the results
                                    for (var infoCount = 0; infoCount < queryInfo.length; infoCount++) {
                                        //if the layer url matches the url used in the query at this index, we can use it
                                        if (idResults[resCount].layerUrl == queryInfo[infoCount].url) {
                                            //loop through each feature in the results layer
                                            for (fCount = 0; fCount < idResults[resCount].features.length; fCount++) {
                                                //grab the oid
                                                var oid = parseInt(idResults[resCount].features[fCount].attributes['OBJECTID']);
                                                //check to see if the relationship query has an entry for this oid
                                                if (relResponses[infoCount][oid]) {
                                                    //assume that there is a 1-1 relationship
                                                    if (relResponses[infoCount][oid].features.length == 1) {
                                                        //loop through each attribute

                                                        if (queryInfo[infoCount].fields) {
                                                            //fields defined
                                                            var newAtts = {};
                                                            for (var fieldCount = 0; fieldCount < queryInfo[infoCount].fields.length; fieldCount++) {
                                                                var currentField = queryInfo[infoCount].fields[fieldCount];
                                                                if (relResponses[infoCount][oid].features[0].attributes[currentField]) {
                                                                    var aliasItem = GetArrayItem(queryInfo[infoCount].aliasInfo, 'name', currentField);
                                                                    if (aliasItem) {
                                                                        newAtts[aliasItem.alias] = relResponses[infoCount][oid].features[0].attributes[currentField];
                                                                    }
                                                                    else {
                                                                        newAtts[currentField] = relResponses[infoCount][oid].features[0].attributes[currentField];
                                                                    }
                                                                }
                                                            }
                                                            idResults[resCount].features[fCount].setAttributes(newAtts);
                                                        }
                                                        else {
                                                            //fields not definedfor (attName in relResponses[infoCount][oid].features[0].attributes) {
                                                            for (attName in relResponses[infoCount][oid].features[0].attributes) {
                                                                var aliasItem = GetArrayItem(queryInfo[infoCount].aliasInfo, 'name', attName);
                                                                if (aliasItem) {
                                                                    idResults[resCount].features[fCount].attributes[aliasItem.alias] = relResponses[infoCount][oid].features[0].attributes[attName];
                                                                }
                                                                else {
                                                                    idResults[resCount].features[fCount].attributes[attName] = relResponses[infoCount][oid].features[0].attributes[attName];
                                                                }
                                                            }
                                                        }
                                                    }
                                                    else if (relResponses[infoCount][oid].features.length > 1) {
                                                        //multiple records associated with the featutre 


                                                        //update the first feature
                                                        if (queryInfo[infoCount].fields) {
                                                            //fields defined
                                                            var newAtts = {};
                                                            for (var fieldCount = 0; fieldCount < queryInfo[infoCount].fields.length; fieldCount++) {
                                                                var currentField = queryInfo[infoCount].fields[fieldCount];
                                                                if (relResponses[infoCount][oid].features[0].attributes[currentField]) {
                                                                    var aliasItem = GetArrayItem(queryInfo[infoCount].aliasInfo, 'name', currentField);
                                                                    if (aliasItem) {
                                                                        newAtts[aliasItem.alias] = relResponses[infoCount][oid].features[0].attributes[currentField];
                                                                    }
                                                                    else {
                                                                        newAtts[currentField] = relResponses[infoCount][oid].features[0].attributes[currentField];
                                                                    }
                                                                }
                                                            }
                                                            idResults[resCount].features[fCount].setAttributes(newAtts);
                                                        }
                                                        else {
                                                            //fields not definedfor (attName in relResponses[infoCount][oid].features[0].attributes) {
                                                            for (attName in relResponses[infoCount][oid].features[0].attributes) {
                                                                var aliasItem = GetArrayItem(queryInfo[infoCount].aliasInfo, 'name', attName);
                                                                if (aliasItem) {
                                                                    idResults[resCount].features[fCount].attributes[aliasItem.alias] = relResponses[infoCount][oid].features[0].attributes[attName];
                                                                }
                                                                else {
                                                                    idResults[resCount].features[fCount].attributes[attName] = relResponses[infoCount][oid].features[0].attributes[attName];
                                                                }
                                                            }
                                                        }

                                                        //in this case, we need to create a new feature for each record after the first
                                                        for (var recordCount = 1; recordCount < relResponses[infoCount][oid].features.length; recordCount++) {
                                                            var ownerFeature = new esriGraphic(idResults[resCount].features[fCount].geometry);
                                                            var attObj = {};
                                                            //for (var attName in idResults[resCount].features[fCount].attributes) {
                                                            //    attObj[attName] = idResults[resCount].features[fCount].attributes[attName];
                                                            //}
                                                            ownerFeature.setAttributes(attObj);

                                                            if (queryInfo[infoCount].fields) {
                                                                for (var fieldCount = 0; fieldCount < queryInfo[infoCount].fields.length; fieldCount++) {
                                                                    var currentField = queryInfo[infoCount].fields[fieldCount];
                                                                    if (relResponses[infoCount][oid].features[recordCount].attributes[currentField]) {
                                                                        var aliasItem = GetArrayItem(queryInfo[infoCount].aliasInfo, 'name', currentField);
                                                                        if (aliasItem) {
                                                                            ownerFeature.attributes[aliasItem.alias] = relResponses[infoCount][oid].features[recordCount].attributes[currentField];
                                                                        }
                                                                        else {
                                                                            ownerFeature.attributes[currentField] = relResponses[infoCount][oid].features[recordCount].attributes[currentField];
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                            else {
                                                                for (attName in relResponses[infoCount][oid].features[recordCount].attributes) {
                                                                    //if the attribute is in the list of fields we want to display, add it to the attributes of the result feature
                                                                    var aliasItem = GetArrayItem(queryInfo[infoCount].aliasInfo, 'name', attName);
                                                                    if (aliasItem) {
                                                                        ownerFeature.attributes[aliasItem.alias] = relResponses[infoCount][oid].features[recordCount].attributes[attName];
                                                                    }
                                                                    else {
                                                                        ownerFeature.attributes[attName] = relResponses[infoCount][oid].features[recordCount].attributes[attName];
                                                                    }

                                                                }
                                                            }



                                                            duplicateOwnerFeatures.push(ownerFeature);
                                                        }

                                                        var eiff = 44;
                                                    }
                                                }
                                                else {
                                                    //no relationship for the specified OID
                                                    var p = 5;
                                                }
                                            }
                                            for (var y = 0; y < duplicateOwnerFeatures.length; y++) {
                                                idResults[resCount].features.push(duplicateOwnerFeatures[y]);

                                            }
                                            //if (duplicateOwnerFeatures.length > 0) {
                                            var dispName = 'PINWASSEMENTUNIT';
                                            var aliasItem = GetArrayItem(queryInfo[infoCount].aliasInfo, 'name', dispName);
                                            if (aliasItem) {
                                                dispName = aliasItem.alias;
                                            }
                                            idResults[resCount].DisplayField = dispName;
                                            //}


                                            //add new features now?
                                        }
                                    }
                                }
                                idResultsReady(idResults);
                            })(relResponses, queryInfo, idResults);
                        });
                    }




                    //MakeLayerRequests(legendResponse, uniqueLayerUrls);
                })(layersToSearch, idResponses);
            });


            function idResultsReady(idResults) {
            //    console.log("id results");
            //    console.log(idResults);
                for (var resCount = 0; resCount < idResults.length; resCount++) {
                    var orderItem = GetArrayItem(app.LayerOrder, 'url', idResults[resCount].layerUrl);
                    idResults[resCount].order = orderItem.order;
                }

                idResults.sort(function (a, b) {
                    return a.order - b.order;
                });

                //idResults.sort(function (a, b) {
                //    var textA = a.layerName;
                //    var textB = b.layerName;
                //    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                //});
                var idCount = 1;
                for (var resultCount = 0; resultCount < idResults.length; resultCount++) {
                    idResults[resultCount].id = idCount;

                    //sort these by the proper display name
                    if (!idResults[resultCount].subLayers) {
                        for (var featureCount = 0; featureCount < idResults[resultCount].features.length; featureCount++) {
                            var currentFeature = idResults[resultCount].features[featureCount];
                            idResults[resultCount].features[featureCount].setAttributes(
                                formatAttributes(currentFeature.attributes,
                                    idResults[resultCount].LayerInfo,
                                    idResults[resultCount].Fields,
                                    idResults[resultCount].DisplayField)
                            );
                            idResults[resultCount].features[featureCount].DisplayName = idResults[resultCount].features[featureCount].attributes['AppDisplayName'];
                        }

                    }
                    else {
                        //flatten these out
                        idResults[resultCount].features = [];
                        for (var subLayerCount = 0; subLayerCount < idResults[resultCount].subLayers.length; subLayerCount++) {
                            for (var fCount = 0; fCount < idResults[resultCount].subLayers[subLayerCount].features.length; fCount++) {
                                var currentFeature = idResults[resultCount].subLayers[subLayerCount].features[fCount];
                                currentFeature.setAttributes(
                                    formatAttributes(currentFeature.attributes, idResults[resultCount].subLayers[subLayerCount].LayerInfo, idResults[resultCount].Fields, idResults[resultCount].DisplayField)
                                );
                                currentFeature.DisplayName = currentFeature.attributes['AppDisplayName'];
                                idResults[resultCount].features.push(currentFeature);
                            }
                        }
                    }

                    idResults[resultCount].features.sort(function (a, b) {
                        var textA = a.DisplayName;
                        var textB = b.DisplayName;
                        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                    });

                    var fCount = 1;
                    for (var featureCount = 0; featureCount < idResults[resultCount].features.length; featureCount++) {
                        idResults[resultCount].features[featureCount].id = fCount;
                        idResults[resultCount].features[featureCount].count = fCount;
                        fCount++;
                    }
                    idCount++;
                }
                NavigationToolbarClicked('btnDeactivate');

                $("#selResultsLayer").removeAttr('disabled');
                $.each(idResults, function (a, b) {
                    var txt = null;
                    if (b.layerUrl === app.config.ParcelSearchConfiguration.ParcelLayerUrl) {
                        txt = '<option data-parcel-layer="true" value="' + b.id + '">' + b.layerName + ' (' + b.features.length + ')</option>';
                    }
                    else {
                        txt = '<option  data-parcel-layer="false" value="' + b.id + '">' + b.layerName + ' (' + b.features.length + ')</option>';
                    }

                    $("#selResultsLayer").append(txt);

                });
                $('#selResultsLayer').prop("selectedIndex", 0);

                app.AllResultsStore = new dojoMemoryStore({
                    data: idResults,
                    idProperty: "id"
                });

                app.SearchInProgressSpinner.stop();
                $('#selResultsLayer').change();
    //            showSearchResults();
            }

            showSearchResults();
        }

        function GetCustomTextAttributes(feature) {
            var customTextElements = [];
            for (var attName in feature.attributes) {
                var fieldInfo = GetArrayItem(app.config.ParcelSearchConfiguration.RelatedTableInfo, 'alias', attName);
                if (!fieldInfo) continue;
                var printInfo = GetArrayItem(app.config.ParcelSearchConfiguration.PrintElements, 'FieldName', fieldInfo.name);
                if (!printInfo) continue;

                var item = {};
                if (!feature.attributes[attName] || feature.attributes[attName] === null || feature.attributes[attName] === '') item[printInfo.PrintElement] = 'N/A';
                else item[printInfo.PrintElement] = feature.attributes[attName];
                customTextElements.push(item);

            }
            return customTextElements;
        }

        //function GetCustomTextAttributes(feature) {
        //    var customTextElements = [];
        //    //app.config.ParcelSearchConfiguration.RelatedTableInfo
        //    for (var attName in feature.attributes) {
        //        //attname is actually the alias
        //        //app.ParcelSearchConfiguration.ResultT
        //        if (!feature.attributes[attName]) continue;
        //        var fieldInfo = GetArrayItem(app.config.ParcelSearchConfiguration.RelatedTableInfo, 'alias', attName);
        //        if (!fieldInfo) continue;
        //        var printInfo = GetArrayItem(app.config.ParcelSearchConfiguration.PrintElements, 'FieldName', fieldInfo.name);
        //        if (!printInfo) continue;

        //        var item = {};
        //        if (feature.attributes[attName] === null || feature.attributes[attName] === '') continue;
        //        item[printInfo.PrintElement] = feature.attributes[attName];
        //        customTextElements.push(item);

        //    }

        //    return customTextElements;


        //}

        function PrintParcel() {

            var isParcel = $("#selResultsLayer option:selected").attr('data-parcel-layer') === 'true' && registry.byId('divApplicationDetails').selectedChildWidget != null;
            if (!isParcel) {
                alert('A parcel result must be selected');
                return false;
            }

            var divId = registry.byId('divApplicationDetails').selectedChildWidget.id;
            var storeId = parseInt(divId.substring(3))
            var currentFeatures = app.LayerResultsStore.query(function (x) {
                return x.id == storeId;
            });
            var currentFeature = currentFeatures[0];
            console.log(currentFeature);


            //need template
            //need format
            var format = $("#selPrintParcelFormat").val();
            //var template = $("#selPrintParcelTemplate").val();
            //now this is an ID
            var template = Number($("#selPrintParcelTemplate").val());
            console.log('using print service id ' + template);
            if (format == null || format.toString() == '') {
                alert('Select a Print Format!');
                return false;
            }
            if (template == null || template == undefined || template.toString() == '') {
                alert('Select a Print Template!');
                return false;
            }

            //***NEW 1-10-18
            for (var cnt = app.SelectedLineGraphicsLayer.graphics.length - 1; cnt >= 0; cnt--) {
                var g = app.SelectedLineGraphicsLayer.graphics[cnt];
                g.attributes['layer-source'] = 'selected-line';
                app.SelectedLineGraphicsLayer.remove(g);
                app.Map.graphics.add(g);
            }
            for (var cnt = app.SelectedPointGraphicsLayer.graphics.length - 1; cnt >= 0; cnt--) {
                var g = app.SelectedPointGraphicsLayer.graphics[cnt];
                g.attributes['layer-source'] = 'selected-point';
                app.SelectedPointGraphicsLayer.remove(g);
                app.Map.graphics.add(g);
            }
            for (var cnt = app.SelectedPolygonGraphicsLayer.graphics.length - 1; cnt >= 0; cnt--) {
                var g = app.SelectedPolygonGraphicsLayer.graphics[cnt];
                g.attributes['layer-source'] = 'selected-polygon';
                app.SelectedPolygonGraphicsLayer.remove(g);
                app.Map.graphics.add(g);
            }
            for (var cnt = app.ActiveLineGraphicsLayer.graphics.length - 1; cnt >= 0; cnt--) {

                var g = app.ActiveLineGraphicsLayer.graphics[cnt];
                g.attributes['layer-source'] = 'active-line';
                app.ActiveLineGraphicsLayer.remove(g);
                app.Map.graphics.add(g);
            }
            for (var cnt = app.ActivePointGraphicsLayer.graphics.length - 1; cnt >= 0; cnt--) {
                var g = app.ActivePointGraphicsLayer.graphics[cnt];
                g.attributes['layer-source'] = 'active-point';
                app.ActivePointGraphicsLayer.remove(g);
                app.Map.graphics.add(g);
            }
            for (var cnt = app.ActivePolygonGraphicsLayer.graphics.length - 1; cnt >= 0; cnt--) {
                var g = app.ActivePolygonGraphicsLayer.graphics[cnt];
                g.attributes['layer-source'] = 'active-polygon';
                app.ActivePolygonGraphicsLayer.remove(g);
                app.Map.graphics.add(g);
            }

            //-------------
            //new 6/6
            var printUrl = null;
            var printTemplateName = null;
            var isAsync = false;
            for (var x = 0; x < app.config.ParcelPrintServices.length; x++) {
                if (app.config.ParcelPrintServices[x].Id == template) {
                    console.log('using print');
                    console.log(app.config.ParcelPrintServices[x]);
                    printUrl = app.config.ParcelPrintServices[x].Url;
                    printTemplateName = app.config.ParcelPrintServices[x].TemplateName;
                    isAsync = app.config.ParcelPrintServices[x].ExecutionType === 'esriExecutionTypeAsynchronous';
                }
            }





            var printParams = new esriPrintParameters();
            printParams.map = app.Map;

            var printTemplate = new esriPrintTemplate();
            printTemplate.format = format;
            //printTemplate.layout = template;
            printTemplate.layout = printTemplateName;

            var opts = {};
            opts.titleText = "Sussex County";
            opts.customTextElements = GetCustomTextAttributes(currentFeature);

            //opts.customTextElements = [];
            //opts.customTextElements.push({ 'Book': 'bears' });


            printTemplate.layoutOptions = opts;

            printParams.template = printTemplate;
            registry.byId('btnPrintParcel').set("label", "Printing...");// = "Printing...";
            registry.byId("btnPrintParcel").setDisabled(true);
            var printTask = null;
            if (isAsync) printTask = new esriPrintTask(printUrl, { async: true });
            else printTask = new esriPrintTask(printUrl);
            printTask.execute(printParams,
            function (success) {
                console.log('print success');
                console.log(success);
                var printUrl = success.url;
                registry.byId('btnPrintParcel').set("label", "Print Parcel Map");
                registry.byId("btnPrintParcel").setDisabled(false);
                window.open(printUrl, "_blank");
            },
            function (error) {
                console.log('print error');
                console.log(error);
                var msg = error.message;
                alert(msg);
                registry.byId('btnPrintParcel').set("label", "Print Parcel Map");
                registry.byId("btnPrintParcel").setDisabled(false);
            }
        );
            //printTask.execute(printParams,
            //    function (success) {
            //        var printUrl = success.url;
            //        registry.byId('btnPrint').set("label", "Print");
            //        registry.byId("btnPrint").setDisabled(false);
            //        window.open(printUrl, "_blank");
            //    },
            //    function (error) {
            //        var msg = error.message;
            //        alert(msg);
            //        registry.byId('btnPrint').set("label", "Print");
            //        registry.byId("btnPrint").setDisabled(false);
            //    }
            //);


            //----NEW 1-10-18
            //---------------
            var toRemove = [];
            for (var cnt = app.Map.graphics.graphics.length - 1; cnt >= 0; cnt--) {
                var g = app.Map.graphics.graphics[cnt];
                if (g.attributes && g.attributes.hasOwnProperty('layer-source')) toRemove.push(g);
            }

            for (var cnt = 0; cnt < toRemove.length; cnt++) {
                app.Map.graphics.remove(toRemove[cnt]);
                switch (toRemove[cnt].attributes['layer-source']) {
                    case 'selected-point':
                        app.SelectedPointGraphicsLayer.add(toRemove[cnt]);
                        break;
                    case 'selected-line':
                        app.SelectedLineGraphicsLayer.add(toRemove[cnt]);
                        break;
                    case 'selected-polygon':
                        app.SelectedPolygonGraphicsLayer.add(toRemove[cnt]);
                        break;
                    case 'active-point':
                        app.ActivePointGraphicsLayer.add(toRemove[cnt]);
                        break;
                    case 'active-line':
                        app.ActiveLineGraphicsLayer.add(toRemove[cnt]);
                        break;
                    case 'active-polygon':
                        app.ActivePolygonGraphicsLayer.add(toRemove[cnt]);
                        break;
                }

            }
            //--------------------------------------





        }
        function Print() {
            //need template
            //need format
            var format = $("#selPrintFormat").val();
            var template = $("#selPrintTemplate").val();
            if (format == null || format.toString() == '') {
                alert('Select a Print Format!');
                return false;
            }
            if (template == null || template.toString() == '') {
                alert('Select a Print Template!');
                return false;
            }

            //***NEW 1-10-18
            for (var cnt = app.SelectedLineGraphicsLayer.graphics.length - 1; cnt >= 0; cnt--) {
                var g = app.SelectedLineGraphicsLayer.graphics[cnt];
                g.attributes['layer-source'] = 'selected-line';
                app.SelectedLineGraphicsLayer.remove(g);
                app.Map.graphics.add(g);
            }
            for (var cnt = app.SelectedPointGraphicsLayer.graphics.length - 1; cnt >= 0; cnt--) {
                var g = app.SelectedPointGraphicsLayer.graphics[cnt];
                g.attributes['layer-source'] = 'selected-point';
                app.SelectedPointGraphicsLayer.remove(g);
                app.Map.graphics.add(g);
            }
            for (var cnt = app.SelectedPolygonGraphicsLayer.graphics.length - 1; cnt >= 0; cnt--) {
                var g = app.SelectedPolygonGraphicsLayer.graphics[cnt];
                g.attributes['layer-source'] = 'selected-polygon';
                app.SelectedPolygonGraphicsLayer.remove(g);
                app.Map.graphics.add(g);
            }
            for (var cnt = app.ActiveLineGraphicsLayer.graphics.length - 1; cnt >= 0; cnt--) {

                var g = app.ActiveLineGraphicsLayer.graphics[cnt];
                g.attributes['layer-source'] = 'active-line';
                app.ActiveLineGraphicsLayer.remove(g);
                app.Map.graphics.add(g);
            }
            for (var cnt = app.ActivePointGraphicsLayer.graphics.length - 1; cnt >= 0; cnt--) {
                var g = app.ActivePointGraphicsLayer.graphics[cnt];
                g.attributes['layer-source'] = 'active-point';
                app.ActivePointGraphicsLayer.remove(g);
                app.Map.graphics.add(g);
            }
            for (var cnt = app.ActivePolygonGraphicsLayer.graphics.length - 1; cnt >= 0; cnt--) {
                var g = app.ActivePolygonGraphicsLayer.graphics[cnt];
                g.attributes['layer-source'] = 'active-polygon';
                app.ActivePolygonGraphicsLayer.remove(g);
                app.Map.graphics.add(g);
            }

            //-------------

            var printParams = new esriPrintParameters();
            printParams.map = app.Map;

            var printTemplate = new esriPrintTemplate();
            printTemplate.format = format;
            printTemplate.layout = template;

            var opts = {};
            opts.titleText = "Sussex County";
            printTemplate.layoutOptions = opts;

            printParams.template = printTemplate;
            registry.byId('btnPrintNoParcel').set("label", "Printing...");// = "Printing...";
            registry.byId("btnPrintNoParcel").setDisabled(true);
            var printTask = new esriPrintTask(app.config.PrintServiceUrl);
            printTask.execute(printParams,
                function (success) {
                    var printUrl = success.url;
                    registry.byId('btnPrintNoParcel').set("label", "Print");
                    registry.byId("btnPrintNoParcel").setDisabled(false);
                    window.open(printUrl, "_blank");
                },
                function (error) {
                    var msg = error.message;
                    alert(msg);
                    registry.byId('btnPrintNoParcel').set("label", "Print");
                    registry.byId("btnPrintNoParcel").setDisabled(false);
                }
            );


            //----NEW 1-10-18
            //---------------
            var toRemove = [];
            for (var cnt = app.Map.graphics.graphics.length - 1; cnt >= 0; cnt--) {
                var g = app.Map.graphics.graphics[cnt];
                if (g.attributes && g.attributes.hasOwnProperty('layer-source')) toRemove.push(g);
            }

            for (var cnt = 0; cnt < toRemove.length; cnt++) {
                app.Map.graphics.remove(toRemove[cnt]);
                switch (toRemove[cnt].attributes['layer-source']) {
                    case 'selected-point':
                        app.SelectedPointGraphicsLayer.add(toRemove[cnt]);
                        break;
                    case 'selected-line':
                        app.SelectedLineGraphicsLayer.add(toRemove[cnt]);
                        break;
                    case 'selected-polygon':
                        app.SelectedPolygonGraphicsLayer.add(toRemove[cnt]);
                        break;
                    case 'active-point':
                        app.ActivePointGraphicsLayer.add(toRemove[cnt]);
                        break;
                    case 'active-line':
                        app.ActiveLineGraphicsLayer.add(toRemove[cnt]);
                        break;
                    case 'active-polygon':
                        app.ActivePolygonGraphicsLayer.add(toRemove[cnt]);
                        break;
                }

            }
            //--------------------------------------





        }
        function NavigationToolbarClicked(buttonId) {
            console.log('NavigationToolbarClicked: ' + buttonId);

            app.MapDraw.deactivate();
            app.NavToolbar.deactivate();
            if (buttonId == 'btnIdentify') {
                console.log('removing active class navtoolbarclicked');
                $('.widget-button').removeClass('active').removeClass('visible');
                $('#layerVisibility').removeClass('visible');
                app.Map.disableMapNavigation();
                app.MapDraw.activate(esriDraw.RECTANGLE);
            }
            else if (buttonId == 'btnDeactivate') {
                $("#btnIdentify").css('background-color', '#D67E0A');
                app.Map.enableMapNavigation();
            }
        }

        function InitializeSymbols() {
            app.SearchInProgressSpinner = new Spinner(spinnerOptions);
            app.SelectedPointSymbol = new esriSimpleMarkerSymbol(app.config.Symbols.SelectedPointSymbol);
            app.SelectedLineSymbol = new esriSimpleLineSymbol(app.config.Symbols.SelectedLineSymbol);
            app.SelectedPolygonSymbol = new esriSimpleFillSymbol(app.config.Symbols.SelectedPolygonSymbol);

            app.ResultSetPointSymbol = new esriSimpleMarkerSymbol(app.config.Symbols.ResultSetPointSymbol);
            app.ResultSetLineSymbol = new esriSimpleLineSymbol(app.config.Symbols.ResultSetLineSymbol);
            app.ResultSetPolygonSymbol = new esriSimpleFillSymbol(app.config.Symbols.ResultSetPolygonSymbol);

            //optionally fix these!!


            //setup symbols
            app.YellowPointSymbol = new esriSimpleMarkerSymbol();
            app.YellowPointSymbol.setColor(new esriColor([255, 255, 0, 0.5]));
            app.YellowPointSymbol.setSize(24);

            app.YellowPolygonSymbol = new esriSimpleFillSymbol(esriSimpleFillSymbol.STYLE_SOLID,
                new esriSimpleLineSymbol(esriSimpleLineSymbol.STYLE_SOLID,
                    new esriColor([255, 0, 0]), 2),
                new esriColor([255, 255, 0]));
            //app.YellowPolygonSymbol.setStyle(esriSimpleFillSymbol.STYLE_DIAGONAL_CROSS);

            app.BlueSquarePointSymbol = new esriSimpleMarkerSymbol();
            app.BlueSquarePointSymbol.setColor(new esriColor([0, 0, 255, 0.5]));
            app.BlueSquarePointSymbol.setStyle(esriSimpleMarkerSymbol.STYLE_SQUARE);

            app.RedPointSymbol = new esriSimpleMarkerSymbol();
            app.RedPointSymbol.setColor(new esriColor([255, 0, 0, 0.5]));
            app.RedPointSymbol.setStyle(esriSimpleMarkerSymbol.STYLE_SQUARE);

            app.RedLineSymbol = new esriSimpleLineSymbol(esriSimpleLineSymbol.STYLE_SOLID,
                new esriColor([255, 0, 0]), 2);

            app.BlueLineSymbol = new esriSimpleLineSymbol(esriSimpleLineSymbol.STYLE_SOLID,
                new esriColor([0, 0, 255]), 2);

            app.YellowLineSymbol = new esriSimpleLineSymbol(esriSimpleLineSymbol.STYLE_SOLID,
                new esriColor([255, 255, 0]), 2);

            app.GreenPolygonSymbol = new esriSimpleFillSymbol(esriSimpleFillSymbol.STYLE_NULL,
                new esriSimpleLineSymbol(esriSimpleLineSymbol.STYLE_SOLID,
                    new esriColor([0, 100, 255]), 4),
                new esriColor([0, 255, 0]));

            app.BluePolygonSymbol = new esriSimpleFillSymbol(esriSimpleFillSymbol.STYLE_NULL,
                new esriSimpleLineSymbol(esriSimpleLineSymbol.STYLE_SOLID,
                    new esriColor([0, 0, 255]), 4),
                new esriColor([0, 0, 255]));

            app.YellowPolygonSymbol = new esriSimpleFillSymbol(esriSimpleFillSymbol.STYLE_NULL,
                new esriSimpleLineSymbol(esriSimpleLineSymbol.STYLE_SOLID,
                    new esriColor([255, 255, 0]), 4),
                new esriColor([0, 0, 255]));

        }

        function NavigateFeature(moveNext) {
            console.log("navigate feature");

            registry.byId("btnMoveNextFeature").setDisabled(false);
            registry.byId("btnMovePreviousFeature").setDisabled(false);
            var acc = registry.byId("divApplicationDetails");
            if (acc.selectedChildWidget != null) {
                //need to find the smallest and largest
                var small = 0;
                var large = 0;
                var kids = acc.getChildren();
                for (var childCount = 0; childCount < kids.length; childCount++) {
                    var id = kids[childCount].id;
                    var intId = parseInt(id.substring(3));
                    if (childCount == 0) {
                        small = intId;
                        large = intId;
                    }
                    else {
                        if (intId < small) small = intId;
                        if (intId > large) large = intId;
                    }

                }




                var id = parseInt(acc.selectedChildWidget.id.substring(3));
                var child = null;
                if (moveNext) {
                    if (id == large) {

                        //this is the final one in the list - can't go any farther
                        if (app.ResultsDisplayIndex + app.ResultsPerPage >= app.LayerResultsStore.data.length) {
                            registry.byId("btnMoveNextFeature").setDisabled(true);
                            return;
                        }
                        else {

                            UpdateResultsGrid(app.ResultsDisplayIndex + app.ResultsPerPage)
                        }

                        return;
                    }
                    if ((id == large - 1) && (app.ResultsDisplayIndex + app.ResultsPerPage >= app.LayerResultsStore.data.length)) {
                        registry.byId("btnMoveNextFeature").setDisabled(true);
                    }
                    var nextId = id + 1;
                    child = registry.byId("cp_" + nextId.toString());
                    //may be the last feature in the current page

                }
                if (moveNext == false) {
                    if (id == small) {
                        //at the beginning of the list
                        if (app.ResultsDisplayIndex == 0) {
                            registry.byId("btnMovePreviousFeature").setDisabled(true);
                            return;
                        }

                        //moving to the previous set of results
                        UpdateResultsGrid(app.ResultsDisplayIndex - app.ResultsPerPage);

                        //select the bottom accordion since we just moved backwards
                        kids = acc.getChildren();
                        large = -1;
                        for (var childCount = 0; childCount < kids.length; childCount++) {
                            var id = kids[childCount].id;
                            var intId = parseInt(id.substring(3));
                            if (childCount == 0) {
                                large = intId;
                            }
                            else {
                                if (intId > large) large = intId;
                            }
                        }
                        child = registry.byId("cp_" + large.toString());
                        acc.selectChild(child, true);

                        return;
                    }

                    if ((small + 1) == id && app.ResultsDisplayIndex == 0) {
                        registry.byId("btnMovePreviousFeature").setDisabled(true);
                    }


                    var nextId = id - 1;
                    child = registry.byId("cp_" + nextId.toString());
                }
                if (child != null) acc.selectChild(child, true);
            }
        }


        function SelectedApplicationChanged(divId) {
            //console.log('selected app changed');
            //console.log(registry.byId("divApplicationDetails"));
            if (app.UpdatingResults) return;
            //we may be changing the query and have cleared out the results storeActivePolygonGraphicsLayer.add
            if (app.LayerResultsStore == null) return;
            var storeId = parseInt(divId.substring(3))



            var currentFeatures = app.LayerResultsStore.query(function (x) {
                return x.id == storeId;
            });
            var currentFeature = currentFeatures[0];
            app.ActivePolygonGraphicsLayer.clear();
            app.ActivePointGraphicsLayer.clear();
            app.ActiveLineGraphicsLayer.clear();


            if (currentFeature.geometry.type == 'point') {
                var appFeature = new esriGraphic(currentFeature.geometry, app.YellowPointSymbol, { id: currentFeature.id });
                app.ActivePointGraphicsLayer.add(appFeature);
                var newPt = new esriExtent(
                    currentFeature.geometry.x - 100,
                    currentFeature.geometry.y - 100,
                    currentFeature.geometry.x + 100,
                    currentFeature.geometry.y + 100,
                    currentFeature.geometry.spatialReference);
                app.Map.setExtent(newPt.expand(1.5));
            }
            else if (currentFeature.geometry.type == 'polyline') {
                var appFeature = new esriGraphic(currentFeature.geometry, app.YellowLineSymbol, { id: currentFeature.id });
                app.ActiveLineGraphicsLayer.add(appFeature);
                app.Map.setExtent(currentFeature.geometry.getExtent().expand(1.5));
            }
            else if (currentFeature.geometry.type == 'multipoint') {
                var pt = currentFeature.geometry[0];
                var appFeature = new esriGraphic(pt, app.YellowPointSymbol, { id: currentFeature.id });
                app.ActivePointGraphicsLayer.add(appFeature);
                var newPt = new esriExtent(
                    pt.x - 100,
                    pt.y - 100,
                    pt.x + 100,
                    pt + 100,
                    pt.spatialReference);
                app.Map.setExtent(newPt.expand(1.5));
                app.Map.setExtent(currentFeature.geometry.getExtent().expand(1.5));
            }
            else {
                var appFeature = new esriGraphic(currentFeature.geometry, app.YellowPolygonSymbol, { id: currentFeature.id });
                app.ActivePolygonGraphicsLayer.add(appFeature);
                app.ActivePolygonGraphicsLayer.show();
                app.Map.setExtent(appFeature.geometry.getExtent().expand(1.5));
            }
            //show identify and hide other widgets
            console.log('hiding all widgets');
            $('.widget').hide();
            $('.widget-button').removeClass('active');
            $('#identifyWidget').show();
        }

        function GetApplicationTableHTML(appFeature) {
            //console.log(appFeature);
            var idCount = 0;
            var appResults = [];
            for (attName in appFeature) {
                if (attName != 'AppDisplayName') {
                    idCount++;
                    var attEntry = { attributeName: attName, attributeValue: appFeature[attName], id: idCount };
                    appResults.push(attEntry);
                }

            }


            var outHTML = null;
            var outHTML = '<table style="margin: 5px; width: 95%; border-collapse: collapse;">';
            //outHTML += '<tr style="border: 1px solid darkgray">';

            //outHTML += '<td colspan="2" style="padding: 5px;width:150px;font-weight:bold;font-size:14px">Application Details</td></tr>';



            for (var count = 0; count < appResults.length; count++) {
                var attName = appResults[count].attributeName;
                var attValue = appResults[count].attributeValue;
                outHTML += '<tr style="border: 1px solid darkgray">';

                outHTML += '<td style="padding: 5px;width:150px;font-style:italic">';
                outHTML += attName;
                outHTML += "</td>";
                outHTML += '<td style="padding: 5px">';
                if (attValue) {
                    if (attValue.toString().substring(0, 4) == 'http') {
                        //outHTML += '<a href="' + attValue + '" target="_blank">' + attValue + '</a>';
                        outHTML += '<a href="' + attValue + '" target="_blank">Click Here</a>';
                    }
                    else {
                        outHTML += attValue;
                    }
                }



                outHTML += "</td>";
                outHTML += "</tr>";
            }



            outHTML += "</table>";

            return outHTML;
        }

        function UpdateResultsGrid(fromIndex) {
            console.log("update results");


            var toIndex = fromIndex + app.ResultsPerPage;
            //only going up to toIndex -1, so we set the toIndex as the actual length of the array
            if (toIndex > app.LayerResultsStore.data.length - 1) toIndex = app.LayerResultsStore.data.length;
            if (app.LayerResultsStore.data.length > app.ResultsPerPage) {
                //only showing up to toIndex -1
                $("#spanSelectedApplications").html("Selected Features (" + (fromIndex + 1).toString() + " - " + toIndex.toString() + " of " + app.LayerResultsStore.data.length.toString() + ")");
                $("#spanZoomAll").show();
            }
            else {
                $("#spanSelectedApplications").html("Selected Features (" + app.LayerResultsStore.data.length.toString() + ")");
                $("#spanZoomAll").show();
            }

            registry.byId("btnMoveToStart").setDisabled(false);
            registry.byId("btnMovePreviousPage").setDisabled(false);
            registry.byId("btnMoveNextPage").setDisabled(false);
            registry.byId("btnMoveToEnd").setDisabled(false);
            registry.byId("btnMovePreviousFeature").setDisabled(false);
            registry.byId("btnMoveNextFeature").setDisabled(false);

            if (fromIndex == 0) {
                registry.byId("btnMoveToStart").setDisabled(true);
                registry.byId("btnMovePreviousPage").setDisabled(true);
            }
            if (toIndex == app.LayerResultsStore.data.length) {
                registry.byId("btnMoveNextPage").setDisabled(true);
                registry.byId("btnMoveToEnd").setDisabled(true);
            }
            app.ResultsDisplayIndex = fromIndex;
            if (!app.DisplayAllResults) {
                app.ActivePointGraphicsLayer.clear();
                app.ActivePolygonGraphicsLayer.clear();
                app.ActiveLineGraphicsLayer.clear();
                app.SelectedPointGraphicsLayer.clear();
                app.SelectedPolygonGraphicsLayer.clear();
                app.SelectedLineGraphicsLayer.clear();
            }


            if ((toIndex - fromIndex < 2) && app.ResultsDisplayIndex == 0) {
                //only a single feature
                registry.byId("btnMovePreviousFeature").setDisabled(true);
                registry.byId("btnMoveNextFeature").setDisabled(true);
            }

            if (app.DisplayAllResults === false) {
                for (var resCount = fromIndex; resCount < toIndex; resCount++) {
                    var currentFeature = app.LayerResultsStore.data[resCount]
                    currentFeature.id = app.ResultCount;
                    if (currentFeature.geometry.type == 'point') {
                        var appFeature = new esriGraphic(currentFeature.geometry, app.BlueSquarePointSymbol, { id: currentFeature.id });
                        app.SelectedPointGraphicsLayer.add(appFeature);
                    }
                    else if (currentFeature.geometry.type == 'polyline') {
                        var appFeature = new esriGraphic(currentFeature.geometry, app.BlueLineSymbol, { id: currentFeature.id });
                        app.SelectedLineGraphicsLayer.add(appFeature);
                    }
                    else {
                        var appFeature = new esriGraphic(currentFeature.geometry, app.BluePolygonSymbol, { id: currentFeature.id });
                        app.SelectedPolygonGraphicsLayer.add(appFeature);
                    }

                    app.ResultCount++;
                }
            }

            var acc = registry.byId("divApplicationDetails");
            if (acc.hasChildren()) {
                app.UpdatingResults = true;
                var kids = acc.getChildren();
                for (var childCount = 0; childCount < kids.length; childCount++) {
                    acc.removeChild(kids[childCount]);
                    //dojoDomConstruct.destroy(kids[childCount]);
                }
                app.UpdatingResults = false;
            }

            //from app.AllResultsStore, select the features where oid >= fromIndex and < toIndex
            //repopulate the id field with the latest counter (app.ResultsCount)
            var queryResults = app.LayerResultsStore.query(function (obj) {
                return obj.id >= fromIndex & obj.id < toIndex;
            })
            for (var cnt = fromIndex; cnt < toIndex; cnt++) {
                var tableHtml = GetApplicationTableHTML(app.LayerResultsStore.data[cnt].attributes);
                var displayName = 'Insert Name Here';
                if (app.LayerResultsStore.data[cnt].DisplayName) {
                    displayName = app.LayerResultsStore.data[cnt].DisplayName;
                }
                var cp = new dojoContentPane({
                    id: "cp_" + app.LayerResultsStore.data[cnt].id,

                    //title: '<span>' + app.LayerResultsStore.data[cnt].id.toString() + ") " + app.AllResultsStore.data[cnt].number + '     ' + app.AllResultsStore.data[cnt].appAttributes["Application_Type"] + '</span><span style="float:right;margin-right:20px;text-decoration:underline;color:blue;cursor: pointer" onclick="zoomToSelected(' + app.LayerResultsStore.data[cnt].id + ')">Zoom</span>',
                    title: '<span>' + app.LayerResultsStore.data[cnt].count.toString() + ')      ' + displayName + '</span><span style="float:right;margin-right:20px;text-decoration:underline;color:blue;cursor: pointer" onclick="zoomToSelected(' + app.LayerResultsStore.data[cnt].id + ')">Zoom</span>',

                    content: tableHtml,
                    onShow: function () {
                        SelectedApplicationChanged(this.id);
                    }
                });
                acc.addChild(cp);
            }
            acc.startup();

            acc.resize();
//            showSearchResults();
        }
        function UpdateLegendByScale() {
            var visibleLayers = app.Map.getLayersVisibleAtScale();
            var currentScale = app.Map.getScale();
            var visLayers = [];
            for (var x = 0; x < app.MapServices.Services.length; x++) {
                var visLayer = { id: app.MapServices.Services[x].Id, hiddenLayers: [] };
                for (var y = 0; y < app.MapServices.Services[x].Layers.length; y++) {
                    var li = app.MapServices.Services[x].Layers[y].LayerInfo;
                    if (li) {

                    }
                    else {
                        //not everything is loaded - quit for now
                        return false;
                    }

                    if ((li.maxScale != 0 & currentScale < li.maxScale) | (li.minScale != 0 & currentScale > li.minScale)) {
                        visLayer.hiddenLayers.push(li.id);
                    }

                }
                if (visLayer.hiddenLayers.length > 0) {
                    visLayers.push(visLayer);
                }
            }
            $("#divLayerVisibility :checkbox").removeAttr('disabled');
            if (visLayers.length > 0) {
                for (var x = 0; x < visLayers.length; x++) {
                    var serviceId = visLayers[x].id;
                    for (var y = 0; y < visLayers[x].hiddenLayers.length; y++) {
                        var hiddenLayerId = visLayers[x].hiddenLayers[y];
                        $("#divLayerVisibility :checkbox[data-serviceid='" + serviceId + "'][data-maplayerid='" + hiddenLayerId + "']").attr('disabled', 'disabled');
                    }
                }
            }
        }

        function LoadPrintOptions() {
            var printRequests = [];
            var printInfoRequest1 = new esriRequest(
                {
                    url: app.config.PrintServiceUrl,
                    content: { f: "json" },
                    handleAs: "json",
                    callbackParamName: "callback"
                });
            printRequests.push(printInfoRequest1);

            //var printInfoRequest2 = new esriRequest(
            //    {
            //        url: app.config.ParcelPrintServiceUrl,
            //        content: { f: "json" },
            //        handleAs: "json",
            //        callbackParamName: "callback"
            //    });
            //printRequests.push(printInfoRequest2);
            for (var x = 0; x < app.config.ParcelPrintServices.length; x++) {
                var req =
                    new esriRequest(
                {
                    url: app.config.ParcelPrintServices[x].Url,
                    content: { f: "json" },
                    handleAs: "json",
                    callbackParamName: "callback"
                });
                printRequests.push(req);
            }


            var aliasRequest = new esriRequest(
                                {
                                    url: app.config.ParcelSearchConfiguration.RelatedTableUrl,
                                    content: { f: "json" },
                                    handleAs: "json",
                                    callbackParamName: "callback"
                                });
            printRequests.push(aliasRequest);

            promises = dojoPromiseAll(printRequests);
            //promises.then(function (idResponses) {

            promises.then(function (resp) {

                var templateNames, formatNames;
                templateNames = dojoArray.filter(resp[0].parameters, function (param, idx) {
                    return param.name == 'Layout_Template';
                });
                formatNames = dojoArray.filter(resp[0].parameters, function (param, idx) {
                    return param.name == 'Format';
                });
                if (templateNames.length > 0 & formatNames.length > 0) {
                    app.selPrintFormat.empty();
                    app.selPrintTemplate.empty();

                }
                domAttr.set(dom.byId('btnPrintNoParcel'), 'data-async-print', resp[0].executionType);

                //esriExecutionTypeAsynchronous
                $.each(templateNames[0].choiceList, function (a, b) {
                    var txt = '<option value = "' + b + '">' + b + '</option>';
                    app.selPrintTemplate.append(txt);
                });
                $.each(formatNames[0].choiceList, function (a, b) {
                    var txt = '<option value = "' + b + '">' + b + '</option>';
                    app.selPrintFormat.append(txt);
                });


                //new way - load from config


                for (var x = 1; x <= app.config.ParcelPrintServices.length; x++) {
                    app.config.ParcelPrintServices[x - 1].Id = x;
                    templateNames = dojoArray.filter(resp[x].parameters, function (param, idx) {
                        return param.name == 'Layout_Template';
                    });
                    app.config.ParcelPrintServices[x - 1].AvailableTemplates = templateNames[0].choiceList;
                    formatNames = dojoArray.filter(resp[1].parameters, function (param, idx) {
                        return param.name == 'Format';
                    });
                    app.config.ParcelPrintServices[x - 1].Formats = formatNames[0].choiceList;
                    app.config.ParcelPrintServices[x - 1].ExecutionType = resp[x].executionType;

                    //append to list
                    if (x === 1) {
                        var txt = '<option selected value = "' + app.config.ParcelPrintServices[x - 1].Id + '">' + app.config.ParcelPrintServices[x - 1].DisplayName + '</option>';
                        app.selPrintTemplateParcel.append(txt);

                    }
                    else {
                        var txt = '<option value = "' + app.config.ParcelPrintServices[x - 1].Id + '">' + app.config.ParcelPrintServices[x - 1].DisplayName + '</option>';
                        app.selPrintTemplateParcel.append(txt);
                    }

                }
                app.selPrintTemplateParcel.change();
                app.config.ParcelSearchConfiguration.RelatedTableInfo = resp[app.config.ParcelPrintServices.length + 1].fields;



                //old way - load these dynamically
                //templateNames = dojoArray.filter(resp[1].parameters, function (param, idx) {
                //    return param.name == 'Layout_Template';
                //});
                //formatNames = dojoArray.filter(resp[1].parameters, function (param, idx) {
                //    return param.name == 'Format';
                //});
                //if (templateNames.length > 0 & formatNames.length > 0) {
                //    app.selPrintFormatParcel.empty();
                //    app.selPrintTemplateParcel.empty();

                //}
                //domAttr.set(dom.byId('btnPrintParcel'), 'data-async-print', resp[1].executionType);

                ////esriExecutionTypeAsynchronous
                //$.each(templateNames[0].choiceList, function (a, b) {
                //    var txt = '<option value = "' + b + '">' + b + '</option>';
                //    app.selPrintTemplateParcel.append(txt);
                //});
                //$.each(formatNames[0].choiceList, function (a, b) {
                //    var txt = '<option value = "' + b + '">' + b + '</option>';
                //    app.selPrintFormatParcel.append(txt);
                //});
                //end old way


                //new way - load from config since they want to use a separate service per template type


                //this was resp[1] before we removed the second print service request
                //app.config.ParcelSearchConfiguration.RelatedTableInfo = resp[1].fields;

            })
        }
        function endsWith(str, suffix) {
            return str.indexOf(suffix, str.length - suffix.length) !== -1;
        }



        function RequestServiceLegendInfoNew(callback) {





            //sort to figure out the legend urls we'll need
            var uniqueServices = [];
            var layerUrls = [];
            for (var serviceCount = 0; serviceCount < app.MapServices.Services.length; serviceCount++) {
                uniqueServices.push(app.MapServices.Services[serviceCount].Url);
                for (var layerCount = 0; layerCount < app.MapServices.Services[serviceCount].Layers.length; layerCount++) {
                    //add serviceId attribute to each of the child layers
                    app.MapServices.Services[serviceCount].Layers[layerCount].ServiceId = app.MapServices.Services[serviceCount].Id;
                    layerUrls.push(app.MapServices.Services[serviceCount].Url + '/' + app.MapServices.Services[serviceCount].Layers[layerCount].LayerId);
                }
            }


            MakeLegendRequestsNew(uniqueServices, layerUrls);
            function MakeLegendRequestsNew(services, uniqueLayerUrls) {
                var legendRequests = [];
                for (var cnt = 0; cnt < uniqueServices.length; cnt++) {
                    var legendRequest = new esriRequest({
                        url: uniqueServices[cnt] + '/legend',
                        content: { f: "json" },
                        handleAs: "json",
                        callbackParamName: "callback"
                    })
                    legendRequests.push(legendRequest);
                }

                promises = dojoPromiseAll(legendRequests);
                promises.then(function (legendResponse) {
                    (function (services, legendResponse, uniqueLayerUrls) {
                        var layerRequests = [];
                        for (var responseCount = 0; responseCount < legendResponse.length; responseCount++) {
                            legendResponse[responseCount].Url = services[responseCount];
                        }
                        MakeLayerRequestsNew(legendResponse, uniqueLayerUrls);
                    })(services, legendResponse, uniqueLayerUrls);
                });
            }
            function MakeLayerRequestsNew(legendResponse, urls) {
                var layerRequests = [];
                for (var urlCount = 0; urlCount < urls.length; urlCount++) {
                    var layerRequest = new esriRequest({
                        url: urls[urlCount],
                        content: { f: "json" },
                        handleAs: "json",
                        callbackParamName: "callback"
                    })
                    layerRequests.push(layerRequest);
                }
                promises = dojoPromiseAll(layerRequests);
                promises.then(function (layerResponse) {
                    (function (layerResponse, legendResponse, urls) {
                        for (var cnt = 0; cnt < layerResponse.length; cnt++) {
                            layerResponse[cnt].Url = urls[cnt];
                        }
                        app.MapServices.PopulateLegendInformation(legendResponse, layerResponse);

                        callback();
                    })(layerResponse, legendResponse, urls);
                });

            }
        }

        function CreateServiceLegendNew() {

            //object will have a row for each layer and group header
            //if layer is a group layer, rows will only exist for the sub layers
            app.LayerOrder = [];
            var legendItems = [];
            app.config.LegendGroups.sort(function (a, b) {
                return a.GroupOrder - b.GroupOrder
            });

            var itemCount = 1;
            for (var groupCount = 0; groupCount < app.config.LegendGroups.length; groupCount++) {
                var group = app.config.LegendGroups[groupCount];
                var groupLayers = [];
                for (var groupOrderCount = 0; groupOrderCount < group.LayerIds.length; groupOrderCount++) {
                    for (var serviceCount = 0; serviceCount < app.MapServices.Services.length; serviceCount++) {
                        for (var layerCount = 0; layerCount < app.MapServices.Services[serviceCount].Layers.length; layerCount++) {
                            if (group.LayerIds[groupOrderCount] === app.MapServices.Services[serviceCount].Layers[layerCount].Id) {
                                app.MapServices.Services[serviceCount].Layers[layerCount].ServiceId = app.MapServices.Services[serviceCount].Id;
                                groupLayers.push(app.MapServices.Services[serviceCount].Layers[layerCount]);
                            }
                        }
                    }
                }

                var groupHeader = {};
                groupHeader.parentId = 0;
                groupHeader.id = itemCount;
                groupHeader.label = group.GroupName;
                groupHeader.type = 'Group';
                groupHeader.groupId = group.GroupOrder;
                itemCount++;
                legendItems.push(groupHeader);

                for (var layerCount = 0; layerCount < groupLayers.length; layerCount++) {
                    var layerItem = {};
                    if (groupLayers[layerCount].ShowSubLayers === true) {
                        var ff = 4;
                    }
                    layerItem.id = itemCount;
                    layerItem.referenceId = groupLayers[layerCount].ServiceId;
                    layerItem.defaultVisibility = groupLayers[layerCount].Visible;
                    //layerItem.parentLayerUrl = groupLayers[layerCount].LayerInfo.Url;
                    layerItem.url = groupLayers[layerCount].Url;
                    app.LayerOrder.push(
                        {
                            url: layerItem.url,
                            order: itemCount
                        }
                    );
                    layerItem.parentId = groupHeader.id;
                    layerItem.groupId = groupHeader.groupId;
                    layerItem.mapLayerId = groupLayers[layerCount].LayerMetadata.id;
                    if (groupLayers[layerCount].Name) {
                        //if layer name is specified in config
                        layerItem.label = groupLayers[layerCount].Name;
                    }
                    else {
                        //if not, use layer name from service
                        layerItem.label = groupLayers[layerCount].LayerMetadata.name;
                    }
                    //below is where we may need to get the legend information from the parent service
                    layerItem.labelInfo = groupLayers[layerCount].LegendInfo;
                    layerItem.queryable = groupLayers[layerCount].Queryable;
                    layerItem.type = 'MapLayer';
                    if (groupLayers[layerCount].ShowSubLayers === true) { layerItem.hasSubLayers = true; }
                    legendItems.push(layerItem);
                    itemCount++;
                    if (groupLayers[layerCount].ShowSubLayers === true) {
                        //layerItem.parentId = the layerItem.id of the item above
                        var parentId = layerItem.id;
                        var parentLayerId = layerItem.mapLayerId;
                        for (var subLayerCount = 0; subLayerCount < groupLayers[layerCount].SubLayers.length; subLayerCount++) {
                            layerItem = {};
                            layerItem.id = itemCount;
                            layerItem.parentId = parentId;
                            layerItem.groupId = groupHeader.groupId;
                            layerItem.referenceId = groupLayers[layerCount].ServiceId;
                            layerItem.mapLayerId = groupLayers[layerCount].LayerMetadata.id;
                            layerItem.subLayerId = groupLayers[layerCount].SubLayers[subLayerCount].LayerId;
                            layerItem.label = groupLayers[layerCount].SubLayers[subLayerCount].Name;
                            layerItem.labelInfo = groupLayers[layerCount].SubLayers[subLayerCount].LegendInfo;
                            layerItem.queryable = groupLayers[layerCount].Queryable;
                            layerItem.defaultVisibility = groupLayers[layerCount].Visible;
                            layerItem.type = 'SubLayer';
                            legendItems.push(layerItem);
                            itemCount++;
                        }
                    }
                }
            }


            var layerStore = new dojoMemoryStore({
                data: legendItems,
                idProperty: "id",
                getChildren: function (parent, options) {
                    return layerStore.query({ parentId: parent.id }, { length: 100 });
                },
                mayHaveChildren: function (parent) {
                    return parent.type == 'Group' || parent.hasSubLayers == true;
                }
            });
            app.SearchInProgressSpinner.stop();
            var layerGridType = dojoDeclare([dojoOnDemandGrid, dojoTreeGrid]);
            app.LayerGrid = new layerGridType({
                store: layerStore,
                query: function (layer) { return layer.type == 'Group' },
                columns: [
                    dojoTreeGrid({
                        label: "Layer Visibility",
                        formatter: BuildLegendRow,
                        shouldExpand: function (row, level, previouslyExpanded) {
                            return true;

                        },
                        indentWidth: 10
                    })
                ]
            }, "divLayerVisibility");

            //we need these to expand once so the row is built
            $("#divLayerVisibility").hide();
            console.log('hiding divlayervisibility');
            for (var x = 0; x < app.LayerGrid.store.data.length; x++) {
                var id = app.LayerGrid.store.data[x].id;
                if (app.LayerGrid.store.data[x].type == 'Group') {
                    var row = app.LayerGrid.row(id);
                    if (app.LayerGrid.store.data[x].label == 'Addresses/Parcels') {
                        app.LayerGrid.expand(row, true);
                    }
                    else {
                        app.LayerGrid.expand(row, false);
                    }
                }

            }
            $("#divLayerVisibility").show();

            $("#divLayerVisibility input[data-itemtype='layer']").after("<span class='icon-eye'></span>");

            $("#divLayerVisibility").on("change", ":checkbox", function () {
                if ($(this).attr('data-itemtype') == 'identify') {
                    return false;
                }
                var sourceServiceId, sourceLayerId, subLayerId;
                if ($(this).attr('data-serviceid')) {
                    sourceServiceId = Number($(this).attr('data-serviceid'));
                }
                if ($(this).attr('data-maplayerid')) {
                    sourceLayerId = Number($(this).attr('data-maplayerid'));
                }
                if ($(this).attr('data-sublayerid')) {
                    subLayerId = Number($(this).attr('data-sublayerid'));
                }
                console.log('checkbox change service: ' + sourceServiceId + ' layer: ' + sourceLayerId + ' sublayer: ' + subLayerId);

                if ($(this).attr('data-itemtype') == 'group') {
                    //must cascade
                    var isChecked = $(this).is(':checked');
                    var groupId = $(this).attr('data-groupid');
                    var match = $("#divLayerVisibility :checkbox[data-groupid='" + groupId + "']").length;
                    if (isChecked) {
                        $("#divLayerVisibility :checkbox[data-groupid='" + groupId + "']").prop('checked', true);
                    }
                    else {
                        $("#divLayerVisibility :checkbox[data-groupid='" + groupId + "']").removeAttr('checked');
                    }

                    updateLayerVisibility();
                }
                else {
                    //now we need to check for sublayers
                    //if we clicked a group layer, this will be null
                    var targetService = null;
                    for (var layerCount = 0; layerCount < app.MapServices.Services.length; layerCount++) {
                        if (app.MapServices.Services[layerCount].Id == sourceServiceId) {
                            targetService = app.MapServices.Services[layerCount];
                            break;
                        }
                    }
                    var targetLayer = null;
                    for (var layerCount = 0; layerCount < targetService.Layers.length; layerCount++) {
                        if (targetService.Layers[layerCount].LayerId == sourceLayerId) {
                            targetLayer = targetService.Layers[layerCount];
                        }
                    }


                    if ($(this).attr('data-itemtype') == 'layer') {
                        var isChecked = $(this).is(':checked');
                        //find the id checkbox corresponding to this layer
                        if (isChecked) {

                            //now we dont necessarily want to check the ID checkbox when we turn a layer visible
                            //$("#divLayerVisibility :checkbox[data-itemtype='identify'][data-serviceid='" + sourceServiceId + "'][data-maplayerid='" + sourceLayerId + "']").prop('checked', true);

                            //make sure group layer is checked for consistencys sake
                            var groupId = $(this).attr('data-groupid');
                            $("#divLayerVisibility :checkbox[data-itemtype='group'][data-groupid='" + groupId + "']").prop('checked', true);
                        }
                        else {
                            $("#divLayerVisibility :checkbox[data-itemtype='identify'][data-serviceid='" + sourceServiceId + "'][data-maplayerid='" + sourceLayerId + "']").removeAttr('checked');
                        }

                        if (subLayerId === -1 && targetLayer && targetLayer.SubLayers && targetLayer.SubLayers.length > 0) {
                            //if the parent layer is checked
                            if (isChecked) {
                                $("#divLayerVisibility :checkbox[data-itemtype='identify'][data-serviceid='" + sourceServiceId + "'][data-maplayerid='" + sourceLayerId + "'][data-sublayerid!='-1']").prop('checked', true);
                                $("#divLayerVisibility :checkbox[data-itemtype='layer'][data-serviceid='" + sourceServiceId + "'][data-maplayerid='" + sourceLayerId + "'][data-sublayerid!='-1']").prop('checked', true);
                            }
                            else {
                                $("#divLayerVisibility :checkbox[data-itemtype='identify'][data-serviceid='" + sourceServiceId + "'][data-maplayerid='" + sourceLayerId + "'][data-sublayerid!='-1']").removeAttr('checked');
                                $("#divLayerVisibility :checkbox[data-itemtype='layer'][data-serviceid='" + sourceServiceId + "'][data-maplayerid='" + sourceLayerId + "'][data-sublayerid!='-1']").removeAttr('checked');
                                //$("#divLayerVisibility :checkbox[data-itemtype='identify'][data-serviceid='" + sourceServiceId + "'][data-maplayerid='" + sourceLayerId + "']").removeAttr('checked');
                            }
                        }

                        if (subLayerId !== -1) {
                            //should parent layer be checked?
                            var subLayerCheckCount = $("#divLayerVisibility :checkbox[data-itemtype='layer'][data-serviceid='" + sourceServiceId + "'][data-maplayerid='" + sourceLayerId + "'][data-sublayerid!='-1']:checked").length;
                            if (subLayerCheckCount === 0) {
                                $("#divLayerVisibility :checkbox[data-itemtype='layer'][data-serviceid='" + sourceServiceId + "'][data-maplayerid='" + sourceLayerId + "'][data-sublayerid='-1']").removeAttr('checked');
                            }
                            else {
                                $("#divLayerVisibility :checkbox[data-itemtype='layer'][data-serviceid='" + sourceServiceId + "'][data-maplayerid='" + sourceLayerId + "'][data-sublayerid='-1']").prop('checked', true);
                            }

                        }
                    }

                    updateLayerVisibility();
                }



                var processedGroupLayers = [];


                function updateLayerVisibility() {
                    var visibleDictionary = [];
                    for (var serviceCount = 0; serviceCount < app.MapServices.Services.length; serviceCount++) {
                        var serviceId = app.MapServices.Services[serviceCount].Id;
                        var serviceVisible = { serviceId: serviceId, visibleLayers: [] };
                        $("#divLayerVisibility :checkbox[data-itemtype='layer'][data-serviceid='" + serviceId + "'][data-maplayerid]").each(function () {
                            //non sublayers
                            var mapLayerId = Number($(this).attr('data-maplayerid'));
                            var subLayerId = Number($(this).attr('data-sublayerid'));
                            var layersNeedHidden = [];
                            if ($(this).is(':checked')) {
                                if (subLayerId === -1) serviceVisible.visibleLayers.push(mapLayerId);
                                else {
                                    serviceVisible.visibleLayers.push(subLayerId);
                                    layersNeedHidden.push(mapLayerId);
                                }
                            }
                            for (var hideCount = 0; hideCount < layersNeedHidden.length; hideCount++) {
                                var idx = serviceVisible.visibleLayers.indexOf(layersNeedHidden[hideCount]);
                                if (idx > -1) {
                                    serviceVisible.visibleLayers.splice(idx, 1);
                                }


                            }
                        });
                        visibleDictionary.push(serviceVisible);
                    }
                    for (var serviceCount = 0; serviceCount < app.MapServices.Services.length; serviceCount++) {
                        for (var visibleCount = 0; visibleCount < visibleDictionary.length; visibleCount++) {
                            if (visibleDictionary[visibleCount].serviceId === app.MapServices.Services[serviceCount].Id) {
                                if (visibleDictionary[visibleCount].visibleLayers.length > 0) {
                                    app.MapServices.Services[serviceCount].LayerObject.show();
                                    app.MapServices.Services[serviceCount].LayerObject.setVisibleLayers(visibleDictionary[visibleCount].visibleLayers);
                                }
                                else {
                                    app.MapServices.Services[serviceCount].LayerObject.hide();
                                }
                            }
                        }
                    }
                }







                //$("#divLayerVisibility :checkbox[data-itemtype='layer'][data-sublayerid='-1']").each(function () {
                //    var isChecked = $(this).is(':checked');
                //    sourceServiceId = Number($(this).attr('data-serviceid'));
                //    //var subLayerId = $(this).attr('data-sublayerid');
                //    targetService = null;
                //    for (var layerCount = 0; layerCount < app.MapServices.Services.length; layerCount++) {
                //        if (app.MapServices.Services[layerCount].Id == sourceServiceId) {
                //            targetService = app.MapServices.Services[layerCount];
                //            break;
                //        }
                //    }
                //    if (targetService.Url == 'https://maps.sussexcountyde.gov/gis/rest/services/County_Layers/WatershedsLayers/MapServer') {
                //        var fff = 5;
                //    }

                //    if ($(this).attr('data-maplayerid')) {
                //        //if the checkbox has a maplayerid attribute, it's part of a group layer
                //        //no use looking through these multiple times, so check which layer the sublayer is a part of
                //        //loop through all checkboxes part of the group layer


                //        if (processedGroupLayers.indexOf(sourceServiceId) == -1) {

                //            //search for all checkboxes where data-sublayerid <> -1 and data-maplayerid = x and data-serviceid= y

                //            var visibleSublayers = [];
                //            $("#divLayerVisibility :checkbox[data-serviceid='" + sourceServiceId + "'][data-itemtype='layer']").each(function () {
                //                var mapLayerId = Number($(this).attr('data-maplayerid'));
                //                for (var layerCount = 0; layerCount < targetService.Layers.length; layerCount++) {
                //                    if (targetService.Layers[layerCount].LayerId == mapLayerId) {
                //                        targetLayer = targetService.Layers[layerCount];
                //                    }
                //                }
                //                if ($(this).is(':checked')) {
                //                    visibleSublayers.push(mapLayerId);

                //                }
                //                if (targetLayer && targetLayer.SubLayers && targetLayer.SubLayers.length > 0) {
                //                    $("#divLayerVisibility :checkbox[data-serviceid='" + sourceServiceId + "'][data-itemtype='layer'][data-maplayerid='" + mapLayerId + "'][data-sublayerid!='-1']").each(function () {
                //                        var subLayerId = Number($(this).attr('data-sublayerid'));
                //                        if ($(this).is(':checked')) {
                //                            visibleSublayers.push(subLayerId);

                //                        }
                //                    });

                //                }
                //            });

                //            if (visibleSublayers.length == 0) {
                //                targetService.LayerObject.hide();
                //            }
                //            else {

                //                targetService.LayerObject.show();
                //                targetService.LayerObject.setVisibleLayers(visibleSublayers);
                //                if (targetService.Url == 'http://maps.sussexcountyde.gov/gis/rest/services/Assessment/TaxIndexMap/MapServer') {
                //                    targetService.LayerObject.refresh();
                //                }

                //            }

                //            processedGroupLayers.push(sourceServiceId);
                //        }
                //    }
                //    else {
                //        //situation where map service is by itself and not in a group
                //        if (isChecked) {
                //            targetService.LayerObject.show();
                //        }
                //        else {
                //            targetService.LayerObject.hide();
                //        }
                //    }
                //});


            });
            function BuildLegendRow(evt) {
                //this corresponds to the dGrid indent width above, plus 15px + 10px
                if (evt.label == 'Parcel Labels') {
                    var ttt = 4;
                }
                var indentWidth = 60;
                var imageIndentWidth = 30;
                var htmlText = '<div style="width:100%">';
                if (evt.id != -1) {
                    if (evt.parentId == 0) {
                        //group header
                        htmlText += '<input style="vertical-align:middle" data-itemtype="group" data-groupid="' + evt.groupId + '" type="checkbox" checked/><span class="icon-eye"></span>';
                        htmlText += '<span class="vertical-align:middle" style="margin-left:5px;font-weight:bold;font-size:1.2em;">' + evt.label + '</span>';
                        htmlText += '</div>';
                    }
                    else {
                        var subLayerId = -1;
                        if (evt.type === 'SubLayer') {
                            subLayerId = evt.subLayerId;
                        }
                        htmlText += '<input style="vertical-align:middle" data-groupid="' + evt.groupId + '" data-itemtype="layer" data-serviceid="' + evt.referenceId + '" data-sublayerid="' + subLayerId + '" type="checkbox"';
                        if (evt.mapLayerId != undefined) {
                            htmlText += ' data-maplayerid="' + evt.mapLayerId + '"';
                        }
                        if (evt.defaultVisibility) {
                            htmlText += ' checked';
                        }
                        htmlText += '/>';

                        if (evt.labelInfo != undefined) {
                            if (evt.labelInfo.SimpleRenderer) {
                                var imageHeight = evt.labelInfo.SimpleRenderer.Symbology.height;
                                var imageWidth = evt.labelInfo.SimpleRenderer.Symbology.width;
                                var imageSource = 'data:' + evt.labelInfo.SimpleRenderer.Symbology.contentType + ';base64,' + evt.labelInfo.SimpleRenderer.Symbology.imageData;
                                var imageText = '<img style="margin-left:25px;height:' + imageHeight + 'px;width:' + imageWidth + 'px" src="' + imageSource + '"</img>';
                                htmlText += imageText;
                                htmlText += '<span style="margin-left:5px;font-size:1.2em;width: 170px; display: inline-block">' + evt.label + '</span>';
                                if (evt.subLayerId == undefined || evt.subLayerId === -1) {


                                    if (evt.defaultVisibility) {
                                        if (evt.queryable) {
                                            htmlText += '<div class="info-toggle"><input style="vertical-align:middle" data-sublayer="' + subLayerId + '" data-groupid="' + evt.groupId + '" data-itemtype="identify" data-maplayerid="' + evt.mapLayerId + '" data-itemtype="identify" data-serviceid="' + evt.referenceId + '" type="checkbox" checked/><span class="icon-info"></span></div>';
                                        }
                                        else {
                                            htmlText += '<div class="info-toggle"><input style="vertical-align:middle" data-sublayer="' + subLayerId + '" data-groupid="' + evt.groupId + '" data-itemtype="identify" data-maplayerid="' + evt.mapLayerId + '" data-serviceid="' + evt.referenceId + '" type="checkbox"/><span  class="icon-info"></span></div>';
                                        }

                                    }
                                    else {
                                        if (evt.queryable) {
                                            htmlText += '<div class="info-toggle"><input style="vertical-align:middle" data-sublayer="' + subLayerId + '" data-groupid="' + evt.groupId + '" data-itemtype="identify" data-maplayerid="' + evt.mapLayerId + '" data-serviceid="' + evt.referenceId + '" type="checkbox" checked/><span  class="icon-info"></span></div>';
                                        }
                                        else {
                                            htmlText += '<div class="info-toggle"><input style="vertical-align:middle" data-sublayer="' + subLayerId + '" data-groupid="' + evt.groupId + '" data-itemtype="identify" data-maplayerid="' + evt.mapLayerId + '" data-serviceid="' + evt.referenceId + '" type="checkbox"/><span  class="icon-info"></span></div>';
                                        }
                                    }
                                }

                                htmlText += '</div>';
                            }
                            else if (evt.labelInfo.UniqueRenderer) {
                                //unique
                                htmlText += '<span style="margin-left:30px;vertical-align:middle;font-size:1.2em">' + evt.label + '</span>';
                                if (evt.subLayerId == undefined || evt.subLayerId === -1) {
                                    if (evt.defaultVisibility) {
                                        if (evt.queryable) {
                                            htmlText += '<div class="info-toggle"><input style="vertical-align:middle" data-sublayer="' + subLayerId + '" data-groupid="' + evt.groupId + '" data-itemtype="identify" data-serviceid="' + evt.referenceId + '" data-maplayerid="' + evt.mapLayerId + '" type="checkbox" checked/><span  class="icon-info"></span></div>';
                                        }
                                        else {
                                            htmlText += '<div class="info-toggle"><input style="vertical-align:middle" data-sublayer="' + subLayerId + '" data-groupid="' + evt.groupId + '" data-itemtype="identify" data-maplayerid="' + evt.mapLayerId + '" data-serviceid="' + evt.referenceId + '" type="checkbox"/><span  class="icon-info"></span></div>';
                                        }

                                    }
                                    else {
                                        if (evt.queryable) {
                                            htmlText += '<div class="info-toggle"><input style="vertical-align:middle" data-sublayer="' + subLayerId + '" data-groupid="' + evt.groupId + '" data-itemtype="identify" data-maplayerid="' + evt.mapLayerId + '" data-serviceid="' + evt.referenceId + '" type="checkbox" checked/><span  class="icon-info"></span></div>';
                                        }
                                        else {
                                            htmlText += '<div class="info-toggle"><input style="vertical-align:middle" data-sublayer="' + subLayerId + '" data-groupid="' + evt.groupId + '" data-itemtype="identify" data-maplayerid="' + evt.mapLayerId + '" data-serviceid="' + evt.referenceId + '" type="checkbox"/><span  class="icon-info"></span></div>';
                                        }
                                    }
                                }

                                htmlText += '<div style="margin-left:125px;vertical-align:middle;width:100%;font-style:italic;font-size:1.1em; display: none">';
                                htmlText += evt.labelInfo.UniqueRenderer.FieldName;
                                htmlText += '</div>';
                                for (var uniqueCount = 0; uniqueCount < evt.labelInfo.UniqueRenderer.UniqueValues.length; uniqueCount++) {

                                    var uq = evt.labelInfo.UniqueRenderer.UniqueValues[uniqueCount];
                                    htmlText += '<div style="margin-left:' + imageIndentWidth.toString() + 'px;vertical-align:middle;width:100%">';
                                    var imageHeight = uq.Symbology.height;
                                    var imageWidth = uq.Symbology.width;
                                    var imageSource = 'data:' + uq.Symbology.contentType + ';base64,' + uq.Symbology.imageData;
                                    var imageText = '<img style="margin-left:15px;vertical-align:top;' + imageHeight + 'px;width:' + imageWidth + 'px" src="' + imageSource + '"</img>';
                                    htmlText += imageText;
                                    htmlText += '<span style="margin-left:5px;padding: 5px 0;vertical-align:middle; width: 200px; display: inline-block;">' + uq.Label + '</span>';
                                    htmlText += '</div>';

                                }
                                htmlText += '</div>';
                            }
                            else {
                                //no renderer
                                var tt = evt.labelInfo;
                                htmlText += '<div style="margin-left:' + imageIndentWidth.toString() + 'px;vertical-align:middle;width:100%">';
                                htmlText += '<span style="margin-left:5px;vertical-align:middle;font-size:1.2em;">' + evt.label + '</span>';
                                htmlText += '</div>';
                            }
                        }
                        else {
                            var tt = 5;
                            htmlText += '<span style="margin-left:30px;font-size:1.2em">' + evt.label + '</span>';
                            if (evt.queryable == true) {
                                htmlText += '<div style="float:right"><input style="vertical-align:middle" data-sublayer="' + subLayerId + '" data-groupid="' + evt.groupId + '" data-itemtype="identify" data-maplayerid="' + evt.mapLayerId + '" data-serviceid="' + evt.referenceId + '" type="checkbox" checked/><span> Id?</span></div>';
                            }

                            //htmlText += '<div style="margin-left:' + imageIndentWidth.toString() + 'px;vertical-align:middle;width:100%">';

                            htmlText += '</div>';
                        }

                    }
                }

                return htmlText;
            }
        }

    });




function zoomToSelected(id) {
    require([
        "esri/geometry/geometryEngine",
        "esri/geometry/geometryEngineAsync"],
        function (esriGeometryEngine, esriGeometryEngineAsync) {
            var results = app.LayerResultsStore.query(function (x) {
                return x.id == id;
            })
            var result = results[0];
            var zoomGeom = [];
            if (result.geometry.type == 'point') {
                var pointBuffer = esriGeometryEngine.buffer(result.geometry, 100);
                app.Map.setExtent(pointBuffer.getExtent());
            }
            else {
                app.Map.setExtent(result.geometry.getExtent().expand(1.5));
            }

        });

}
function removeSelectedApplication(id) {
    require([
        "dijit/registry",
        "dojo/dom-construct", ],
        function (registry, dojoDomConstruct) {
            var idName = "cp_" + id.toString();
            var acc = registry.byId("divApplicationDetails");
            if (acc.hasChildren()) {
                var kids = acc.getChildren();
                for (var childCount = 0; childCount < kids.length; childCount++) {
                    if (kids[childCount].id == idName) {
                        acc.removeChild(kids[childCount]);
                        //dojoDomConstruct.destroy(kids[childCount]);
                        app.AllResultsStore.remove(id);

                        for (var count = 0; count < app.SelectedPointGraphicsLayer.graphics.length; count++) {
                            if (app.SelectedPointGraphicsLayer.graphics[count].attributes["id"] == id) {
                                app.SelectedPointGraphicsLayer.remove(app.SelectedPointGraphicsLayer.graphics[count]);
                            }
                        }
                        for (var count = 0; count < app.SelectedPolygonGraphicsLayer.graphics.length; count++) {
                            if (app.SelectedPolygonGraphicsLayer.graphics[count].attributes["id"] == id) {
                                app.SelectedPolygonGraphicsLayer.remove(app.SelectedPolygonGraphicsLayer.graphics[count]);
                            }
                        }
                        for (var count = 0; count < app.ActivePolygonGraphicsLayer.graphics.length; count++) {
                            if (app.ActivePolygonGraphicsLayer.graphics[count].attributes["id"] == id) {
                                app.ActivePolygonGraphicsLayer.remove(app.ActivePolygonGraphicsLayer.graphics[count]);
                            }
                        }
                        for (var count = 0; count < app.ActivePointGraphicsLayer.graphics.length; count++) {
                            if (app.ActivePointGraphicsLayer.graphics[count].attributes["id"] == id) {
                                app.ActivePointGraphicsLayer.remove(app.ActivePointGraphicsLayer.graphics[count]);
                            }
                        }
                        $("#spanSelectedApplications").html("Selected Applications (" + app.AllResultsStore.data.length + ")");
                        $("#spanZoomAll").show();
                        break;
                    }

                }
            }
        });

    var tt = 5;
}


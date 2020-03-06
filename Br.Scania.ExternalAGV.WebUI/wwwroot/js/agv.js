var map;
var device;
var width;
var height;
var x = "Total Width: " + screen.width;
var markerVectorPointLayer = [];
var listRoutePoints2 = [];

$(document).ready(function () {
    //CheckScreenSize();

    console.log(x);
    // Inicia o Mapa
    map = new ol.Map({
        //overlays: [overlay]
    });
    map.setTarget('mapAGV');
    var view = new ol.View({
        projection: 'EPSG:4326',
        center: [-46.567928, -23.713521],
        zoom: 0,
        maxResolution: 0.703125
    })
    map.setView(view);
    var tile_layer = new ol.layer.Tile({
        source: new ol.source.OSM({ layer: 'osm' })
    })

    // Inicia o Mapa em uma posição setada

    map.addLayer(tile_layer);
    map.getView().setZoom(16);

    //InitializeMap();
    GetRouteList();
    PointsOnMap();
    //$('#map').css({ 'height': height*0.8 });

});


$('#form-event').click(function (e) {

    var IDPointRoute = $('#selectPoint').val().split(";");


    $.ajax({
        url: 'http://humble-als.eu-west-1.elasticbeanstalk.com/api/ConfigPoints/TransferRouteToAGV?ID=' + IDPointRoute[1],
        type: "GET"
    }).done(function (data) {
        $("#encoded").html(data.encoded);
        alert("Points sent to the AMR!");


        var body = $("#bodyTabelaRoute").find("tbody");
        var startPoint = Number(body.find("#" + IDPointRoute[0]).find(".counter").text());
        
        if (startPoint > 0) {
            var totalPoints = Number($('#selectPoint').parent().parent().find("#counterTotal").text());

            for (i = startPoint - 1; i >= 0; i--) {

                var arr = body.find('#' + i).parent().find("#pointInf").text().split(";");

                var data = {
                    description: arr[0],
                    done: false,
                    lat: arr[1],
                    lng: arr[2],
                    velocity: 0,
                    leftlight: 0,
                    rightlight: 0,
                    sequence: 0,
                };

                $.ajax({
                    url: 'http://humble-als.eu-west-1.elasticbeanstalk.com/api/Points/TogglePoint',
                    dataType: 'json',
                    data: data,
                    type: "POST"
                }).done(function (data2) {
                    console.log("data2: " + JSON.stringify(data2));
                    PointsOnMap();
                    //GetRoutePoints()
                }).fail(function (xhr, status, error) {
                    $("#error").html("Could not reach the API: " + error);
                });

            }

        }
        else {
            PointsOnMap();
        }
    }).fail(function (xhr, Modal, error) {
        $("#error").html("Could not reach the API: " + error);
        $('#loader').hide();
    });

    

    $('.modal').modal('hide');

})


//$(window).resize(function () {
//    CheckScreenSize();
//});

function CheckScreenSize() {
    width = parseInt($(document).width());
    height = parseInt($(document).height());
    console.log(width);
    device = 'mobile';
    if (width >= 768) {
        console.log(1);
        device = 'Ipad';
    }
    if (width >= 1024) {
        console.log(2);
        device = 'Ipad';
    }
    if (width >= 1280) {
        console.log(3);
        device = 'smartTv';
    }
    if (width >= 2133) {
        console.log(4);
        device = 'pc';
    }


    console.log(device);
}



function GetRouteList() {
    $.ajax({
        url: "http://humble-als.eu-west-1.elasticbeanstalk.com/api/Route/GetAll",
        type: "GET"
    }).done(function (data) {
        $("#encoded").html(data.encoded);
        insertRow(data);
        $('.listRoute').click(function (e) {
            var ID = this.id;
            GetRoutePoints(ID, $(this).find('.label-' + ID).text());
        })
        $('.listRoute').dblclick(function (e) {

            var IdRoute = $(this).attr("id");
            content = $(".modal").find(".col-lg-7");
            var row = "";

            $.ajax({
                url: 'http://humble-als.eu-west-1.elasticbeanstalk.com/api/ConfigPoints/GetCompleteRoutesByID?ID=' + IdRoute,
                type: "GET",
            }).done(function (data) {
                row = '<p id="counterTotal" hidden>' + data.length + '</p>' +
                    '<br><select id="selectPoint" style="margin-bottom: 0px">';
                for (i = 0; i < data.length; i++) {
                    row += '<option value="' + data[i].id + ';' + IdRoute + ';' + '">' + data[i].description + '</option>';
                }
                row += '</select>';
                content.empty();
                content.append(row);
                $('.modal').modal('show');
            });

        })
    }).fail(function (xhr, Modal, error) {
        $("#error").html("Could not reach the API: " + error);
        $('#loader').hide();
    });
}


function insertRow(data) {
    var body = $("#bodyTabela").find("tbody");
    body.empty();
    for (i = 0; i < data.length; i++) {
        var row = '<tr class="listRoute" id="' + data[i].id + '">' +
            '<td id="idRoute" hidden>' + data[i].id + '</td>' +
            '<td class="label-' + data[i].id + '" id="' + data[i].id + '">' + data[i].description + '</td>' +
            '</tr>';
        body.append(row);
    }
}

function GetRoutePoints(ID, label) {
    $("#bodyTabelaRoute").find("tbody").empty();
    listRoutePoints = [];
    $.ajax({
        url: 'http://humble-als.eu-west-1.elasticbeanstalk.com/api/ConfigPoints/GetCompleteRoutesByID?ID=' + ID,
        type: "GET",
    }).done(function (data) {
        $("#encoded").html(data.encoded);
        //PointsOnMap(data);
        for (i = 0; i < data.length; i++) {
            var data2 = {
                id: data[i].id,
                description: data[i].description,
                lat: data[i].lat,
                lng: data[i].lng,
                velocity: data[i].velocity,
                leftlight: data[i].leftlight,
                rightlight: data[i].rightlight,
                icon: data[i].icon
            };
            listRoutePoints.push(data2);
        }
        listRoutePoints2 = listRoutePoints;
        insertConfigurededPointsRow(listRoutePoints);
        //ConfigMarkers.clearLayers();
        for (i = 0; i < listRoutePoints.length; i++) {
            insertMarkers(listRoutePoints[i]);
        }
        $("#bodyTabelaRoute").find("#label-route").empty();
        $("#bodyTabelaRoute").find("#label-route").append(label);

    }).fail(function (xhr, status, error) {
        $("#error").html("Could not reach the API: " + error);
    });
}

function insertConfigurededPointsRow(data) {
    var body = $("#bodyTabelaRoute").find("tbody");
    body.empty();
    for (i = 0; i < data.length; i++) {
        var row = '<tr class="tabelaRoute" id="' + data[i].id + '">' +
            '<td class="counter" id=' + i + ' hidden>' + i + '</td>' +
            '<td id="pointInf" hidden>' + data[i].description + ';' + data[i].lat + ';' + data[i].lng + '</td>' +
            '<td>' + data[i].description + '</td>' +
            "</tr>";
        body.append(row);
    }
}

function PointsOnMap() {

    $.ajax({
        url: 'http://humble-als.eu-west-1.elasticbeanstalk.com/api/Points/GetAll',
        type: "GET",
    }).done(function (data) {


        if (markerVectorPointLayer != null) {
            markerVectorPointLayer.forEach(function (item, index) {
                map.removeLayer(item);
            });
        }

        var pinLink = "https://i.imgur.com/efqIDjN.png";
        data.forEach(function (item, index) {

            var location = [convertDM2DMS(item.lng), convertDM2DMS(item.lat)];

            var iconNextPointGeometry = new ol.geom.Point(ol.proj.fromLonLat(location, 'EPSG:4326', 'EPSG:3857'));
            var iconNextPointFeature = new ol.Feature({
                geometry: iconNextPointGeometry
            });

            if (item.done == true) { pinLink = 'https://i.imgur.com/e2F3h70.png'; }
            else { pinLink = "https://i.imgur.com/efqIDjN.png";}
            
            var iconNextPointkStyle = new ol.style.Style({
                image: new ol.style.Icon(({
                    //anchor:[0.5, 1],
                    scale: 0.07,
                    opacity: 1,
                    src: pinLink
                }))
            });


            iconNextPointFeature.setStyle(iconNextPointkStyle);

            var vectorNextPointSource = new ol.source.Vector({
                features: [iconNextPointFeature]
            });

            markerVectorPointLayer[index] = new ol.layer.Vector({
                source: vectorNextPointSource,

            });
            map.addLayer(markerVectorPointLayer[index]);

        });

    });
    
}

function insertMarkers(data) {
    //var icon = L.icon({
    //    iconUrl: '/ExternalAGV/img/map_marker-orange.png',
    //    iconSize: 18, // size of the icon
    //    popupAnchor: [0, 0], // point from which the popup should open relative to the iconAnchor
    //    number: (data.ID)
    //});
    //if (data.lat !== null && data.lng !== null) {
    //    ConfigMarkers.addLayer(
    //        L.marker([convertDM2DMS(data.lat), convertDM2DMS(data.lng)], { icon: icon }).addTo(map)
    //    );
    //}
}

function convertDM2DMS(value) {
    var latArray = value.toString().split(".");
    var degree = parseFloat(latArray[0].substring(0, 3));
    var minute = parseFloat(latArray[0].substring(3, 5) + "." + latArray[1]) / 60;
    var ret;
    if (degree > 0) {
        ret = degree + minute;
    }
    else {
        ret = degree - minute;
    }
    return ret;
}
var map;
var markerVectorPointLayer = [];


var DELAY = 300,
    clicks = [],
    timer = null;
//var ConfigMarkers = L.layerGroup();
var clickMarker = 0;
var pointList = [];

var showPlaceTip = false;
var showMarkerTip = true;

var IDAGV = 1;
$(document).ready(function () {

    // Inicia o Mapa
    map = new ol.Map({
        //overlays: [overlay]
    });
    map.setTarget('mapPoints');
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


    GetConfigPoints(1);
    setInterval(function () {
        GetLastPosition(IDAGV);
    }, 1000);

});

function GetConfigPoints() {
    $.ajax({
        url: 'http://humble-als.eu-west-1.elasticbeanstalk.com/api/ConfigPoints/GetAll',
        type: "GET",
        success: function (events) {
            //ConfigMarkers.clearLayers();
        }
    }).done(function (data) {
        $("#encoded").html(data.encoded);
        $('#latValue').html(data.latitude);
        $('#lngValue').html(data.longitude);
        insertRow(data);
        $(".btn-update").click(function () {
            var updatepoint = {
                ID: this.id,
                Lat: $('#latValue').html(),
                Lng: $('#lngValue').html(),
                Description: "",
                icon: "",
                velocity: 0,
                leftlight: 0,
                rightlight: 0,

            };
            $.ajax({
                url: 'http://humble-als.eu-west-1.elasticbeanstalk.com/api/ConfigPoints/UpdatePoint',
                dataType: 'json',
                data: updatepoint,
                type: "POST"
            }).done(function (data) {
                GetConfigPoints();
                $("#encoded").html(data.encoded);
            }).fail(function (xhr, status, error) {
                $("#error").html("Could not reach the API: " + error);
            });
        });
        $(".btn-delete").click(function () {
            var id = this.id;
            $.ajax({
                url: 'http://humble-als.eu-west-1.elasticbeanstalk.com/api/ConfigPoints/Remove?ID=' + id,
                dataType: 'json',
                type: "Get"
            }).done(function (data) {
                GetConfigPoints();
                $("#encoded").html(data.encoded);
            }).fail(function (xhr, status, error) {
                $("#error").html("Could not reach the API: " + error);
            });
        });

    }).fail(function (xhr, status, error) {
        $("#error").html("Could not reach the API: " + error);
    });
}

function GetLastPosition(id) {
    $.ajax({
        url: 'http://humble-als.eu-west-1.elasticbeanstalk.com/api/LastPosition/GetAGVPosition?ID=' + id,
        type: "GET",
        success: function (events) {
            //ConfigMarkers.clearLayers();
        }
    }).done(function (data) {
        $("#encoded").html(data.encoded);
        $('#latValue').html(data.latitude);
        $('#lngValue').html(data.longitude);
        insertMarkers(data);
    }).fail(function (xhr, status, error) {
        $("#error").html("Could not reach the API: " + error);
    });
}

function InitializeMap() {
    //L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //    attribution: 'Autonomous Logistics Solutions'
    //}).addTo(map);
    //map.addLayer(legMarkers);
    //map.addLayer(ConfigMarkers);
}

function insertMarkers(data) {
    //var icon = L.icon({
    //    iconUrl: '/ExternalAGV/img/map_marker-orange-small.png',
    //    iconSize: 18, // size of the icon
    //    popupAnchor: [0, 0], // point from which the popup should open relative to the iconAnchor
    //    number: (data.ID)
    //});
    if (data.latitude !== null && data.longitude !== null) {
        //ConfigMarkers.addLayer(
        //    L.marker([convertDM2DMS(data.latitude), convertDM2DMS(data.longitude)], { icon: icon }).addTo(map)
        //        .bindPopup(data.latitude + " - " + data.longitude)
        //);
    }
}

function insertRow(data) {
    var body = $("#bodyTabela").find("tbody");
    body.empty();
    for (var i = 0; i < data.length; i++) {
        var lights = "error";
        var path = "Straight";
        if (data[i].leftLight == true && data[i].rightLight == true) { lights = "Left/Right"; }
        if ((data[i].leftLight == false && data[i].rightLight == false) || (data[i].leftLight == null && data[i].rightLight == null)) { lights = "--"; }
        if ((data[i].leftLight == true && data[i].rightLight == false) || (data[i].leftLight == true && data[i].rightLight == null)) { lights = "Left"; }
        if ((data[i].leftLight == false && data[i].rightLight == true) || (data[i].leftLight == null && data[i].rightLight == true)) { lights = "Right"; }
        if (data[i].onStraight == false || data[i].onStraight == null) { var path = "Turn"; }
        var row = '<tr id="' + data[i].id + '" class="btn-edit-list-' + data[i].id +'">' +
            '<td id="' + data[i].id + '"><center>' + data[i].description + '</center></td>' +
            '<td id="' + data[i].id + "LAT" + '"><center>' + data[i].lat + '</center></td>' +
            '<td id="' + data[i].id + "LON" + '"><center>' + data[i].lng + '</center></td>' +
            '<td id="' + data[i].id + '"><center>' + data[i].velocity + ' km/h</center></td>' +
            '<td id="' + data[i].id + '"><center>' + lights + '</center></td>' +
            '<td id="' + data[i].id + '"><center>' + path + '</center></td>' +
            '<td hidden id="' + data[i].id + '"><center>' + data[i].icon + '</center></td>' +
            "</tr>";
        body.append(row);

        $(".btn-edit-list-" + data[i].id).click(function () {

            var id = this.id;

            if (clicks[id] == null || clicks[id] == 0) { clicks[id] = 1; }
            else { clicks[id]++; }

            if (clicks[id] === 1) {

                timer = setTimeout(function () {

                    if (markerVectorPointLayer[id] != null) {
                        map.removeLayer(markerVectorPointLayer[id]);
                        markerVectorPointLayer[id] = null;
                        $(".btn-edit-list-" + id).css("background-color", "white");
                    }
                    else {
                        $.ajax({
                            url: 'http://humble-als.eu-west-1.elasticbeanstalk.com/api/ConfigPoints/GetByID?ID=' + id,
                            type: "GET",
                            success: function (events) {
                                //ConfigMarkers.clearLayers();
                            }
                        }).done(function (data) {
                            var location = [convertDM2DMS(data.lng), convertDM2DMS(data.lat)];

                            var iconNextPointGeometry = new ol.geom.Point(ol.proj.fromLonLat(location, 'EPSG:4326', 'EPSG:3857'));
                            var iconNextPointFeature = new ol.Feature({
                                geometry: iconNextPointGeometry
                            });


                            var iconNextPointkStyle = new ol.style.Style({
                                image: new ol.style.Icon(({
                                    //anchor:[0.5, 1],
                                    scale: 0.07,
                                    opacity: 1,
                                    src: 'https://i.imgur.com/efqIDjN.png'
                                }))
                            });


                            iconNextPointFeature.setStyle(iconNextPointkStyle);

                            var vectorNextPointSource = new ol.source.Vector({
                                features: [iconNextPointFeature]
                            });

                            markerVectorPointLayer[id] = new ol.layer.Vector({
                                source: vectorNextPointSource,

                            });
                            map.addLayer(markerVectorPointLayer[id]);

                            $(".btn-edit-list-" + id).css("background-color", "#D9E8EF"); //D9E8EF

                        });
                    }

                    clicks[id] = 0;  //after action performed, reset counter

                }, DELAY);

            } else {

                clearTimeout(timer);  //prevent single-click action
                $.ajax({
                    url: 'http://humble-als.eu-west-1.elasticbeanstalk.com/api/ConfigPoints/GetByID?ID=' + id,
                    type: "GET",
                    success: function (events) {
                        //ConfigMarkers.clearLayers();
                    }
                }).done(function (data) {
                    var straight = data.onStraight;
                    var turn = data.onStraight;
                    if (data.onStraight == null) {
                        straight = false;
                        turn = true;
                    }
                    $("#encoded").html(data.encoded);
                    $('#insert-event').html("Update");
                    $('#modal-id').val(data.id);
                    $('#modal-description').val(data.description);
                    $('#modal-lon').val(data.lng);
                    $('#modal-lat').val(data.lat);
                    $('#modal-velocity').val(data.velocity);
                    $('#modal-icon').val(data.icon);
                    $('#modal-rightlight').prop("checked", data.rightLight);
                    $('#modal-onstraight-straight').prop("checked", straight);
                    $('#modal-onstraight-turn').prop("checked", !turn);
                    $('#update-coord').prop("checked", false);
                    $('.modal').modal('show');

                    $("#modal-onstraight-straight").on('click', function () { $("#modal-onstraight-turn").prop("checked", false); })
                    $("#modal-onstraight-turn").on('click', function () { $("#modal-onstraight-straight").prop("checked", false); })

                    $('#update-coord').click(function (e) {
                        $('#modal-lon').val($('#lngValue').val());
                        $('#modal-lat').val($('#latValue').val());
                    })

                }).fail(function (xhr, status, error) {
                    $("#error").html("Could not reach the API: " + error);
                });

                clicks[id] = 0;  //after action performed, reset counter

            }

        })
            .dblclick(function (e) {
                e.preventDefault();  //cancel system double-click event
            });
        

    }

    



    $(".btn-edit-list").dblclick(function () {

    });
}


$("#btn-insert-point").click(function () {
    $('#modal-description').val("");
    $('#modal-velocity').val("");
    $('#modal-icon').val("marker-icon.png");
    $('#modal-leftlight').prop("checked", false);
    $('#modal-rightlight').prop("checked", false);
    $('#modal-onstraight-straight').prop("checked", true);
    $('#modal-onstraight-turn').prop("checked", false);
    $('#insert-event').html("Insert");
    $('.modal').modal('show');
});

$("#insert-event").click(function () {
    var insertpoint = {
        ID: $('#modal-id').val(),
        Velocity: $('#modal-velocity').val(),
        LeftLight: $('#modal-leftlight').prop('checked'),
        RightLight: $('#modal-rightlight').prop('checked'),
        OnStraight: $('#modal-onstraight-straight').prop("checked"),
        Lat: parseFloat($('#latValue').html()),
        Lng: parseFloat($('#lngValue').html()),
        Description: $('#modal-description').val(),
        icon: "marker-icon.png",
    };
    var url = 'http://humble-als.eu-west-1.elasticbeanstalk.com/api/ConfigPoints/Insert';
    if ($('#insert-event').html() == "Update") {
        url = 'http://humble-als.eu-west-1.elasticbeanstalk.com/api/ConfigPoints/Update';

        if (!$('#update-coord').prop('checked')) {
            insertpoint.Lng = parseFloat($('#' + insertpoint.ID + 'LON').html());
            insertpoint.Lat = parseFloat($('#' + insertpoint.ID + 'LAT').html());
        }

    }
    $.ajax({
        url: url,
        dataType: 'json',
        data: insertpoint,
        type: "POST"
    }).done(function (data) {
        GetConfigPoints();
        $('.modal').modal('hide');
        $("#encoded").html(data.encoded);
    }).fail(function (xhr, status, error) {
        $("#error").html("Could not reach the API: " + error);
        alert("Falha");
    });
});

$('#remove-event').click(function (e) {
    var command = $('#insert-event').html();
    if (command == 'Update') {
        var id = $('#modal-id').val();
        $.ajax({
            url: 'http://humble-als.eu-west-1.elasticbeanstalk.com/api/ConfigPoints/Remove?ID=' + id,
            type: "GET"
        }).done(function (data) {
            $("#encoded").html(data.encoded);
            GetConfigPoints();
            $('.modal').modal('hide');
        }).fail(function (xhr, Modal, error) {
            $("#error").html("Could not reach the API: " + error);
            $('#loader').hide();
        });
    }
})

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
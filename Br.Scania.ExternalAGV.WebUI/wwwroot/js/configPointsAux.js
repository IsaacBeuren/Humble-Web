var map = L.map;
var ConfigMarkers = L.layerGroup();
var clickMarker = 0;
var pointList = [];

var showPlaceTip = false;
var showMarkerTip = true;

var IDAGV = 1;




$(document).ready(function () {


    window.setInterval(function () {

        $.ajax({
            url: 'http://localhost/agvAPI/api/LastPosition/GetAll',
            type: "GET",
            success: function (response) {
                var obj = response[0];
                console.log(JSON.stringify(response));

                $.ajax({
                    url: 'http://agv-api.eu-west-1.elasticbeanstalk.com/api/LastPosition/Update',  //http://agv-api.eu-west-1.elasticbeanstalk.com/api/LastPosition/Update
                    dataType: 'json',
                    data: obj,
                    type: "POST"
                }).done(function (data) {
                    console.log(data);
                });
            }
        });

        //    $.ajax({
        //        url: 'http://localhost/agvAPI/api/Points/GetAll',
        //        type: "GET",
        //        success: function (response) {

        //            //for ()

        //            console.log("\n resp: " + JSON.stringify(response));

        //            var obj = response[0];

        //            $.ajax({
        //                url: 'http://localhost/agvAPI/api/Points/Update',  //http://agv-api.eu-west-1.elasticbeanstalk.com/api/LastPosition/Update
        //                dataType: 'json',
        //                data: obj,
        //                type: "POST"
        //            }).done(function (data) {
        //                console.log(data);
        //            });

        //        }
        //    });

        }, 1000);


});
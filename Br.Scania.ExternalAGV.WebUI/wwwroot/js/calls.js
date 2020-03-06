var user;

$(document).ready(function () {

    CallHumbleSystem();

});




function CallHumbleSystem() {


    var pointUpd = {
        id: 8204,
        description: "RJSHORT02",
        lat: -2342.7407658473662, // \left(,\right)
        lng: -4634.041924823644,
        velocity: 2,
        leftLight: false,
        rightLight: true,
        icon: "marker - icon.png",
        onStraight: false
    };

    $.ajax({
        url: 'http://humble-als.eu-west-1.elasticbeanstalk.com/api/ConfigPoints/DirectUpdate',
        dataType: 'json',
        data: pointUpd,
        type: "POST"
    }).done(function (data) {
        console.log("UPDATE: " + JSON.stringify(data));
    }).fail(function (xhr, status, error) {
        console.log("Could not reach the API: " + error);
    });


    //var position = {
    //    id: 1,
    //    latitude: 99,
    //    longitude: 99,
    //    UpdateTime: "2020-02-07 17:45:19.203",
    //    GPSQuality: 4,
    //    IDAGV: 1
    //};

    //$.ajax({
    //    url: 'http://humble-als.eu-west-1.elasticbeanstalk.com/api/LastPosition/Update',
    //    dataType: 'json',
    //    data: position,
    //    type: "POST"
    //}).done(function (data) {
    //    console.log("UPDATE: " + JSON.stringify(data));
    //}).fail(function (xhr, status, error) {
    //    console.log("Could not reach the API: " + error);
    //});



    $.ajax({
        url: 'http://humble-api.sa-east-1.elasticbeanstalk.com/api/Account/GenerateToken',
        type: "POST",
        data: { "username": "ssbibv", "password": "Q2FsaWZvcm5pYUAxMjM0" },  //ssbibv Q2FsaWZvcm5pYUAxMjM0
        success: function (data) {

            var expiration = new Date();
            expiration.setTime(data.Content.Expires);
            var issued = new Date();
            issued.setTime(data.Content.Issued);


            user = {
                AuthenticationType: data.Content.token_type,
                Expires: expiration,
                GlobalUserName: data.Content.GlobalUserName,
                Issued: issued, //Utils.ConvertSecToDate(data.Content.Issued),
                Roles: data.Content.Roles,
                UserName: data.Content.UserName,
                Token: data.Content.access_token,
                refresh_token: data.Content.RefreshToken,
            }



            console.log("data.content: " + JSON.stringify(data.Content));
            //amplify.store(("Humble" + "UserIdentity"), user)
            document.cookie = 'HumbleTokenExpAPI=TokenExp;path=/' + ';expires=' + expiration;

            $.ajax({
                crossDomain: true,
                headers: {
                    authorization: user.AuthenticationType + " " + user.Token,
                },
                contentType: "application/json; charset=utf-8",
                //value: "XMLHttpRequest',
                url: "http://humble-api.sa-east-1.elasticbeanstalk.com/api/Call/GetAllCallsOpenedByUser",
                dataType: 'json',
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log("Error: " + textStatus + ": " + errorThrown);

                    //if (jqXHR.status == 401) {
                    //    if (user.TimesToRefreshToken == 0)
                    //        self.RefreshToken();
                    //    else {
                    //        let expires = new Date(self.GetUser().Expires);
                    //        let now = new Date();
                    //        if (expires < now) {
                    //            self.ForceLogout();
                    //        }
                    //    }
                    //}

                    if (jqXHR.status == 404) {
                        console.log("Element not found (404).");
                    }

                    //if (errorFunction != null)
                    //    errorFunction(obj);
                },
                done: function (response) {
                    console.log("HUMBLE: " + JSON.stringify(response));
                },
                //beforeSend: function (obj) {
                //    // Refresh Token
                //    if (cacheUser.TimesToRefreshToken == 0) {
                //        let minBefore = 5;
                //        let expires = new Date(self.GetUser().Expires);
                //        let now = new Date();
                //        expires = new Date(expires.getTime() - (minBefore * 60 * 1000));
                //        if (expires <= now) {
                //            self.RefreshToken();
                //        }
                //    }

                //    if (beforeSendFunction != null)
                //        beforeSendFunction(obj);
                //},
                complete: function (response) {
                    console.log("Completed");

                    //console.log("HUMBLE: " + JSON.stringify(response));
                    console.log("Call: " + JSON.stringify(response));

                    //var date = new Date();
                    //response.responseJSON.Content[0].AcceptDate =
                    //    date.getFullYear() + '-' +
                    //    date.getMonth() + 1 + '-' +
                    //    date.getDate() + 'T' +
                    //    date.getHours() + ':' +
                    //    date.getMinutes() + ':' +
                    //    date.getSeconds() + "." + 
                    //    date.getMilliseconds();
                    //console.log("date: " + response.responseJSON.Content[0].AcceptDate);



                    //=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/





                    //=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/



                    //$.ajax({
                    //    crossDomain: true,
                    //    headers: {
                    //        authorization: user.AuthenticationType + " " + user.Token,
                    //    },
                    //    contentType: "application/json; charset=utf-8",
                    //    //value: "XMLHttpRequest',
                    //    url: "http://humble-api.sa-east-1.elasticbeanstalk.com/api/Call/GetAllCallsCollectedByUser",
                    //    dataType: 'json',
                    //    error: function (jqXHR, textStatus, errorThrown) {
                    //        console.log("Error: " + textStatus + ": " + errorThrown);

                    //        if (jqXHR.status == 404) {
                    //            console.log("Element not found (404).");
                    //        }
                    //    },
                    //    done: function (response) {
                    //        console.log("HUMBLE: " + JSON.stringify(response));
                    //    },

                    //    complete: function (response) {
                    //        console.log("Completed");
                    //        console.log("Call ACCEPTED: " + JSON.stringify(response));
                    //    }
                    //});


                    //=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/


                    //var dataTest =
                    //{
                    //    "IdRoute": 34,
                    //    "Geolocation": {
                    //        "Latitude": "-23.7147577",
                    //        "Longitude": "-46.5600783"
                    //    },
                    //    "ListCall": [
                    //        {
                    //            "IdCall": 18,
                    //            "OpenUser": "ssbibv",
                    //            "OpenLocation": null,
                    //            "OpenDate": "2019-10-30T15:43:28.637",
                    //            "AcceptUser": "ssbibv",
                    //            "AcceptLocation": "{\"Latitude\":\"-23.7127577\",\"Longitude\":\"-46.5690183\"}",
                    //            "AcceptDate": "2019-12-02T11:21:39.392Z",
                    //            "CollectLocation": "{\"Latitude\":\"-23.7137577\",\"Longitude\":\"-46.5600183\"}",
                    //            "CollectDate": "2019-12-02T18:08:17.777",
                    //            "CollectComments": null,
                    //            "DeliveryLocation": null,
                    //            "DeliveryDate": null,
                    //            "DeliveryComments": null,
                    //            "IdRoute": 34,
                    //            "IdBoxController": 30,
                    //            "ExecutionTime": "00:00:00"
                    //        }]
                    //}


                    //console.log("dwdw: " + user.AuthenticationType + " " + user.Token);

                    //$.ajax({
                    //    crossDomain: true,
                    //    headers: {
                    //        authorization: user.AuthenticationType + " " + user.Token,
                    //        'X-Requested-With': 'XMLHttpRequest'
                    //    },
                    //    //contentType: "application/json; charset=utf-8",
                    //    data: dataTest,
                    //    url: "http://humble-api.sa-east-1.elasticbeanstalk.com/api/Call/DeliveryCall",
                    //    dataType: 'json',
                    //    type: "POST",
                    //    error: function (jqXHR, textStatus, errorThrown) {
                    //        console.log("Error: " + textStatus + ": " + errorThrown);
                    //        if (jqXHR.status == 404) {
                    //            console.log("Element not found (404).");
                    //        }
                    //    },
                    //    done: function (response2) {
                    //        console.log("HUMBLE2: " + JSON.stringify(response2));
                    //    },
                    //    complete: function (response2) {
                    //        console.log("HUMBLE2: " + JSON.stringify(response2));
                    //    }
                    //});



                    //=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/

                    //var dataTest =
                    //{
                    //    "IdRoute": 34,
                    //    "Geolocation": {
                    //        "Latitude": "-23.7137577",
                    //        "Longitude": "-46.5600183"
                    //    },
                    //    "ListCall": [
                    //        {
                    //            "IdCall": 18,
                    //            "OpenUser": "ssbibv",
                    //            "OpenLocation": null,
                    //            "OpenDate": "2019-10-30T15:43:28.637",
                    //            "AcceptUser": "ssbibv",
                    //            "AcceptLocation": "{\"Latitude\":\"-23.7127577\",\"Longitude\":\"-46.5690183\"}",
                    //            "AcceptDate": "2019-12-02T11:21:39.392Z",
                    //            "CollectLocation": null,
                    //            "CollectDate": null,
                    //            "CollectComments": null,
                    //            "DeliveryLocation": null,
                    //            "DeliveryDate": null,
                    //            "DeliveryComments": null,
                    //            "IdRoute": 34,
                    //            "IdBoxController": 30,
                    //            "ExecutionTime": "00:00:00"
                    //        }]
                    //}


                    //console.log("dwdw: " + user.AuthenticationType + " " + user.Token);

                    //$.ajax({
                    //    crossDomain: true,
                    //    headers: {
                    //        authorization: user.AuthenticationType + " " + user.Token,
                    //        'X-Requested-With': 'XMLHttpRequest'
                    //    },
                    //    //contentType: "application/json; charset=utf-8",
                    //    data: dataTest,
                    //    url: "http://humble-api.sa-east-1.elasticbeanstalk.com/api/Call/CollectCall",
                    //    dataType: 'json',
                    //    type: "POST",
                    //    error: function (jqXHR, textStatus, errorThrown) {
                    //        console.log("Error: " + textStatus + ": " + errorThrown);
                    //        if (jqXHR.status == 404) {
                    //            console.log("Element not found (404).");
                    //        }
                    //    },
                    //    done: function (response2) {
                    //        console.log("HUMBLE2: " + JSON.stringify(response2));
                    //    },
                    //    complete: function (response2) {
                    //        console.log("HUMBLE2: " + JSON.stringify(response2));
                    //    }
                    //});


                    //=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/

                    //$.ajax({
                    //    url: 'http://humble-api.sa-east-1.elasticbeanstalk.com/api/Call/AcceptCall',
                    //    dataType: 'json',
                    //    data: response.responseJSON.Content[0],
                    //    type: "POST"
                    //}).done(function (data) {
                    //    console.log("Acceptcall: " + JSON.stringify(data));
                    //}).fail(function (xhr, status, error) {
                    //    console.log("Could not reach the API: " + error);
                    //});

                    var calls = [];
                    for (i = 0; i < response.responseJSON.Content.length; i++) {

                        //if (response.responseJSON.Content[i].OpenUser.toUpperCase() == "ssbibv" || response.responseJSON.Content[i].OpenUser.toUpperCase() == "SSBIBV") {
                        calls[i] = {
                            "id": response.responseJSON.Content[i].IdRoute,
                            "destination": response.responseJSON.Content[i].Box.OriginSector.Factory.Description,
                            "description": response.responseJSON.Content[i].Box.Description
                        }
                        //}
                    }

                    insertRow(calls);
                    




                    //var route = {
                    //    id: 4031,
                    //    description: "ROUTEALERT",
                    //    routes: "true;false;true;true;25;",
                    //    pickUpPoint: null,
                    //    dropPoint: null
                    //}

                    //$.ajax({
                    //    url: 'http://humble-als.eu-west-1.elasticbeanstalk.com/api/Route/UpdateRoute',
                    //    dataType: 'json',
                    //    data: route,
                    //    type: "POST"
                    //}).done(function (data) {
                    //    console.log("UPDATE: " + JSON.stringify(data));
                    //}).fail(function (xhr, status, error) {
                    //    console.log("Could not reach the API: " + error);
                    //});





                    $('.startRoute').click(function () {

                        var id = $(this).parent().parent().parent().find("#callID").val();

                        var dataTest = {
                            "IdRoute": id,
                            "Geolocation": {
                                "Latitude": "-2342.7209551399869",
                                "Longitude": "-4633.9087623746418"
                            }
                        }
                        console.log("dwdw: " + user.AuthenticationType + " " + user.Token);

                        $.ajax({
                            crossDomain: true,
                            headers: {
                                authorization: user.AuthenticationType + " " + user.Token,
                                'X-Requested-With': 'XMLHttpRequest'
                            },
                            //contentType: "application/json; charset=utf-8",
                            data: dataTest,
                            url: "http://humble-api.sa-east-1.elasticbeanstalk.com/api/Call/AcceptCall",
                            dataType: 'json',
                            type: "POST",
                            error: function (jqXHR, textStatus, errorThrown) {
                                console.log("Error: " + textStatus + ": " + errorThrown);
                                if (jqXHR.status == 404) {
                                    console.log("Element not found (404).");
                                }
                            },
                            done: function (response2) {

                            },
                            complete: function (response2) {
                                console.log("HUMBLE2: " + JSON.stringify(response2));

                                setTimeout(function () {

                                    CallHumbleSystem();

                                    //$.ajax({
                                    //    crossDomain: true,
                                    //    headers: {
                                    //        authorization: user.AuthenticationType + " " + user.Token,
                                    //    },
                                    //    contentType: "application/json; charset=utf-8",
                                    //    value: "XMLHttpRequest',
                                    //    url: "http://humble-api.sa-east-1.elasticbeanstalk.com/api/Call/GetAllCallsOpenedByUser",
                                    //    dataType: 'json',
                                    //    error: function (jqXHR, textStatus, errorThrown) {
                                    //        console.log("Error: " + textStatus + ": " + errorThrown);


                                    //        if (jqXHR.status == 404) {
                                    //            console.log("Element not found (404).");
                                    //        }
                                    //    },
                                    //    done: function (response) {
                                    //        console.log("HUMBLE: " + JSON.stringify(response));
                                    //    },
                                    //    complete: function (response) {
                                    //        console.log("Completed dqwdqwd ");
                                    //        console.log("Call: " + JSON.stringify(response));

                                    //        calls = [];
                                    //        for (i = 0; i < response.responseJSON.Content.length; i++) {

                                    //            if (response.responseJSON.Content[i].OpenUser.toUpperCase() == "ssbibv" || response.responseJSON.Content[i].OpenUser.toUpperCase() == "SSBIBV") {
                                    //            calls[i] = {
                                    //                "id": response.responseJSON.Content[i].IdRoute,
                                    //                "destination": response.responseJSON.Content[i].Box.OriginSector.Factory.Description,
                                    //                "description": response.responseJSON.Content[i].Box.Description
                                    //            }
                                    //            }
                                    //        }

                                    //        insertRow(calls);
                                    //    }
                                    //});

                                }, 2000);
                            }
                        });


                        //var call = {
                        //    ID: 1,
                        //    IDAGV: 1,
                        //    IDRoute: $(this).parent().parent().find("#routeID").val(),
                        //    InitTime: null,
                        //    EndTime: null,
                        //    CarriedItem: $('#listItem' + $(this).parent().parent().find("#callID").val()).find('.description').text(),
                        //    CUCode: $(this).parent().parent().find("#callID").val()
                        //}

                        //console.log("call: " + JSON.stringify(call));

                        //$.ajax({
                        //    url: 'http://10.251.13.80/agvAPI/api/Calls/Insert',
                        //    dataType: 'json',
                        //    data: call,
                        //    type: "POST"
                        //}).done(function (data) {
                        //    console.log("data encoded: " + JSON.stringify(data));
                        //}).fail(function (xhr, status, error) {
                        //    console.log("Could not reach the API: " + error);
                        //    alert("Falha");
                        //});



                        $.ajax({
                            url: 'http://humble-als.eu-west-1.elasticbeanstalk.com/api/Config/UpdateStartById?ID=1&Start=true',
                            type: "POST"
                        }).done(function (data) {
                            console.log("resp: " + JSON.stringify(data));
                            //alert("Starting...");
                        }).fail(function (xhr, Modal, error) {
                            alert("Failed to connect");
                        });
                    });


                    //if (completeFunction != null)
                    //    completeFunction(obj);
                },
                //always: function () {
                //    if (alwaysFunction != null)
                //        alwaysFunction(obj);
                //},
            });


        }
    });

}

function insertRow(data) {
    var bodyCode = $("#tableCode").find("tbody");
    bodyCode.empty();

    console.log("length: " + data.length);

    data.forEach(function (item, index) {
        console.log("data: " + JSON.stringify(item));

        var route = "";
        var routeID = 0;
        //switch (item.destination) {
        //    case "P26":
        //        route = "EIXO_NEW";
        //        routeID = 1020;
        //        break;
        //    default:
        //        route = "Rota inexistente"
        //        routeID = 0;
        //}

        var row = '<tr class="listCode" id="listCode-' + item.id + '">' +
            '<td><center>' + item.id + '</center></td>' +
            '<td><center>' + item.destination + '</center></td>' +
            '<td class="description"><center>' + item.description + '</center></td>' +
            '<input type="hidden" id="callID" value="' + item.id + '"></input>' +
            '<input type="hidden" id="routeID" value="' + 4029 + '"></input>' +
            '<td> <center><input class="startRoute" type="submit" value="Start" style="marin: 0"></center> </td>' +
            '</tr>';
        bodyCode.append(row);


        //$.ajax({
        //    url: 'http://humble-als.eu-west-1.elasticbeanstalk.com/api/Route/GetAGVByID?ID='+,
        //    type: "POST"
        //}).done(function (data) {
        //    console.log("resp: " + JSON.stringify(data));
        //    //alert("Starting...");
        //}).fail(function (xhr, Modal, error) {
        //    alert("Failed to connect");
        //});
    });
}
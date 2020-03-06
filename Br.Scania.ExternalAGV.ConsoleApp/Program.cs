using System;
using Br.Scania.ExternalAGV.Model;
using Br.Scania.ExternalAGV.Business;
using Br.Scania.ExternalAGV.Model.DataBase;
using CoordinateSharp;
using Microsoft.Extensions.Configuration;
using System.IO;
using System.IO.Ports;
using System.Diagnostics;
using System.Text;
using System.Net;
using System.Collections.Generic;
using Newtonsoft.Json;
using System.Net.Http;
using System.Collections.Specialized;

namespace Br.Scania.ExternalAGV.ConsoleApp
{
    class Program
    {
        static int AGVID = Convert.ToInt16(1);
        static LastPositionBusiness lastPositionBusiness = new LastPositionBusiness();
        static CoordinatesBusiness coordinatesBusiness = new CoordinatesBusiness();
        static PointsBusiness points = new PointsBusiness();
        static Coordinate last_but_one;
        static bool Stopped;
        static bool MoreThanOne;
        static PointsModel nextPoint = new PointsModel();
        static NmeaBusiness nmea = new NmeaBusiness();
        static PlcBusiness plc = new PlcBusiness();
        static FilterBusiness filter = new FilterBusiness();
        static ConfigModel configAGV;
        static bool Write2PLC = false;
        static NlogBusiness nlog = new NlogBusiness();
        static PointsModel pointModel;

        static ConfigPointsBusiness configPointsBusiness = new ConfigPointsBusiness();
        static int counter = 0;
        static StringBuilder csv = new StringBuilder();
        static StringBuilder csv2 = new StringBuilder();
        static int route;
        static string pickUpPoint;
        static string dropPoint;
        static ConfigBusiness configBusiness = new ConfigBusiness();
        static bool run = false;
        static bool button = false;
        static string newLine = "";
        static int rest = 0;
        static bool startAPI = false;
        static int pointCounter = 0;

        static CallsBusiness callsBusiness = new CallsBusiness();
        static CallsModel callsModel = new CallsModel();
        static RouteBusiness routeBusiness = new RouteBusiness();
        static List<PointsModel> pointList = new List<PointsModel>();
        static string pointsString;
        static string routeString;
        static int counterToStart = 0;
        static bool reset = false;
        static string time1 = "";
        static string time2 = "";
        static string time3 = "";
        static string time4 = "";
        static string timeTotal = "";
        static double distance = 999;
        static bool pointSwitch = false;
        static double angleCounter = 0;
        static string key;
        static int counterAux = 0;
        static bool lostThePoint = false;

        private static readonly HttpClient client = new HttpClient();

        //static PerformanceCounter cpuCounter = new PerformanceCounter("Processor", "% Processor Time", "_Total");
        //static PerformanceCounter ramCounter = new PerformanceCounter("Memory", "Available MBytes");
        //static ManagementObjectSearcher searcher = new ManagementObjectSearcher(@"root\WMI", "SELECT * FROM MSAcpi_ThermalZoneTemperature");

        static void Main(string[] args)
        {
            try
            {

                //Console: ponto - qualidade da antenna - processamento - temperatura contCONSOLE
                //PLC: anguloREAL - velocidadeREAL - contPLC
                //começa a contar a partir do run

                //nlog.Write("Reading appsettings.json");


                var builder = new ConfigurationBuilder()
                    .SetBasePath(Path.Combine(AppContext.BaseDirectory))
                    .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true);

                IConfigurationRoot configuration = builder.Build();

                int AGVID = Convert.ToInt16(configuration.GetSection("AGV").GetSection("ID").Value);
                string Token = configuration.GetSection("Token").GetSection("ID").Value;
                Write2PLC = Convert.ToBoolean(configuration.GetSection("PLC").GetSection("Write").Value);
                int SerialPort = Convert.ToInt16(configuration.GetSection("GPS").GetSection("SerialPort").Value);

                nlog.Write("Write PLC =" + Write2PLC + " AGVID: " + AGVID);


                //callsModel = callsBusiness.GetById(1);
                //Console.Write("Call: " + callsModel.CarriedItem);

                //CallsModel c = new CallsModel();

                //c.IDAGV = 55;
                //c.IDRoute = 1234;
                //c.initTime = null;
                //c.endTime = null;
                //c.CarriedItem = "TEST";
                //c.CUCode = 12;
                //c = callsBusiness.Insert(callsModel);


                //DateTime date = DateTime.Now;
                //string format = "yyyy-MM-dd HH:mm:ss";
                //callsModel.initTime = date.ToString(format);
                //callsModel.endTime = date.ToString(format);
                //callsModel = callsBusiness.Update(callsModel);


                //Console.Write("dqwdqw");
                //Console.ReadKey();

                //bool repeat = true;

                //while (repeat)
                //{

                //    Console.WriteLine("Update DB? s/n");

                //    key = Console.ReadKey().Key.ToString();
                //    if (key == "s" || key == "S")
                //    {

                //        try
                //        {
                //            pointsString = new WebClient().DownloadString("http://agv-api.eu-west-1.elasticbeanstalk.com/api/ConfigPoints/GetAll");

                //            List<ConfigPointsModel> configPointsList = configPointsBusiness.GetAll();
                //            foreach (var config in configPointsList) { configPointsBusiness.RemoveById(config.ID); }
                //            configPointsList = JsonConvert.DeserializeObject<List<ConfigPointsModel>>(pointsString);
                //            foreach (var config in configPointsList) { configPointsBusiness.DirectInsert(config); }
                //            pointsString = new WebClient().DownloadString("http://agv-api.eu-west-1.elasticbeanstalk.com/api/Route/GetAll");
                //            List<RouteModel> routeList = routeBusiness.GetAll();
                //            foreach (var route in routeList) { routeBusiness.RemoveById(route.ID); }
                //            routeList = JsonConvert.DeserializeObject<List<RouteModel>>(pointsString);
                //            foreach (var route in routeList)
                //            {
                //                route.ID = 0;
                //                routeBusiness.Insert(route);
                //            }
                //            Console.WriteLine("\nDone!");
                //            repeat = false;
                //        }
                //        catch (Exception ex)
                //        {
                //            Console.WriteLine("\nError api: " + ex.ToString());
                //            repeat = true;
                //        }
                //    }
                //    else
                //    {
                //        repeat = false;
                //    }

                //}


                Console.WriteLine("\nAWS (1)  Local (2)");

                key = Console.ReadKey().Key.ToString();

                if (key == "D1")
                {
                    try
                    {
                        points.RemoveAll();
                        pointsString = new WebClient().DownloadString("http://agv-api.eu-west-1.elasticbeanstalk.com/api/Points/GetAll");
                        pointList = JsonConvert.DeserializeObject<List<PointsModel>>(pointsString);
                        foreach (var point in pointList) { points.Insert(point); }
                        //routeString = new WebClient().DownloadString("http://agv-api.eu-west-1.elasticbeanstalk.com/api/Route/GetAGVByID?ID=" + pointList[0].IDRoute);
                        //pickUpPoint = JsonConvert.DeserializeObject<RouteModel>(routeString).PickUpPoint.Replace(" ", "");
                        //dropPoint = JsonConvert.DeserializeObject<RouteModel>(routeString).DropPoint.Replace(" ", ""); ;
                    }
                    catch
                    {
                        Console.Clear();
                    }
                }
                else
                {
                    pointsString = new WebClient().DownloadString("http://localhost/agvAPI/api/Points/GetAll");
                    pointList = JsonConvert.DeserializeObject<List<PointsModel>>(pointsString);

                    route = pointList[0].IDRoute;

                    pickUpPoint = "";//routeBusiness.GetById(route).PickUpPoint.Replace(" ", "");
                    dropPoint = ""; //routeBusiness.GetById(route).DropPoint.Replace(" ", "");
                }

                foreach (var point in pointList)
                {
                    if (point.Done == true) { pointCounter++; }
                    else { break; }
                }

                Console.ReadKey();

                //HttpWebRequest WebReq = (HttpWebRequest)WebRequest.Create(string.Format("http://agv-api.eu-west-1.elasticbeanstalk.com/api/Config/UpdateStartById?ID=" + AGVID + "&Start=false"));

                //WebReq.Method = "POST";

                //HttpWebResponse WebResp = (HttpWebResponse)WebReq.GetResponse();

                //string jsonString;
                //using (Stream stream = WebResp.GetResponseStream())
                //{
                //    StreamReader reader = new StreamReader(stream, Encoding.UTF8);
                //    jsonString = reader.ReadToEnd();
                //    //List<Item> items = JsonConvert.DeserializeObject<List<Item>>(jsonString);

                //    //Console.WriteLine(items.Count);   
                //}
                //Console.WriteLine(jsonString);

                //Console.WriteLine("Waiting for confirmation...");

                //while (startAPI == false)
                //{
                //    string configString = new WebClient().DownloadString("http://agv-api.eu-west-1.elasticbeanstalk.com/api/Config/GetAGVByID?ID=" + AGVID);

                //    configAGV = JsonConvert.DeserializeObject<ConfigModel>(configString);

                //    startAPI = Convert.ToBoolean(configAGV.Start);

                //}





                try
                {
                    nextPoint = pointList[pointCounter];
                    Console.WriteLine("\nNextPoint: " + nextPoint.Description);
                }
                catch
                {
                    nlog.Write("Rota completada");
                    nextPoint = null;
                    Console.WriteLine("NextPoint: null");
                }

                Console.Write("\nP: " + pickUpPoint);
                Console.Write("\nD: " + dropPoint);


                //nlog.Write("Reading AGV settings in SQL");

                //if (configAGV != null)
                //{
                //nlog.Write("AGV settings read successful");
                try
                {
                    SerialPortBusiness serialPort = new SerialPortBusiness();

                    bool portOK = serialPort.CheckSerialPort("COM" + SerialPort);

                    if (portOK)
                    {
                        nlog.Write("Serial port was found");
                        SerialPort mySerialPort = new SerialPort("COM" + SerialPort);

                        mySerialPort.BaudRate = Convert.ToInt32(configuration.GetSection("GPS").GetSection("BaudRate").Value);
                        mySerialPort.Parity = (Parity)Enum.Parse(typeof(Parity), configuration.GetSection("GPS").GetSection("Parity").Value);
                        mySerialPort.StopBits = (StopBits)Enum.Parse(typeof(StopBits), configuration.GetSection("GPS").GetSection("StopBits").Value);
                        mySerialPort.DataBits = Convert.ToInt16(configuration.GetSection("GPS").GetSection("DataBits").Value);
                        mySerialPort.Handshake = (Handshake)Enum.Parse(typeof(Handshake), configuration.GetSection("GPS").GetSection("Handshake").Value);
                        mySerialPort.RtsEnable = Convert.ToBoolean(configuration.GetSection("GPS").GetSection("RtsEnable").Value);

                        mySerialPort.DataReceived += new SerialDataReceivedEventHandler(DataReceivedHandler);

                        //nlog.Write("Trying opening Serial port");
                        mySerialPort.Open();
                        Console.WriteLine("\n\nWaiting for GPS data...");

                        //LastPositionModel lastPositionToSend = new LastPositionModel();
                        //PointsModel pointsToSend = new PointsModel();

                        //while (true)
                        //{
                        //    lastPositionToSend = lastPositionBusiness.GetById(AGVID);

                        //    using (var wb = new WebClient())
                        //    {
                        //        var data = new NameValueCollection();
                        //        data["ID"] = lastPositionToSend.ID.ToString();
                        //        data["Latitude"] = lastPositionToSend.Latitude.ToString();
                        //        data["Longitude"] = lastPositionToSend.Longitude.ToString();
                        //        data["UpdateTime"] = lastPositionToSend.UpdateTime.ToString();
                        //        data["GPSQuality"] = lastPositionToSend.GPSQuality.ToString();
                        //        data["IDAGV"] = lastPositionToSend.IDAGV.ToString();

                        //        var response = wb.UploadValues("http://agv-api.eu-west-1.elasticbeanstalk.com/api/LastPosition/Update", "POST", data);
                        //        string responseInString = Encoding.UTF8.GetString(response);
                        //    }

                        //    //using (var wb = new WebClient())
                        //    //{
                        //    //    var data = new NameValueCollection();
                        //    //    data["ID"] = pointsToSend. ID.ToString();
                        //    //    data["Latitude"] = lastPositionToSend.Latitude.ToString();
                        //    //    data["Longitude"] = lastPositionToSend.Longitude.ToString();
                        //    //    data["UpdateTime"] = lastPositionToSend.UpdateTime.ToString();
                        //    //    data["GPSQuality"] = lastPositionToSend.GPSQuality.ToString();
                        //    //    data["IDAGV"] = lastPositionToSend.IDAGV.ToString();

                        //    //    var response = wb.UploadValues("http://agv-api.eu-west-1.elasticbeanstalk.com/api/LastPosition/Update", "POST", data);
                        //    //    string responseInString = Encoding.UTF8.GetString(response);
                        //    //    Console.WriteLine("Response: " + response);
                        //    //    Console.ReadKey();
                        //    //}

                        //    var status = plc.ReadStatusPLC();



                        //}

                        Console.ReadKey();
                        mySerialPort.Close();
                    }
                    else
                    {
                        nlog.Write("Serial Port not found");
                    }
                }
                catch (Exception ex)
                {
                    // NLog: catch any exception and log it.
                    nlog.Error(ex, "1");
                    Console.WriteLine("Serial Port Fault...");
                }
                finally
                {
                    // Ensure to flush and stop internal timers/threads before application-exit (Avoid segmentation fault on Linux)
                    nlog.Shutdown();
                }

                //}
            }
            catch (Exception ex)
            {
                // NLog: catch any exception and log it.
                nlog.Error(ex, "2");
                throw;
            }
            finally
            {
                // Ensure to flush and stop internal timers/threads before application-exit (Avoid segmentation fault on Linux)
                nlog.Shutdown();
            }

        }

        static bool isBusy = false;
        static string msgAscII = "";

        private static void DataReceivedHandler(object sender, SerialDataReceivedEventArgs e)
        {

            timeTotal = "T1: " + time1 + "ms  T2: " + time2 + "ms  T3: " + time3 + "ms  T4: " + time4 + "ms";

            nlog.Write(" isBusy: " + isBusy.ToString() + " " + counter.ToString());
            if (isBusy)
            {
                nlog.Write("Retornou");
                return;
            }

            isBusy = true;

            try
            {
                string[] result = null;
                SerialPort sp = (SerialPort)sender;

                if (msgAscII.Length < 88)
                {
                    msgAscII = msgAscII + sp.ReadExisting();
                }
                else
                {
                    time1 = "0";
                    time2 = "0";
                    time3 = "0";

                    result = msgAscII.Split("$G");
                    msgAscII = "";
                    NMEAModel nmea = new NMEAModel();
                    NmeaBusiness nmeaBusiness = new NmeaBusiness();

                    foreach (string item in result)
                    {

                        if (item.Length > 5)
                        {
                            string ret = "";
                            try
                            {
                                ret = item.Substring(1, item.Length - 1);
                            }
                            catch (Exception ex)
                            {
                                nlog.Error(ex, "3");
                            }
                            string Header = ret.Substring(0, 3);

                            if (Header == "GGA")
                            {
                                Stopwatch stopwatch1 = new Stopwatch();
                                stopwatch1.Start();

                                //nlog.Write("GGA protocol successfully received");
                                GGAModel ggaModel = nmeaBusiness.ConvertNmea2GGA(ret);
                                if (ggaModel != null)
                                {
                                    msgAscII = "";
                                }
                                //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

                                GGAModel gga = filter.ApplyFilter(ggaModel);
                                //nlog.Write("GGA protocol filter successfully applied");



                                var status = plc.ReadStatusPLC();

                                //nlog.Write("Trying update last coordinates");
                                DateTime utcDate = DateTime.UtcNow;
                                LastPositionModel lastPosition = new LastPositionModel();
                                lastPosition.IDAGV = AGVID;
                                lastPosition.Latitude = Convert.ToDouble(gga.Latitude);
                                lastPosition.Longitude = Convert.ToDouble(gga.Longitude);
                                lastPosition.UpdateTime = utcDate;
                                lastPosition.GPSQuality = Convert.ToInt32(gga.GPS_Quality_indicator);
                                lastPosition.VelocityTraction = status.VelocityTraction;
                                if (status.BT_Load == true && (pointModel.Description == pickUpPoint || pointModel.Description == dropPoint))
                                {
                                    lastPosition.BT_Load = true;
                                }
                                lastPosition.LeftScanner = status.LeftScanner;
                                lastPosition.RightScanner = status.RightScanner;
                                lastPosition.LiddarScanner = status.LiddarScanner;
                                lastPosition.VehicleRun = status.VehicleRun;
                                lastPositionBusiness.Update(lastPosition);
                                //nlog.Write("Last coordinates successfully update");

                                //Actual GPS Position 
                                nlog.Write("Getting actual/last position, calculating course to upadate ");
                                Coordinate coordinateActual = new Coordinate();
                                coordinateActual = coordinatesBusiness.DegreeDecimalMinute2Coordinate(gga.Latitude, gga.Longitude);

                                //Last GPS Position
                                //nlog.Write("Getting last position");
                                Coordinate coordinateLastest = new Coordinate();
                                coordinateLastest = last_but_one;

                                //nlog.Write("Calculating  course");
                                Distance course = coordinatesBusiness.Calculating_Distance(coordinateActual, coordinateLastest);

                                //nlog.Write("Updating last position");
                                last_but_one = coordinateActual;


                                Commands2PLCModel commands = new Commands2PLCModel();

                                //nlog.Write("nextpoint: " + nextPoint.Lat);
                                //nlog.Write("Course: " + course.Meters);


                                stopwatch1.Stop();
                                nlog.Write("TIME1: " + stopwatch1.ElapsedMilliseconds);
                                time1 = stopwatch1.ElapsedMilliseconds.ToString();

                                stopwatch1.Reset();




                                if (nextPoint != null && nextPoint.Lat != 0 && course != null && reset == false)
                                {

                                    Stopwatch stopwatch2 = new Stopwatch();
                                    stopwatch2.Start();


                                    nlog.Write("Convert actual coordinates");
                                    Coordinate coordinateDestination = new Coordinate();

                                    coordinateDestination = coordinatesBusiness.DegreeDecimalMinute2Coordinate(nextPoint.Lat, nextPoint.Lng);

                                    nlog.Write("Calculating angle between actual point and destination");
                                    Distance distance2Destination = coordinatesBusiness.Calculating_Distance(coordinateDestination, coordinateActual);


                                    try
                                    {
                                        pointModel = pointList[pointCounter - 1];
                                    }
                                    catch { pointModel = null; }





                                    if (pointModel != null)
                                    {
                                        try
                                        {

                                            if (pointModel.Description == pickUpPoint || pointModel.Description == dropPoint)
                                            {
                                                nlog.Write(" StopPoint " + pointModel.Description);
                                                run = false;
                                                if (status.BT_Load == true && pointModel.Description == dropPoint)
                                                {
                                                    nlog.Write(" ButtonUnload True ");
                                                    button = true;
                                                }
                                                if (status.BT_Load == true && pointModel.Description == pickUpPoint)
                                                {
                                                    nlog.Write(" ButtonLoad True ");
                                                    button = true;
                                                }
                                            }
                                            else
                                            {
                                                run = true;
                                                button = false;
                                            }

                                            if (button == true) { run = true; }

                                            commands.EnableAuto = Convert.ToBoolean(run);
                                            commands.LeftLight = Convert.ToBoolean(pointModel.LeftLight);
                                            commands.RightLight = Convert.ToBoolean(pointModel.RightLight);
                                            commands.Velocity = Convert.ToInt16(pointModel.Velocity);
                                            commands.OnStraight = Convert.ToBoolean(pointModel.OnStraight);
                                            commands.Counter = Convert.ToInt16(counter);

                                        }
                                        catch (Exception ex)
                                        {
                                            nlog.Error(ex, "DB error ");
                                        }

                                    }
                                    else
                                    {
                                        nlog.Write("Searching for the route");
                                        commands.EnableAuto = true;
                                        commands.LeftLight = false;
                                        commands.RightLight = false;
                                        commands.Velocity = 2;
                                        commands.OnStraight = false;
                                        commands.Counter = Convert.ToInt16(counter);
                                    }


                                    double angle = coordinatesBusiness.AngularCalculation(course.Bearing, distance2Destination.Bearing);
                                    commands.RealDegree = Convert.ToInt32(angle * 100);

                                    string aux = "dif: " + Math.Abs(distance - distance2Destination.Meters).ToString();


                                    try
                                    {
                                        if (distance2Destination.Meters <= 2.5 && commands.OnStraight == true)
                                        {

                                            if (distance < distance2Destination.Meters && Math.Abs(distance - distance2Destination.Meters) > 0.01 && Convert.ToBoolean(status.ManualEnabled) == false)
                                            {
                                                lostThePoint = true;
                                            }

                                            if (angle > 2 || angle < -2) { angle = 2 * ((angle) / Math.Abs(angle)); }
                                        }

                                    }
                                    catch (Exception ex)
                                    {
                                        // NLog: catch any exception and log it.
                                        nlog.Error(ex, "Filter error");
                                    }

                                    distance = distance2Destination.Meters;
                                    counterAux = pointCounter;

                                    try
                                    {
                                        if (distance2Destination.Meters <= 1.5 || lostThePoint == true)
                                        {
                                            //nlog.Write("Locking for the next destination");

                                            if (points.PostPointDone(nextPoint))
                                            {
                                                //Write2PLC = false;
                                                pointCounter++;
                                                try
                                                {
                                                    nextPoint = pointList[pointCounter];
                                                    pointSwitch = true;

                                                    string lostPoint = "";
                                                    if (lostThePoint == true)
                                                    {
                                                        lostThePoint = false;
                                                        lostPoint = "   (LOST THE POINT)";

                                                    }
                                                    Console.WriteLine("\n Next point " + nextPoint.Description + ". Now at " + pointList[pointCounter - 1].Velocity.ToString() + "km/h  " + lostPoint);
                                                }
                                                catch { nextPoint = null; }
                                                //nlog.Write("Next destination was found");
                                            }
                                            else
                                            {
                                                commands.EnableAuto = false;
                                                nlog.Write("Next destination not found");
                                            }
                                        }
                                        //else
                                        //{
                                        //    Write2PLC = true;
                                        //}
                                    }
                                    catch (Exception ex)
                                    {
                                        // NLog: catch any exception and log it.
                                        nlog.Error(ex, "4");
                                    }

                                    if (course != null)
                                    {
                                        //Console.WriteLine(course.Meters);
                                        if (course.Meters >= 0.000)
                                        {
                                            //Console.WriteLine(course.Meters);
                                            if (MoreThanOne)
                                            {
                                                try
                                                {
                                                    // Aplica tratamento entre Angulos
                                                    if (pointList[pointCounter - 1].OnStraight == true && pointSwitch == true && false) //ATENTION FALSE
                                                    {
                                                        int angleCounterAux = Convert.ToInt32(angleCounter);
                                                        if (angle > angleCounterAux || angle < -angleCounterAux) { angle = angleCounterAux * ((angle) / (Math.Abs(angle))); }

                                                        angleCounter = angleCounter + 0.49;

                                                        if (angleCounter > 2.5)
                                                        {
                                                            angleCounter = 0;
                                                            pointSwitch = false;
                                                        }
                                                    }
                                                }
                                                catch
                                                {
                                                    nlog.Write("Searching for the route");
                                                }


                                                commands.Degree = Convert.ToInt32(angle * 100);
                                                Stopped = false;

                                                Console.Write("GPS Quality - " + nmeaBusiness.GetGPSQualityIndicator(gga.GPS_Quality_indicator));
                                                Console.Write(" // Satelites - " + gga.Number_of_SVs_in_use);
                                                Console.Write("  // Distance to " + nextPoint.Description + " - " + distance2Destination.Meters);
                                                Console.WriteLine(" // Angle - " + angle);
                                                Console.Write("    Count - " + counter);
                                                Console.WriteLine(" // Console Cycle - " + timeTotal);
                                                Console.Write(aux);
                                                Console.WriteLine("  // Enable Auto: " + commands.EnableAuto);
                                                Console.Write(" OnStraight: " + pointList[pointCounter - 1].OnStraight);
                                                Console.WriteLine("  //  Velocity: " + pointList[pointCounter - 1].Velocity);



                                                if (pointModel != null)
                                                {
                                                    try
                                                    {
                                                        newLine = String.Format("{0},{1},{2},{3},{4},{5},{6}", utcDate.ToString(),
                                                                                                    (counter).ToString(),
                                                                                                    Convert.ToString(pointModel.Velocity),
                                                                                                    angle,
                                                                                                    Convert.ToString(pointModel.Description),
                                                                                                   (nmeaBusiness.GetGPSQualityIndicator(gga.GPS_Quality_indicator)).ToString(),
                                                                                                   (gga.Number_of_SVs_in_use).ToString());

                                                    }
                                                    catch (Exception ex)
                                                    {
                                                        nlog.Error(ex, "DB error ");
                                                    }
                                                }
                                                else
                                                {
                                                    newLine = String.Format("{0},{1},{2},{3},{4},{5},{6}", utcDate.ToString(),
                                                                                                (counter).ToString(),
                                                                                               "NOP",
                                                                                               angle,
                                                                                               "NOP",
                                                                                               (nmeaBusiness.GetGPSQualityIndicator(gga.GPS_Quality_indicator)).ToString(),
                                                                                               (gga.Number_of_SVs_in_use).ToString());
                                                }

                                                csv.AppendLine(newLine);

                                                newLine = String.Format("{0},{1},{2},{3}", "",//status.AngleDirection.ToString(),
                                                                                       "",//status.VelocityTraction.ToString(),
                                                                                       "",//status.CounterSystem.ToString(),
                                                                                       "");

                                                csv2.AppendLine(newLine);
                                                Math.DivRem(counter, 500, out rest);

                                                if (rest == 0)
                                                {
                                                    File.AppendAllText("C:\\ExternalAGV\\Console_CSVFile.csv", csv.ToString());
                                                    File.AppendAllText("C:\\ExternalAGV\\PLC_CSVFile.csv", csv2.ToString());
                                                    csv.Clear();
                                                    csv2.Clear();
                                                }
                                            }
                                            MoreThanOne = true;
                                        }
                                        else
                                        {
                                            Console.WriteLine(course.Meters);
                                            if (!Stopped)
                                            {
                                                Console.WriteLine("AGV stopped");
                                            }
                                            commands.Degree = 0;
                                            Stopped = true;
                                        }
                                    }


                                    if (Write2PLC)
                                    {
                                        //nlog.Write("Starting PLC writing");
                                        bool retPLC = plc.WriteCommandsPLC(commands);

                                        if (!retPLC)
                                        {
                                            Console.WriteLine("Falha Escrita PLC");
                                            nlog.Write("Fault PLC writing");
                                        }
                                        //else
                                        //{
                                        //    nlog.Write("PLC writing successfully");
                                        //}
                                    }
                                    else
                                    {
                                        nlog.Write("PLC writing not enabled");
                                    }

                                    stopwatch2.Stop();
                                    nlog.Write("TIME2: " + stopwatch2.ElapsedMilliseconds);
                                    time2 = stopwatch2.ElapsedMilliseconds.ToString();
                                    stopwatch2.Reset();

                                }
                                else
                                {

                                    Stopwatch stopwatch3 = new Stopwatch();

                                    stopwatch3.Start();

                                    Console.Write("\n\nENTROU T3\n\n");

                                    commands.EnableAuto = false;
                                    commands.LeftLight = false;
                                    commands.RightLight = false;
                                    commands.Velocity = 3;

                                    if (Write2PLC)
                                    {
                                        //nlog.Write("Starting PLC writing");
                                        bool retPLC = plc.WriteCommandsPLC(commands);

                                        if (!retPLC)
                                        {
                                            Console.WriteLine("Falha Escrita PLC");
                                            nlog.Write("Fault PLC writing");
                                        }
                                        //else
                                        //{
                                        //    nlog.Write("PLC writing successfully");
                                        //}
                                    }
                                    else
                                    {
                                        nlog.Write("PLC writing not enabled");
                                    }

                                    if (nextPoint != null)
                                    {
                                        nlog.Write("Destination => Latitude:" + nextPoint.Lat + " - Longitude:" + nextPoint.Lng);
                                        //Console.WriteLine("Please, select a valid route!");
                                    }
                                    else
                                    {
                                        //Console.Clear();

                                        Console.WriteLine("\nEnd of the route\n\n");
                                        reset = true;
                                        counterToStart = counter - 1;
                                        pointCounter = 0;
                                        configBusiness.UpdateStartById(AGVID, false);
                                        Console.WriteLine("Reseting...");

                                        points.ResetRoute();
                                        pointsString = "";
                                        pointsString = new WebClient().DownloadString("http://localhost/agvAPI/api/Points/GetAll");
                                        pointList = JsonConvert.DeserializeObject<List<PointsModel>>(pointsString);

                                        nextPoint = pointList[pointCounter];
                                        Console.WriteLine("Next Point: " + pointList[pointCounter].Description);

                                    }
                                    if (course == null)
                                    {
                                        nlog.Write("Course is null");
                                        Console.WriteLine("Please, move the AGV!");
                                    }

                                    stopwatch3.Stop();
                                    nlog.Write("TIME3: " + stopwatch3.ElapsedMilliseconds);
                                    time3 = stopwatch3.ElapsedMilliseconds.ToString();
                                    stopwatch3.Reset();

                                }


                            }

                            if (Header == "GST")
                            {
                                GSTModel gstModel = nmeaBusiness.ConvertNmea2GST(ret);
                                //Console.WriteLine(JsonConvert.SerializeObject(gstModel));
                            }

                            if (Header == "ZDA")
                            {
                                ZDAModel zdaModel = nmeaBusiness.ConvertNmea2ZDA(ret);
                                //Console.WriteLine(JsonConvert.SerializeObject(zdaModel));
                            }



                        }

                    }
                }
            }
            catch (Exception ex)
            {
                nlog.Error(ex, "GPS Reader");
            }
            finally
            {

                Stopwatch stopwatch4 = new Stopwatch();
                stopwatch4.Start();

                isBusy = false;
                counter++;

                nlog.Write(" === fim2 ===");

                Math.DivRem(counter - counterToStart, 20, out rest);

                if (reset == true && rest == 0)
                {
                    string configString = new WebClient().DownloadString("http://agv-api.eu-west-1.elasticbeanstalk.com/api/Config/GetAGVByID?ID=" + AGVID);

                    configAGV = JsonConvert.DeserializeObject<ConfigModel>(configString);

                    startAPI = Convert.ToBoolean(configAGV.Start);

                    if (startAPI == true)
                    {
                        reset = false;
                        configBusiness.UpdateStartById(AGVID, true);
                        Console.WriteLine("\nStarting...\n");
                    }
                }
                stopwatch4.Stop();
                nlog.Write("TIME4: " + stopwatch4.ElapsedMilliseconds);
                time4 = stopwatch4.ElapsedMilliseconds.ToString();
                stopwatch4.Reset();

            }

            nlog.Write(" === fim3 ===");
        }

    }

}
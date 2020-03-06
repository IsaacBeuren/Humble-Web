using System;

namespace Br.Scania.ExternalAGV.Model.DataBase
{
    public partial class LastPositionModel
    {
        public int ID { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public DateTime UpdateTime { get; set; }
        public int GPSQuality { get; set; }
        public int IDAGV { get; set; }
        //public double VelocityTraction { get; set; }
        //public bool BT_Load { get; set; }
        //public bool RightScanner { get; set; }
        //public bool LeftScanner { get; set; }
        //public bool LiddarScanner { get; set; }
        //public bool VehicleRun { get; set; }
    }
}

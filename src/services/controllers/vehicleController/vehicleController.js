const axios = require("axios");
const db = require("../../../models");
var ObjectId = require("mongodb").ObjectId;

module.exports = {
  addController: async (req, res) => {
    try {
      const checkCustomer = await db.Customer.findById(req.body.id);

      if (!checkCustomer)
        return res
          .status(409)
          .json({ success: false, msg: "Account doesn't exist" });

      const d = {
        RegistrationPlate: req.body.RegistrationPlate,
        licence: req.body.licence,
        model: req.body.model,
        make: req.body.make,
        coulor: req.body.coulor,
        customer: req.body.id,
      };
      const vehicle = await db.Car.create(d);
      await vehicle.save();
      res
        .status(200)
        .json({ success: true, msg: "Vehicle added successfully" });
    } catch (err) {
      res.status(500).json({ success: false, msg:err.message });
    }
  },

  getController: async (req, res) => {
    try {
      // GET request
      console.log(
        `https://uk1.ukvehicledata.co.uk/api/datapackage/MotHistoryAndTaxStatusData?v=2&api_nullitems=1&auth_apikey=${process.env.UKVD_API}&key_VRM=${req.body.registrationPlate}`
      );
      const response = await axios.get(
        `https://uk1.ukvehicledata.co.uk/api/datapackage/MotHistoryAndTaxStatusData?v=2&api_nullitems=1&auth_apikey=${process.env.UKVD_API}&key_VRM=${req.body.registrationPlate}`
      );

      const propertyValues = Object.values(response.data);
      const ukvehicledata = propertyValues[3].DataItems.VehicleDetails;

      if(!ukvehicledata) return res.status(409).json({success:false, msg:"Vehicle not found"});

      res.status(200).json({
        success: true,
        msg: "Vehicle found",
        VehicleDetails: ukvehicledata,
      });
    } catch (err) {
      res.status(500).json({ success: false, msg:err.message });
    }
  },

  getCarController: async (req, res) => {
    try {
      const { id } = req.body;
      const vehicle = await db.Car.find({ customer: new ObjectId(id) });
      if (!vehicle)
        return res
          .status(403)
          .json({ success: false, msg: "Vehicle doesn't exist" });

      res.status(200).json({
        success: true,
        msg: "Vehicle fetched successfully!",
        vehicle: vehicle,
      });
    } catch (err) {
      res.status(500).json({ success: false, msg: err.message });
    }
  },
  
  getCarDetailController: async (req, res) => {
    const id = req.params.id;
    try {
      const car = await db.Car.find({
        _id: id,
      });
      res.status(200).json({
        success: true,
        msg: `Car Details for ${req.params.id} fetched successfully`,
        car: car,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ success: false, msg: err.message });
    }
  },

  getCarByIdController :  async (req, res) => {
    try{
      const id= req.body.id;
      const vehicle = await db.Car.findById(new ObjectId(id));
      if(!vehicle) return res.status(403).json({success: false, msg:"Invalid car's id"});

      res.status(200).json({success: true, msg: "Vehicle fetched successfully!", vehicle: JSON.parse(JSON.stringify(vehicle)) });

    } catch(err) {
        res.status(500).json({ success: false, msg: err.message })
      }
  },

  updateCarController :  async (req, res) => {
    try{
      const id= req.body.id;
      const update = await db.Car.findOneAndUpdate( {"_id": new ObjectId(id)}, { RegistrationPlate: req.body.RegistrationPlate, licence: req.body.licence, model: req.body.model, make: req.body.make, coulor: req.body.coulor});

      if(!update) return res.status(403).json({success: false, msg:"Vehicle doesn't exist"});

      res.status(200).json({success: true, msg: "Vehicle updated successfully!" });
    } catch(err) {
      res.status(500).json({ success: false, msg: err.message })
    }
  },
};

const db = require("../../../models");

module.exports = {
  addController: async (req, res) => {
    try {
      const d = {
        serviceName: req.body.serviceName,
        price: req.body.price,
        startTimeOfDays: req.body.startTimeOfDays,
        endTimeOfDays: req.body.endTimeOfDays,
        duration: req.body.duration,
        allService: req.body.allService,
        description: req.body.description,
      };
      const service = await db.Service.create(d);
      console.log("service", service);
      await service.save();
      res
        .status(200)
        .json({ success: true, msg: "Service added successfully" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ success: false, msg: err.message });
    }
  },

  //get listService
  listService: async (req, res) => {
    try {
      const services = await db.Service.find({});
      console.log("Service fetched successfully", services);
      res.status(200).json({
        success: true,
        msg: "Service fetched successfully",
        services: services,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ success: false, msg: err.message });
    }
  },

  findService: async (req, res) => {
    try {
      const { id } = req.body;
      const service = await db.Service.find({ _id: id });
      console.log("service", service);
      if (!service)
        return res
          .status(403)
          .json({ success: false, msg: "Service not found" });
      res
        .status(200)
        .json({ success: true, msg: "Service found", service: service });
    } catch (err) {
      res.status(500).json({ success: false, msg: err.message });
    }
  },
};

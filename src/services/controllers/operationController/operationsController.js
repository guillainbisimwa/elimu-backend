const db = require("../../../models");
const moment = require("moment-timezone");
const slotController = require("../slotController/slotController");

module.exports = {
  onlyOneTimeInitialRun: async (req, res) => {
    try {
      const defaultEntry = {
        isDefault: true,
        startDate: "",
        endDate: moment
          .utc()
          .set({ hour: 23, minute: 0, second: 0, millisecond: 0 })
          .add("3", "M"),
        startTimeOfDay: 6,
        endTimeOfDay: 18,
        bookingsAllowedPerSlot: 4,
      };
      const defaultOperation = await db.operation.create(defaultEntry);
      console.log("defaultEntry Operations", defaultEntry);
      await defaultOperation.save();
      await slotController.onlyOneTimeInitialRun(req, res);
      res
        .status(200)
        .json({ success: true, msg: "Default Operation added successfully" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ success: false, msg: err.message });
    }
  },
  
  updateOperations: async (req, res) => {
    try {
      if (req.body.updateOnlyDefault) {
        const defaultOperationValues = await db.operation
          .findOne({ isDefault: true })
          .then((doc) => {
            doc.bookingsAllowedPerSlot = req.body.bookingsPerSlot;
            doc.startTimeOfDay = req.body.startTime;
            doc.endTimeOfDay = req.body.endTime;
            console.log("doc", doc);
            return doc;
          });

        const defaultOperation = await db.operation.create(
          defaultOperationValues
        );
        // await defaultOperation.save();
        await slotController.updateDefaultSlots(req, res);
      } else {
        if (req.body.isDefault) {
          const defaultOperationValues = await db.operation
            .findOne({ isDefault: true })
            .then((doc) => {
              doc.bookingsAllowedPerSlot = req.body.bookingsPerSlot;
              doc.startTimeOfDay = req.body.startTime;
              doc.endTimeOfDay = req.body.endTime;
              console.log("doc", doc);
              return doc;
            });

          const defaultOperation = await db.operation.create(
            defaultOperationValues
          );
          // await defaultOperation.save();
          await slotController.updateDefaultSlots(req, res);
        }
        const newEntry = {
          isDefault: false,
          startDate: moment.utc(req.body.startDate, "YYYYMMDD").toDate(),
          endDate: moment.utc(req.body.endDate, "YYYYMMDD").toDate(),
          startTimeOfDay: req.body.startTime,
          endTimeOfDay: req.body.endTime,
          bookingsAllowedPerSlot: req.body.bookingsPerSlot,
        };
        const newOperationEntry = await db.operation.create(newEntry);
        console.log("defaultEntry Operations", newEntry);
        // await newOperationEntry.save();
        slotController.updateSlots(req, res);
      }
      res
        .status(200)
        .json({ success: true, msg: "Operation completed successfully" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ success: false, msg: err.message });
    }
  },
  getDefaultTiming: async (req, res) => {
    try {
      const defaultTiming = await db.operation.findOne({ isDefault: true });
      res.status(200).json({
        success: true,
        msg: "Default Timing fetched successfully",
        operation: defaultTiming,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ success: false, msg: err.message });
    }
  },
};

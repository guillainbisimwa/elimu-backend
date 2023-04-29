const db = require("../../../models");
const moment = require("moment-timezone");

module.exports = {
  onlyOneTimeInitialRun: async (req, res) => {
    console.log("slot onlyOneTimeInitialRun");
    try {
      const tempArr = [];
      const operationData = await db.operation.find({ isDefault: true });
      const a = moment.utc();
      const b = moment.utc().add("3", "M");
      const days = b.diff(a, "days");
      console.log("days", days);
      for (let i = 0; i < days; i++) {
        let date = moment.utc();
        date.set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).add(i, "d");
        let isDefault = true;
        console.log("operationsData", operationData);
        let slotsAvailable = operationData[0].bookingsAllowedPerSlot;
        let slotsLeft = slotsAvailable;
        let defaultStartTimeOfDay = operationData[0].startTimeOfDay;
        let defaultEndTimeOfDay = operationData[0].endTimeOfDay;
        let tempStartTime = 5;
        let tempEndTime = 23;
        for (let j = 0; j < tempEndTime - tempStartTime; j++) {
          let startTime = moment.utc(date).set({
            hour: tempStartTime + j,
            minute: 0,
            second: 0,
            millisecond: 0,
          });
          let endTime = moment.utc(date).set({
            hour: tempStartTime + j + 1,
            minute: 0,
            second: 0,
            millisecond: 0,
          });

          let entry = {
            isDefault,
            startTime,
            endTime,
            slotsAvailable,
            isEnabled:
              startTime.hour() < defaultStartTimeOfDay ||
              startTime.hour() >= defaultEndTimeOfDay
                ? false
                : true,
            slotsLeft,
          };
          tempArr.push(entry);
        }
      }
      const slots = await db.slot.insertMany(tempArr);
      console.log("slots", tempArr);
      // res.status(200).json({
      //   success: true,
      //   msg: "First 3 Months slot entries added successfully",
      // });
    } catch (err) {
      console.log(err);
      res.status(500).json({ success: false, msg: err.message });
    }
  },
  updateDefaultSlots: async (req, res) => {
    try {
      const operationData = await db.operation.findOne({ isDefault: true });
      console.log("operationData", operationData);
      console.log("body", req.body);
      const updateStartDate = moment
        .utc()
        .set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
      // const updateEndDate = moment
      //   .utc(req.body.endDate, "YYYYMMDD")
      //   .set({ hour: 0, minute: 0, second: 0, millisecond: 0 });

      let slotsAvailable = operationData.bookingsAllowedPerSlot;
      let defaultStartTimeOfDay = operationData.startTimeOfDay;
      let defaultEndTimeOfDay = operationData.endTimeOfDay;

      const modified = await db.slot
        .find({
          startTime: {
            $gte: updateStartDate.toDate(),
            // $lte: updateEndDate.toDate(),
          },
          isDefault: true,
        })
        .then((doc) => {
          doc.forEach((ele) => {
            moment.utc(ele.startTime).hour() < defaultStartTimeOfDay ||
            moment.utc(ele.startTime).hour() >= defaultEndTimeOfDay
              ? (ele.isEnabled = false)
              : (ele.isEnabled = true);

            const temp = slotsAvailable - ele.slotsAvailable + ele.slotsLeft;
            console.log("temp", temp);
            ele.slotsLeft = temp; // < 0 ? 0 : temp;
            ele.slotsAvailable = operationData.bookingsAllowedPerSlot;
          });
          return doc;
        });
      const updateDefaultSlots = await db.slot.create(modified);
      // await updateDefaultSlots.save();
      // res.status(200).json({
      //   success: true,
      //   msg: "Modified all the Default slots",
      // });
    } catch (err) {
      console.log(err);
      res.status(500).json({ success: false, msg: err.message });
    }
  },
  updateSlots: async (req, res) => {
    try {
      console.log("body", req.body);
      const updateStartDate = moment
        .utc(req.body.startDate, "YYYYMMDD")
        .set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
      const updateEndDate = moment
        .utc(req.body.endDate, "YYYYMMDD")
        .set({ hour: 0, minute: 0, second: 0, millisecond: 0 });

      let slotsAvailable = req.body.bookingsPerSlot;
      let startTimeOfDay = req.body.startTime;
      let endTimeOfDay = req.body.endTime;

      const modified = await db.slot
        .find({
          startTime: {
            $gte: updateStartDate.toDate(),
            $lte: updateEndDate.toDate(),
          },
        })
        .then((doc) => {
          doc.forEach((ele) => {
            moment.utc(ele.startTime).hour() < startTimeOfDay ||
            moment.utc(ele.startTime).hour() >= endTimeOfDay
              ? (ele.isEnabled = false)
              : (ele.isEnabled = true);

            const temp = slotsAvailable - ele.slotsAvailable + ele.slotsLeft;
            ele.slotsLeft = temp; // < 0 ? 0 : temp;
            ele.slotsAvailable = req.body.bookingsPerSlot;
            ele.isDefault = false;
          });
          return doc;
        });
      const updateSlots = await db.slot.create(modified);
      // await updateSlots.save();
      console.log("modified", modified);

      // const slots = await db.slot.insertMany(tempArr);
      // console.log("slots", tempArr);
      // res.status(200).json({
      //   success: true,
      //   msg: "Modified all the slots",
      // });
    } catch (err) {
      console.log(err);
      res.status(500).json({ success: false, msg: err.message });
    }
  },
  getSlotAvailability: async (req, res) => {
    try {
      const slots = await db.slot.find({
        startTime: {
          $gte: moment
            .utc(req.params.date, "YYYYMMDD")
            .set({ hour: 0, minute: 0, second: 0, millisecond: 0 }),
          $lte: moment
            .utc(req.params.date, "YYYYMMDD")
            .add(1, "d")
            .set({ hour: 0, minute: 0, second: 0, millisecond: 0 }),
        },
        isEnabled: true,
      });
      res.status(200).json({
        success: true,
        msg: "slots fetched successfully",
        slots: slots,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ success: false, msg: err.message });
    }
  },
  editBookingsPerHourForEachSlotOfDate: async (req, res) => {
    try {
      //finding the slots of the given date
      const slots = await db.slot
        .find({
          startTime: {
            $gte: moment
              .utc(req.body.date, "YYYYMMDD")
              .set({ hour: 0, minute: 0, second: 0, millisecond: 0 }),
            $lte: moment
              .utc(req.body.date, "YYYYMMDD")
              .add(1, "d")
              .set({ hour: 0, minute: 0, second: 0, millisecond: 0 }),
          },
        })
        .then((data) => {
          /*editing the slots availability based on bookings per hours of each slot in the req. */

          const startTimesOfReq = Object.keys(req.body.slotsDetail);
          //iterating on all the slot entries for that particular date in database
          data.forEach((slot, i) => {
            slot.isEnabled = false;
            //iterating on each slot start time given in the req
            startTimesOfReq.forEach((slotBookingPerHour) => {
              //checking if the slot start time is matching in the requirement and database and then editing slots available and slots left
              if (
                moment.utc(slot.startTime).hour() == Number(slotBookingPerHour)
              ) {
                const tempSlotLeft =
                  req.body.slotsDetail[slotBookingPerHour] -
                  slot.slotsAvailable +
                  slot.slotsLeft;
                slot.slotsLeft = tempSlotLeft;
                slot.slotsAvailable = Number(
                  req.body.slotsDetail[slotBookingPerHour]
                );
                slot.isDefault = false;
                slot.isEnabled = true;
                console.log(slotBookingPerHour, data[i]);
              }
            });
          });
          return data;
        });
      await db.slot.create(slots);
      res.status(200).json({
        success: true,
        msg: "Edited individual Bookings per Hour successfully for given date",
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ success: false, msg: err.message });
    }
  },
};

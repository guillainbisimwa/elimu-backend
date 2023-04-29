const db = require("../../../models");
const moment = require("moment-timezone");
const axios = require("axios");
var ObjectId = require("mongodb").ObjectId;

module.exports = {
  addController: async (req, res) => {
    try {
      const d = {
        ref: req.body.ref,
        customer: req.body.userId,
        address: req.body.address,
        date: req.body.date,
        endTime: req.body.endTime,
        latitude: req.body.latitude,
        location: req.body.location,
        longitude: req.body.longitude,
        notes: req.body.notes,
        postCode: req.body.postCode,
        promocode: req.body.promocode,
        service: req.body.service,
        startTime: req.body.startTime,
        vechile: req.body.vechile,
        status: req.body.status,
        //paymentStatus: req.body.paymentStatus,
        //rider: req.body.rider,
      };

      const booking = await db.Booking.create({
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        promocode: req.body.promocode,
        car: req.body.vechile,
        customer: req.body.userId,
        service: req.body.service,
        date: req.body.date,
        //rider: req.body.rider
      });
      const updateSlotLeft = await db.slot
        .findOne({
          startTime: {
            $gte: moment.utc(req.body.date).set({
              hour: req.body.startTime.split(":")[0],
              minute: 0,
              second: 0,
              millisecond: 0,
            }),
            $lt: moment.utc(req.body.date).set({
              hour: req.body.endTime.split(":")[0],
              minute: 0,
              second: 0,
              millisecond: 0,
            }),
          },
        })
        .then((slotDetail) => {
          console.log("slotDetail", slotDetail);
          slotDetail.slotsLeft -= 1;
          return slotDetail;
        });
      await db.slot.create(updateSlotLeft);
      await booking.save();

      const service = await db.Service.find({ _id: d.service });

      const today = moment();
      var first = moment(d.date, "YYYYMMDD").fromNow();
      var second = moment(today.format(), "YYYYMMDD").fromNow();

      const formattedToday = moment().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
      const formattedTodayDate = moment(d.date, "YYYYMMDD").format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
      const formattedDatePlusOne = moment(d.date, "YYYYMMDD").add(2,'days').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');

      //Add to GSM TASKS
      const task = {
        external_id: booking._id.valueOf(),
        reference: d.ref,
        barcodes: [d.customer],
        account:
          "https://api.gsmtasks.com/accounts/040967e8-a52d-4436-80f0-77b153c783fa/",
        category: "assignment",
        contact: {
          name: "Splasheroo",
          company: "Splasheroo Tech",
          phones: ["+243841550213"],
          emails: ["splasheroo.tech@gmail.com"],
          notes: d.notes,
        },
        address: {
          raw_address: d.address,
          formatted_address: d.location,
          location: {
            type: "Point",
            coordinates: [d.longitude, d.latitude],
          },
          google_place_id: "",
          point_of_interest: "",
          street: "",
          house_number: "",
          apartment_number: "",
          city: "",
          state: "",
          postal_code: d.postCode,
          country: "United Kingdom",
          country_code: "UK",
        },
        // contact_address: "",
        // contact_address_external_id: "",
        description: service[0].serviceName,
        complete_after: formattedToday,
        complete_before: formattedDatePlusOne,
        scheduled_time: formattedTodayDate,
        auto_assign: first == second,
        //position: d.date,
        // priority: -2147483648,
        // duration: "4 10:55:34.12", service[0]duration
        duration: "0:59",
        // size: [
        //   -2147483648
        // ],
      };

     // console.log("task", task);

      const headers = {
        // Authorization: `Token ${process.env.GSMTASKS_API}`,
        Accept: "application/json; version=2.4.15",
        "Content-Type": "application/json",
        Authorization: "Token f69d6f61840fb92efc24b0267abb47a34a7657a9",
      };

      await axios
        .post("https://api.gsmtasks.com/tasks/", task, { headers: headers })
        .then((response) => {
          return res.status(200).json({
            success: true,
            msg: "Booking added successfully",
            task: { ...booking._doc, ...response.data },
          });
        })
        .catch((error) => {
          //console.log(error);
          return res.status(500).json({ success: false, msg: error.message });
        });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ success: false, msg: err.message });
    }
  },

  //get All Bookings
  listBookings: async (req, res) => {
    try {
      await db.Booking.find()
        .populate(["service", "customer", "car", "promoCode", "rider"])
        .then(async (booking) => {
          // Fetch from GSMTASKS
          const headers = {
            // Authorization: `Token ${process.env.GSMTASKS_API}`,
            Accept: "application/json; version=2.4.15",
            "Content-Type": "application/json",
            Authorization: "Token f69d6f61840fb92efc24b0267abb47a34a7657a9",
          };

          await axios
            .get("https://api.gsmtasks.com/tasks/", { headers: headers })
            .then((response) => {
              var fullTasks = [];
              response.data.map((task) => {
                const foundBooking = booking.find(
                  (val) => val._id.valueOf() === task.external_id
                );

                if (
                  foundBooking?._id.valueOf() !== undefined &&
                  task.external_id === foundBooking._id.valueOf()
                ) {
                  fullTasks.push({ ...foundBooking._doc, ...task });
                }
              });

              return res.status(200).json({
                success: true,
                msg: "Bookings fetched successfully",
                fullTasks,
              });
            })
            .catch((error) => {
              console.log(error);
              return res
                .status(500)
                .json({ success: false, msg: error.message });
            });
        })
        .catch((err) => {
          console.log(err);
          return res.status(500).json({ success: false, msg: err.message });
        });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ success: false, msg: err.message });
    }
  },

  listBookingsByCustomer: async (req, res) => {
    try {
      const id = req.params.id;
      await db.Booking.find({ customer: new ObjectId(id) })
        .populate(["service", "customer", "car", "promoCode", "rider"])
        .then(async (booking) => {
          // Fetch from GSMTASKS
          const headers = {
            // Authorization: `Token ${process.env.GSMTASKS_API}`,
            Accept: "application/json; version=2.4.15",
            "Content-Type": "application/json",
            Authorization: "Token f69d6f61840fb92efc24b0267abb47a34a7657a9",
          };

          await axios
            .get("https://api.gsmtasks.com/tasks/", { headers: headers })
            .then((response) => {
              var fullTasks = [];
              response.data.map((task) => {
                const foundBooking = booking.find(
                  (val) => val._id.valueOf() === task.external_id
                );

                if (
                  foundBooking?._id.valueOf() !== undefined &&
                  task.external_id === foundBooking._id.valueOf()
                ) {
                  fullTasks.push({ ...foundBooking._doc, ...task });
                }
              });

              return res.status(200).json({
                success: true,
                msg: "Bookings fetched successfully",
                fullTasks,
              });
            })
            .catch((error) => {
              console.log(error);
              return res
                .status(500)
                .json({ success: false, msg: error.message });
            });
        })
        .catch((err) => {
          console.log(err);
          return res.status(500).json({ success: false, msg: err.message });
        });
    } catch (err) {
      console.log(err);
      res.status(500).json({ success: false, msg: err.message });
    }
  },

  listBookingsByDate: async (req, res) => {
    const queriedDate = moment.utc(req.params.date, "YYYYMMDD").format();
    let nextDate = moment(queriedDate).toDate();
    nextDate.setDate(new Date(queriedDate).getDate() + 1);
    nextDate = moment.utc(nextDate).format();
    try {
      await db.Booking.find({
        date: {
          $gte: new Date(queriedDate),
          $lt: new Date(nextDate),
        },
      })
        .populate(["service", "customer", "car", "promoCode", "rider"])
        .then(async (booking) => {
          // Fetch from GSMTASKS
          const headers = {
            // Authorization: `Token ${process.env.GSMTASKS_API}`,
            Accept: "application/json; version=2.4.15",
            "Content-Type": "application/json",
            Authorization: "Token f69d6f61840fb92efc24b0267abb47a34a7657a9",
          };

          await axios
            .get("https://api.gsmtasks.com/tasks/", { headers: headers })
            .then((response) => {
              var fullTasks = [];
              response.data.map((task) => {
                const foundBooking = booking.find(
                  (val) => val._id.valueOf() === task.external_id
                );

                if (
                  foundBooking?._id.valueOf() !== undefined &&
                  task.external_id === foundBooking._id.valueOf()
                ) {
                  fullTasks.push({ ...foundBooking._doc, ...task });
                }
              });

              return res.status(200).json({
                success: true,
                msg: `Bookings for ${req.params.date} fetched successfully`,
                fullTasks,
              });
            })
            .catch((error) => {
              console.log(error);
              return res
                .status(500)
                .json({ success: false, msg: error.message });
            });
        })
        .catch((err) => {
          console.log(err);
          return res.status(500).json({ success: false, msg: err.message });
        });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ success: false, msg: err.message });
    }
  },

  listBookingsByDateSlots: async (req, res) => {
    const queriedDate = moment.utc(req.params.date, "YYYYMMDD").format();
    let nextDate = moment(queriedDate).toDate();
    nextDate.setDate(new Date(queriedDate).getDate() + 1);
    nextDate = moment.utc(nextDate).format();
    const slotStartTime = req.params.slotStartTime + ":00";
    const slotEndTime = req.params.slotEndTime + ":00";

    try {
      await db.Booking.find({
        date: {
          $gte: new Date(queriedDate),
          $lt: new Date(nextDate),
        },
        startTime: slotStartTime,
        endTime: slotEndTime,
      })
        .populate(["service", "customer", "car", "promoCode", "rider"])
        .then(async (booking) => {
          // Fetch from GSMTASKS
          const headers = {
            // Authorization: `Token ${process.env.GSMTASKS_API}`,
            Accept: "application/json; version=2.4.15",
            "Content-Type": "application/json",
            Authorization: "Token f69d6f61840fb92efc24b0267abb47a34a7657a9",
          };

          await axios
            .get("https://api.gsmtasks.com/tasks/", { headers: headers })
            .then((response) => {
              var fullTasks = [];
              response.data.map((task) => {
                const foundBooking = booking.find(
                  (val) => val._id.valueOf() === task.external_id
                );

                if (
                  foundBooking?._id.valueOf() !== undefined &&
                  task.external_id === foundBooking._id.valueOf()
                ) {
                  fullTasks.push({ ...foundBooking._doc, ...task });
                }
              });

              return res.status(200).json({
                success: true,
                msg: `Bookings for ${req.params.date} between ${slotStartTime} and ${slotEndTime} fetched successfully`,
                fullTasks,
              });
            })
            .catch((error) => {
              console.log(error);
              return res
                .status(500)
                .json({ success: false, msg: error.message });
            });
        })
        .catch((err) => {
          console.log(err);
          return res.status(500).json({ success: false, msg: err.message });
        });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ success: false, msg: err.message });
    }
  },

  authenticateGsmTasks: async (req, res) => {
    try {
      const task = {
        username: process.env.GSMTASKS_USERNAME,
        password: process.env.GSMTASKS_PASSWORD,
      };

      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json; version=2.2.1",
        Authorization: `Token ${process.env.GSMTASKS_API}`,
      };

      const response = await axios.post(
        "https://api.gsmtasks.com/authenticate/",
        task,
        { headers: headers }
      );
      console.log(response.data);
      res.status(200).json({
        success: true,
        msg: "Successfully authentified",
        gsmuser: response.data,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, msg: err.message });
    }
  },

  updateBookingPayment: async (req, res) => {
    try {
      const id = req.body.id;
      const update = await db.Booking.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { paymentStatus: "completed" }
      );

      if (!update)
        return res
          .status(403)
          .json({ success: false, msg: "Booking doesn't exist" });

      res.status(200).json({
        success: true,
        msg: "Booking payment status updated successfully!",
      });
    } catch (err) {
      res.status(500).json({ success: false, msg: err.message });
    }
  },

  getLatestBooking: async (req, res) => {
    try {
      const id = req.params.id;

      const booking = await db.Booking.find({ customer: new ObjectId(id) })
        .populate(["service", "customer", "car", "promoCode", "rider"])
        .sort({ _id: -1 })
        .limit(1);
      // Check if the booking array is empty
      if (booking.length === 0) {
        console.warn("No bookings found");
        return res.status(404).json({
          success: false,
          msg: "No bookings found",
        });
      }

      // Fetch from GSMTASKS
      const headers = {
        // Authorization: `Token ${process.env.GSMTASKS_API}`,
        Accept: "application/json; version=2.4.15",
        "Content-Type": "application/json",
        Authorization: "Token f69d6f61840fb92efc24b0267abb47a34a7657a9",
      };

      await axios
        .get("https://api.gsmtasks.com/tasks/", { headers: headers })
        .then((response) => {
          var fullTasks = [];
          response.data.map((task) => {
            const foundBooking = booking.find(
              (val) => val._id.valueOf() === task.external_id
            );

            if (
              foundBooking?._id.valueOf() !== undefined &&
              task.external_id === foundBooking._id.valueOf()
            ) {
              fullTasks.push({ ...foundBooking._doc, ...task });
              return;
            }
          });

          return res.status(200).json({
            success: true,
            msg: "Booking fetched successfully",
            fullTasks,
          });
        })
        .catch((error) => {
          console.log("error==> ", error);
          return res.status(500).json({ success: false, msg: error.message });
        });
      } catch (err) {
        res.status(500).json({ success: false, msg: err.message });
      }
    },

    getUpdatedBooking: async (req, res) => {
      try {
        const id = req.params.id;
  
        const booking = await db.Booking.find({ customer: new ObjectId(id) })
          .populate(["service", "customer", "car", "promoCode", "rider"])
          .sort({ _id: -1 })
          .limit(1);
        // Check if the booking array is empty
        if (booking.length === 0) {
          console.warn("No bookings found");
          return res.status(404).json({
            success: false,
            msg: "No bookings found",
          });
        }
  
        // Fetch from GSMTASKS
        const headers = {
          // Authorization: `Token ${process.env.GSMTASKS_API}`,
          Accept: "application/json; version=2.4.15",
          "Content-Type": "application/json",
          Authorization: "Token f69d6f61840fb92efc24b0267abb47a34a7657a9",
        };
  
        await axios
          .get("https://api.gsmtasks.com/tasks/", { headers: headers })
          .then((response) => {
            var fullTasks = [];
            response.data.map((task) => {
              const foundBooking = booking.find(
                (val) => val._id.valueOf() === task.external_id
              );
  
              if (
                foundBooking?._id.valueOf() !== undefined &&
                task.external_id === foundBooking._id.valueOf()
              ) {
                fullTasks.push({ ...foundBooking._doc, ...task });
                return;
              }
            });
  
            return res.status(200).json({
              success: true,
              msg: "Booking fetched successfully",
              fullTasks,
            });
          })
          .catch((error) => {
            console.log("error==> ", error);
            return res.status(500).json({ success: false, msg: error.message });
          });
        } catch (err) {
          res.status(500).json({ success: false, msg: err.message });
        }
      },
  
    assignBookingToRider: async (req, res) => {
      try {

        const headers = {
          // Authorization: `Token ${process.env.GSMTASKS_API}`,
          Accept: "application/json; version=2.4.15",
          "Content-Type": "application/json",
          Authorization: "Token f69d6f61840fb92efc24b0267abb47a34a7657a9",
        };

        var idTask = "";

        const bookingId = req.body.bookingId;
        const riderId = req.body.riderId;

        // Get RIDER
        const rider = await db.Rider.findById(riderId);
        if (!rider)
          return res.status(403).json({ success: false, msg: "Rider not found" });

        const update = await db.Booking.findOneAndUpdate(
          { _id: new ObjectId(bookingId) },
          { rider: riderId }
        );

        if (!update)
        return res
          .status(403)
          .json({ success: false, msg: "Booking doesn't exist" });

          await axios
          .get("https://api.gsmtasks.com/tasks/", { headers: headers })
          .then(async(response) => {
            response.data.map(async (task) => {
              
              if (
                task.external_id === bookingId
              ) {
                idTask = await task.id;
                return
              }
            });
  
            
          })
          .catch((error) => {
            console.log("error==> ", error);
            return res.status(500).json({ success: false, msg: error.message });
          });


        console.log("update", update);
        console.log("rider", rider);
          
        // Assign from GSMTASKS
        
        const data = {
          assignee: rider.gsmTaskUrl
        }

        console.log(`https://api.gsmtasks.com/tasks/${idTask}/assign/`);

        await axios
        .post(`https://api.gsmtasks.com/tasks/${idTask}/assign/`, data, {
          headers: headers,
        })
        .then((response) => {
        console.log(response.data);
            return res
            .status(200)
            .json({
              success: true,
              msg: "Rider assigned successfully",
              booking: response.data
            });

        })
        .catch((error) => {
          console.log("-->>>>>  ", error.message);
          return res.status(500).json({ success: false, msg: "An error occured!"});
        });
      
    } catch (err) {
      res.status(500).json({ success: false, msg: err.message });
    }
  },

  /**
   * 
   * @param {*} req 
   * @param {*} res 
   * @returns True or False
   */
  optimizeRoute: async (req, res) => {
    try {
      const ridersUrl = req.body.ridersUrl;
      const date = req.body.date;
  
      console.log("ridersUrl", ridersUrl);
      console.log("date", date);
  
      // GET TODAY DATE BOOKINGS
      const queriedDate = moment.utc(date, "YYYYMMDD").format();
      let nextDate = moment(queriedDate).toDate();
      nextDate.setDate(new Date(queriedDate).getDate() + 1);
      nextDate = moment.utc(nextDate).format();
  
      const booking = await db.Booking.find({
        date: {
          $gte: new Date(queriedDate),
          $lt: new Date(nextDate),
        },
      });
  
      // Fetch from GSMTASKS
      const headers = {
        Accept: "application/json; version=2.4.15",
        "Content-Type": "application/json",
        Authorization: "Token f69d6f61840fb92efc24b0267abb47a34a7657a9",
      };
  
      const response = await axios.get("https://api.gsmtasks.com/tasks/", { headers: headers });
      const fullTasks = [];
  
      response.data.forEach((task) => {
        const foundBooking = booking.find(
          (val) => val._id.valueOf() === task.external_id
        );
  
        if (
          foundBooking?._id.valueOf() !== undefined &&
          task.external_id === foundBooking._id.valueOf()
        ) {
          fullTasks.push(task.url);
        }
      });
  
      const formattedTodayDate = moment(date, "YYYYMMDD").format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
  
      const dataRouteOptimization = {
        account: "https://api.gsmtasks.com/accounts/040967e8-a52d-4436-80f0-77b153c783fa/",
        assignees: ridersUrl,
        objective: "completion_time",
        tasks: fullTasks,
        start_time: formattedTodayDate,
        start_location: {
          type: "Point",
          coordinates: [
            -1.095587,
            52.6166008
          ]
        },
        end_location: {
          type: "Point",
          coordinates: [
            -1.095587,
            52.6166008
          ]
        },
        unassign_not_optimal: false,
        commit: true
      };
  
      // Route optimization
      const responseRoute = await axios.post(`https://api.gsmtasks.com/route_optimizations/`, dataRouteOptimization, {
        headers: headers,
      });
  
      return res
        .status(200)
        .json({
          success: true,
          msg: "Route Optimized successfully",
          booking: responseRoute.data
        });
      
    } catch (err) {
      console.log("-->>>>>  ", err.message);
      return res.status(500).json({ success: false, msg: "An error occurred!"});
    }
  },
  
  
};

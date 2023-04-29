const axios = require("axios");
const db = require("../../../models");
var ObjectId = require("mongodb").ObjectId;

module.exports = {
  addController: async (req, res) => {
    try {

      const headers = {
        // Authorization: `Token ${process.env.GSMTASKS_API}`,
        Accept: "application/json; version=2.4.15",
        "Content-Type": "application/json",
        Authorization: "Token f69d6f61840fb92efc24b0267abb47a34a7657a9",
      };

      const d = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        phone: req.body.phone,
        password: "12345678",
        raw_address: req.body.raw_address,
        formatted_address: req.body.formatted_address,
        type: req.body.type,
        longitude: req.body.longitude,
        latitude: req.body.latitude,
        google_place_id: req.body.google_place_id,
        point_of_interest: req.body.point_of_interest,
        street: req.body.street,
        house_number: req.body.house_number,
        apartment_number: req.body.apartment_number,
        city: req.body.city,
        state: req.body.state,
        postal_code: req.body.postal_code,
        country: req.body.country,
        country_code: req.body.country_code,
      };

      // CREATE GSM TASK USER
      const riderGSMTASKS = {
        role: "assignee",
        username: d.email,
        first_name: d.first_name,
        last_name: d.last_name,
        email: d.email,
        phone: d.phone,
        password: d.password,
        address: {
          raw_address: d.raw_address,
          formatted_address: d.formatted_address,
          location: {
            type: "Point",
            coordinates: [d.longitude, d.latitude],
          },
          google_place_id: d.google_place_id,
          point_of_interest: d.point_of_interest,
          street: d.street,
          house_number: d.house_number,
          apartment_number: d.apartment_number,
          city: d.city,
          state: d.state,
          postal_code: d.postal_code,
          country: d.country,
          country_code: d.country_code,
        },
      };

      await axios
        .post("https://api.gsmtasks.com/users/", riderGSMTASKS, {
          headers: headers,
        })
        .then(async(response) => {

            const gsmTaskUrl =  response.data.url;
            const email = response.data.email;

            // CREATE GSM TASK ACCOUNT ROLE

            const riderGSMTASKSAccountRole = {
              account: "https://api.gsmtasks.com/accounts/040967e8-a52d-4436-80f0-77b153c783fa/",
              email: email,
              user: gsmTaskUrl,
              display_name: email,
              phone: d.phone,
              vehicle_registration_number: "",
              vehicle_profile: "bike",
              vehicle_capacity: [
                200
              ],
              vehicle_speed_factor: 1,
              vehicle_service_time_factor: 1,
              route_start_address: {
                raw_address: d.raw_address,
                formatted_address: d.formatted_address,
                location: {
                  type: "Point",
                  coordinates: [d.longitude, d.latitude],
                },
                google_place_id: d.google_place_id,
                point_of_interest: d.point_of_interest,
                street: d.street,
                house_number: d.house_number,
                apartment_number: d.apartment_number,
                city: d.city,
                state: d.state,
                postal_code: d.postal_code,
                country: d.country,
                country_code: d.country_code,
              },
              route_end_address: {
                raw_address: d.raw_address,
                formatted_address: d.formatted_address,
                location: {
                  type: "Point",
                  coordinates: [d.longitude, d.latitude],
                },
                google_place_id: d.google_place_id,
                point_of_interest: d.point_of_interest,
                street: d.street,
                house_number: d.house_number,
                apartment_number: d.apartment_number,
                city: d.city,
                state: d.state,
                postal_code: d.postal_code,
                country: d.country,
                country_code: d.country_code,
              },
              is_manager: false,
              is_worker: true,
              is_integration: false,
              show_unassigned: false
            };

            // console.log("response", response.data);

            // console.log("riderGSMTASKSAccountRole", riderGSMTASKSAccountRole);

            await axios
              .post("https://api.gsmtasks.com/account_roles/", riderGSMTASKSAccountRole, {
                headers: headers,
              })
              .then(async (responseT) => {

                  const rider = await db.Rider.create({
                    email : email,
                    gsmTaskUrl: gsmTaskUrl,
                    first_name: d.first_name,
                    last_name: d.last_name,
                    longitude: d.longitude,
                    latitude: d.latitude,
                    raw_address: d.raw_address,
                    formatted_address: d.formatted_address,
                  });
                  console.log("rider", rider);
                  await rider.save();

                  return res
                  .status(200)
                  .json({
                    success: true,
                    msg: "Rider added successfully",
                    // rider: response.data,
                    // riderT: responseT.data,
                  });

              })
              .catch((error) => {
                console.log("-->>>>>  ",error.message);
                return res.status(500).json({ success: false, msg: "An active account role for given account and user already exists."});
              });
        })
        .catch((error) => {
          console.log("-->>>>>2  ",error.message);
          return res.status(500).json({ success: false, msg: error.message });
        });

    } catch (err) {
      console.log("-->>>>>3  ",err.message);
      res.status(500).json({ success: false, msg: err.message });
    }
  },

  //get listrider
  listRiders: async (req, res) => {
    try {
      await db.Rider.find()
        .then(async (rider) => {
          // Fetch from GSMTASKS
          const headers = {
            // Authorization: `Token ${process.env.GSMTASKS_API}`,
            Accept: "application/json; version=2.4.15",
            "Content-Type": "application/json",
            Authorization: "Token f69d6f61840fb92efc24b0267abb47a34a7657a9",
          };

          await axios
            .get("https://api.gsmtasks.com/users/", { headers: headers })
            .then((response) => {
              var fullRiders = [];
              response.data.map((riderFound) => {
                const listRider = rider.find(
                  (val) => val.gsmTaskUrl === riderFound.url
                );

                if (
                  listRider?.gsmTaskUrl !== undefined &&
                  riderFound.url === listRider.gsmTaskUrl
                ) {
                  fullRiders.push({ ...listRider._doc, ...riderFound });
                }
              });

              return res.status(200).json({
                success: true,
                msg: "Riders fetched successfully",
                fullRiders,
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

  findRider: async (req, res) => {
    try {
      const id = req.params.id;
      const rider = await db.Rider.findById(id);
      if (!rider)
        return res.status(403).json({ success: false, msg: "Rider not found" });

        const headers = {
          // Authorization: `Token ${process.env.GSMTASKS_API}`,
          Accept: "application/json; version=2.4.15",
          "Content-Type": "application/json",
          Authorization: "Token f69d6f61840fb92efc24b0267abb47a34a7657a9",
        };

        await axios
          .get(rider.gsmTaskUrl, { headers: headers })
          .then((response) => {
            return res.status(200).json({
              success: true,
              msg: "Rider found",
              rider: { ...rider._doc, ...response.data} ,
            });
          })
          .catch((error) => {
            console.log(error);
            return res
              .status(500)
              .json({ success: false, msg: error.message });
          });
    } catch (err) {
      res.status(500).json({ success: false, msg: err.message });
    }
  },
  
  activateController : async (req, res)=>{
    try {
      const id = req.body.id;
      const update = await db.Rider.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { activate: true }
      );

      if (!update)
        return res
          .status(403)
          .json({ success: false, msg: "Rider doesn't exist" });

      res.status(200).json({
        success: true,
        msg: "Rider activated successfully!",
      });
    } catch (err) {
      res.status(500).json({ success: false, msg: err.message });
    }
  },

  deactivateController : async (req, res)=>{
    try {
      const id = req.body.id;
      const update = await db.Rider.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { activate: false }
      );

      if (!update)
        return res
          .status(403)
          .json({ success: false, msg: "Rider doesn't exist" });

      res.status(200).json({
        success: true,
        msg: "Rider deactivated successfully!",
      });
    } catch (err) {
      res.status(500).json({ success: false, msg: err.message });
    }
  }
};

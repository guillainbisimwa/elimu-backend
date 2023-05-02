const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const anneeScolaireRoutes = require("./routes/anneeScolaireRoutes");
const classeRoutes = require("./routes/classeRoutes");
const communiqueRoutes = require("./routes/communiqueRoutes");
const ecoleRoutes = require("./routes/ecoleRoutes");
const eleveRoutes = require("./routes/eleveRoutes");
const financeRoutes = require("./routes/financeRoutes");
const parentRoutes = require("./routes/parentRoutes");

const path = require("path");
const { createServer } = require("http");
//const middleware = require('./middleware');

module.exports = (dataService) => {
  const REST_PORT = process.env.PORT || 8080;

  const app = express();
  app.use(express.static(path.join(__dirname, "/public")));

  // using dotenv
  require("dotenv").config();

  // bodyParser
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.use(cors());
  //app.use(middleware.current)

  const server = createServer(app);

  app.get("/", (req, res) => {
    res.status(200).json({
      msg: "Elimu API",
      version: "1.0.0",
    });
    return;
  });

  app.use("/api", authRoutes);
  app.use("/api/anneeScolaire", anneeScolaireRoutes);
  app.use("/api/classe", classeRoutes);
  app.use("/api/communique", communiqueRoutes);
  app.use("/api/ecole", ecoleRoutes);
  app.use("/api/eleve", eleveRoutes);
  app.use("/api/finance", financeRoutes);
  app.use("/api/parent", parentRoutes);


  server.listen(REST_PORT, () => {
    console.log("Listening on " + REST_PORT);
  });

  // Return object containing `close()` method for shutting down the server
  return server;
};

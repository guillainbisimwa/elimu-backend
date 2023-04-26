const mongoose = require("mongoose");
// using dotenv
require("dotenv").config();

mongoose.set("debug", true);
mongoose.set("strictQuery", false);
mongoose.Promise = Promise;
const databaseURL = process.env.DB_PATH;
mongoose
  .connect(databaseURL, {
    useNewUrlParser: true,
    //useUnifiedTopology: true,
    //useFindAndModify:false
  })
  .then(() => console.log(`Database connected`))
  .catch((err) => console.log(`Database connection error: ${err.message}`));

module.exports.Account = require("./account");
module.exports.Parent = require("./parent");
module.exports.Ecole = require("./ecole");
module.exports.Eleve = require("./eleve");

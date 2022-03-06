const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const PORT = 8080;
const mongoDB =
  "mongodb+srv://pianist:ggininder@cluster0.yohx1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
dotenv.config();
const authRoute = require("./routes").auth;
const courseRoute = require("./routes").course;
const passport = require("passport");
require("./config/passport")(passport);
const cors = require("cors");

mongoose
  .connect(mongoDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to Mongo Atlas");
  })
  .catch((e) => {
    console.log(e);
  });

//MiddleWare
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/api/user", authRoute);
app.use(
  "/api/courses",
  passport.authenticate("jwt", { session: false }),
  courseRoute
);

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
  console.log(process.env.PASSPORT_SECRET);
});

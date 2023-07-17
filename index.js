const express = require("express");
const createHttpError = require("http-errors");
require("dotenv").config();
const mongoose = require("mongoose");
const morgan = require("morgan");
const app = express();

app.use("/user", require("./routes/user.route"));

app.use("/auth", require("./routes/auth.route")); //auth/profile,auth/login,auth/logout routes

app.get("/", function (req, res, next) {
  res.send("home route");
});

app.use(morgan("dev")); // used to see logs on console
// handle error with below codee
app.use((req, res, next) => {
  next(createHttpError.NotFound());
});

app.use((error, req, res, next) => {
  error.status = error.status || 500;
  res.status(error.status);
  res.send(error);
});

// initialize .env variables
const port = process.env.PORT || 5000; //port on server is listening

// connecting database and then only listening on server on port 5000
mongoose
  .connect(process.env.DB_URL, {
    dbName: process.env.DB_NAME,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connected database");
    //listening server function
    app.listen(port, function () {
      console.log(`listening on port ${port}`);
    });
  })
  .catch((error) => console.log(error.message));

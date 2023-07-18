require("dotenv").config();
const express = require("express");
const createHttpError = require("http-errors");
const cameraRoute = require("./routes/camera.route");

const mongoose = require("mongoose");
const morgan = require("morgan");
const app = express();

// middlewares
app.use(express.json());
app.use(morgan("dev")); // used to see logs on console
// handle error with below codee

app.use("/api/v1/users", require("./routes/users.route")); // /api/v1/users

app.use("/api/v1/auth", require("./routes/auth.route")); ///api/v1/auth/profile,/api/v1/auth/login,auth/logout routes
app.use("/api/v1/camera", require("./routes/camera.route"));

app.use((req, res, next) => {
  next(createHttpError.NotFound());
});

app.use((error, req, res, next) => {
  error.status = error.status || 500;
  res.status(error.status);
  res.send(error);
});
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
  })
  .catch((error) => console.log(error.message));

app.listen(port, function () {
  console.log(`listening on port ${port}`);
});

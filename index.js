require("dotenv").config();
const express = require("express");
// const createHttpError = require("http-errors");
// const cameraRoute = require("./routes/camera.route");
const cors = require("cors");
const mongoose = require("mongoose");
const morgan = require("morgan");
const app = express();
const bodyParser = require('body-parser');
const { logger, logEvents } = require("./middlewares/logger");
const { ErrorHandler, ApplicationError } = require("./middlewares/errorHandler");
const corsOptions = require("./config/corsOption");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const nosqlSanitizer = require("express-mongo-sanitize")
const xssProtect = require("xss-clean")
const adminRouter = require("./routes/admin/admin.route")
const userRouter = require("./routes/users.route")
const webHookRouter = require("./routes/webhookRoutes/webhookRoute")
const http = require("http");

// middlewares

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  express.urlencoded({
    extended: false,
  })
);
app.use(nosqlSanitizer())
app.use(xssProtect())
app.use(helmet())
app.use(cookieParser())  //cookie parser


app.use(cors(corsOptions)) // cors
app.use(logger)

app.use(morgan("dev")); // used to see logs on console
// handle error with below codee

// webhook route
app.use("/api/v1/webhook", webHookRouter);

// !routes to handle all users related requests
app.use("/api/v1/users", userRouter);




app.use("/api/v1/admin/users", adminRouter);
app.use("/api/v1/admin/cameras", adminRouter);

// !routes to handle login,logout,register related requests
app.use("/api/v1/auth", require("./routes/auth.route")); ///api/v1/auth/profile,/api/v1/auth/login,auth/logout routes
// !routes to handle all camera/data add/remove/update requests
app.use("/api/v1/camera", require("./routes/camera.route"));


app.all("*", (req, res, next) => {

  next(new ApplicationError(`route ${req.originalUrl} Not found`, 404))
});

const port = process.env.PORT || 5500; //port on server is listening
// connecting database and then only listening on server on port 5000



const db_url = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@hyperstream.9sbxaff.mongodb.net/?retryWrites=true&w=majority`
mongoose.connect(db_url, {
  dbName: process.env.DB_NAME,
})
  .then(() => {
    console.log("connected database");
    //listening server function
  })
  .catch((error) => console.log(error.message));

app.use(ErrorHandler)
const server = http.createServer(app)

mongoose.connection.once("open", () => {
  server.listen(process.env.PORT, "0.0.0.0", () => {
    console.log("server listeing on port " + process.env.PORT)
  })
  // sslserver.listen(port, () => { console.log(`Secure Server is listening on port ${port}`) });
  // app.listen(port,"0.0.0.0", function () {
  //   console.log(`listening on port ${port}`);
  // });

})

mongoose.connection.on("error", error => {
  console.log(error)
  logEvents(`${error.no}: ${error.code}\t${error.codeName}\t${error.syscall}\t${error.hostname}`, "mongooseErrorLogs.log")
})


module.exports = app
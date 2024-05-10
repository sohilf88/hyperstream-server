const { logEvents } = require("./logger");



const ErrorHandler = (err, req, res, next) => {
    // console.log("Middleware Error Hadnling" + err.stack);
    logEvents(`${err.name}:-${err.message}\t${req.method}\t${req.url}`, "errorLog.log")
    const errStatus = err.statusCode || 500;
    const errMsg = err.message || 'Something went wrong';
    res.status(errStatus).json({
        success: err.success,
        status: errStatus,
        message: errMsg,
        // stack: process.env.NODE_ENV === 'dev' ? err.stack : {}
    })
}

class ApplicationError extends Error {
    constructor(message, statusCode, success) {
        super(message);

        this.statusCode = statusCode
        this.success = success || false
        this.status = statusCode >= 400 && statusCode < 500 ? false : true
        this.isOperational = true
        Error.captureStackTrace(this, this.constructor);
    }

}
module.exports = { ErrorHandler, ApplicationError }


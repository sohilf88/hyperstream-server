const { logEvents } = require("./logger");


function errorHandle(error, req, res, next) {
    logEvents(`${error.name}:-${error.message}\t${req.method}\t${req.url}`, "errorLog.log")
    console.log(error.stack)
    const status = res.statusCode ? res.statusCode : 500 //server error
    res.status(status)
    res.json({ message: error.message })
}

module.exports = { errorHandle }
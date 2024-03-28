const rateLimit = require('express-rate-limit')
const { logEvents } = require('./logger')
logEvents
const loginLimiter = rateLimit({
    windowMs: 2 * 60 * 1000, // 5 minutes
    limit: 5, // Limit each IP to 100 requests per `window` (here, per 2 minutes).
    standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    // store: ... , // Redis, Memcached, etc. See below.
    message: { message: "you have exceeded login attempt, please try after 2 min" },
    handler: (req, res, options, next) => {
        logEvents(`Too many login attempts ${options.message.message}\t${req.method}\t ${req.url}\t${req.headers.origin}`, "errorLog.log")
        res.status(options.statusCode).send(options.message)
    },
    // standardHeaders: true, //return rate limit info in the RateLimit-* headers
    // legacyHeaders: false //disable X-rateLimit-* headers
})

module.exports = loginLimiter
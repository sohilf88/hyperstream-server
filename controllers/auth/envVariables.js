const ACCESS_TOKEN_EXP = parseInt(process.env.AUTH_ACCESS_TOKEN_EXPIRY);      // seconds
const REFRESH_TOKEN_EXP = parseInt(process.env.AUTH_REFRESH_TOKEN_EXPIRY);    // seconds

const ACCESS_COOKIE_EXP = parseInt(process.env.AUTH_ACCESS_COOKIE_EXPIRY);    // ms
const REFRESH_COOKIE_EXP = parseInt(process.env.AUTH_REFRESH_COOKIE_EXPIRY);  // ms
const DOMAIN_NAME=process.env.ENV
module.exports={ACCESS_TOKEN_EXP,REFRESH_TOKEN_EXP,ACCESS_COOKIE_EXP,REFRESH_COOKIE_EXP,DOMAIN_NAME}
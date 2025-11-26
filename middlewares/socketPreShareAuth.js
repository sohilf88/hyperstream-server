// middlewares/socketPreShareAuth.js
const socketPreShareAuth = (socket, next) => {
  const clientKey = socket.handshake.auth?.key;
  // console.log(clientKey)
  // console.log(process.env.SOCKET_KEY)
  if (!clientKey) return next(new Error("No key provided"));
  // console.log(clientKey == process.env.SOCKET_KEY)
  if (clientKey !== process.env.SOCKET_KEY) {
    return next(new Error("Invalid pre-shared key"));
  }
  
  next(); // ✅ authenticated
};

module.exports = { socketPreShareAuth };

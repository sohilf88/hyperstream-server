// middlewares/socketPreShareAuth.js
const socketPreShareAuth = (socket, next) => {
  const clientKey = socket.handshake.auth?.key;
//   console.log(clientKey)
  if (!clientKey) return next(new Error("No key provided"));
  if (clientKey !== process.env.SOCKET_KEY) {
    return next(new Error("Invalid pre-shared key"));
  }
  
  next(); // ✅ authenticated
};

module.exports = { socketPreShareAuth };

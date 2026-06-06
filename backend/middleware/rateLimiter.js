const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { message: "Too many attempts, please try again after a minute" }
});

const postLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { message: "You are posting too fast, slow down" }
});

module.exports = { authLimiter, postLimiter };
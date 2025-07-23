const jwt = require("jsonwebtoken");

module.exports = {
  signToken: (data) => jwt.sign(data, "DANANG"),
  verifyToken: (token) => jwt.verify(token, "DANANG"),
};

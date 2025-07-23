const { verifyToken } = require("../helpers/jwt");
const { User } = require("../models");

module.exports = async function authentication(req, res, next) {
  const bearerToken = req.headers.authorization;
  if (!bearerToken) {
    res.status(401).json({ message: "Invalid token" });
    return;
  }

  try {
    const access_token = bearerToken.split(" ")[1];
    const data = verifyToken(access_token);

    const user = await User.findByPk(data.id);
    if (!user) {
      res.status(401).json({ message: "Invalid token" });
      return;
    }
    req.user = user;
    next();
  } catch (err) {
    console.log("--------------->", err);

    if (err.name === "JsonWebTokenError") {
      res.status(401).json({ message: "Invalid token" });
    } else {
      res.status(500).json({
        message: "Internal server error",
      });
    }
  }
};

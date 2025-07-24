module.exports = function errorHandler(err, req, res, next) {
  if (err.name === "BadRequest" || err.name === "AlreadyExists") {
    return res.status(400).json({ message: err.message });
  }
  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(400).json({
      message: err.errors?.[0]?.message || "Email must be unique",
    });
  } else if (
    err.name === "SequelizeValidationError" ||
    err.name === "SequelizeUniqueConstraintError"
  ) {
    return res.status(400).json({
      message: err.errors?.[0]?.message || "Validation error",
    });
  } else if (
    err.name === "Unauthorized" ||
    err.name === "JsonWebTokenError" ||
    err.message === "Invalid token"
  ) {
    return res.status(401).json({ message: err.message || "Invalid token" });
  } else if (err.name === "Not Found") {
    return res.status(404).json({ message: "Data not found" });
  } else {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

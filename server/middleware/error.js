const errorHandler = (err, req, res, next) => {
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }

  if (err.code === 11000) {
    return res.status(409).json({ message: "Email already exists" });
  }

  const status = err.statusCode || 500;
  return res.status(status).json({
    message: err.message || "Something went wrong",
  });
};

module.exports = errorHandler;

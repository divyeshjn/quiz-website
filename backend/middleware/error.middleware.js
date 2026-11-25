export const notFound = (req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found",
  });
};

export const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.name === "MulterError") {
    return res.status(
      err.code === "LIMIT_FILE_SIZE" ? 413 : 400
    ).json({
      success: false,
      message:
        err.code === "LIMIT_FILE_SIZE"
          ? "CSV file must not exceed 2 MB"
          : err.message,
    });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: Object.values(err.errors).map(
        (error) => error.message
      ),
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid field value",
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Duplicate record already exists",
    });
  }

  const statusCode =
    err.statusCode || err.status || 500;

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode >= 500
        ? "Internal server error"
        : err.message,
  });
};

// 6b05d8f2d9f0a26c8238c1b6
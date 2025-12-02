const errorHandler = (err, req, res, next) => {
  console.error("[ERROR HANDLER] Error caught:");
  console.error(err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  if (res.headersSent) {
    return next(err);
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

export default errorHandler;
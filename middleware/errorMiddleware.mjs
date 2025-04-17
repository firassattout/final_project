export const notfound = (req, res, next) => {
  const error = Error(`notfound ${req.originalUrl} `);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({ message: err.message });
};

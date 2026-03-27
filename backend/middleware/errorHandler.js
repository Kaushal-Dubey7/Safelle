const errorHandler = (err, req, res, _next) => {
  console.error('Error:', err.message);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ message: messages.join(', ') });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({ message: `An account with this ${field} already exists.` });
  }

  if (err.name === 'UnauthorizedError' || err.status === 401) {
    return res.status(401).json({ message: err.message || 'Unauthorized' });
  }

  if (err.status === 403) {
    return res.status(403).json({ message: err.message || 'Forbidden' });
  }

  if (err.status === 404) {
    return res.status(404).json({ message: err.message || 'Resource not found' });
  }

  const statusCode = err.status || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;

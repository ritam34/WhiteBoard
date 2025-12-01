import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, 
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: {
    status: 'error',
    message: 'Too many authentication attempts, please try again later.'
  },
  skipSuccessfulRequests: true 
});

const boardCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 10, 
  message: {
    status: 'error',
    message: 'Too many boards created, please try again later.'
  }
});

const boardSaveLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30, 
  message: {
    status: 'error',
    message: 'Too many save requests, please slow down.'
  }
});

export { apiLimiter, authLimiter, boardCreationLimiter, boardSaveLimiter };
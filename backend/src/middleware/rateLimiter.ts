import rateLimit from 'express-rate-limit';

export const loginRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15, // limit each IP to 15 login requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many login attempts from this IP. Please wait a minute before trying again.',
  },
});

import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  // App
  PORT: Joi.number().default(3001),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  API_PREFIX: Joi.string().default('api/v1'),
  FRONTEND_URL: Joi.string().uri().default('http://localhost:3000'),

  // Database
  DATABASE_URL: Joi.string().required(),

  // Redis
  REDIS_URL: Joi.string().default('redis://localhost:6379'),

  // JWT
  JWT_SECRET: Joi.string().required(),
  JWT_ACCESS_EXPIRY: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRY: Joi.string().default('7d'),

  // Encryption
  ENCRYPTION_KEY: Joi.string().length(64).required(),

  // Google OAuth (optional in dev)
  GOOGLE_CLIENT_ID: Joi.string().optional().allow(''),
  GOOGLE_CLIENT_SECRET: Joi.string().optional().allow(''),
  GOOGLE_CALLBACK_URL: Joi.string().optional().allow(''),

  // AWS S3 (optional in dev)
  AWS_ACCESS_KEY_ID: Joi.string().optional().allow(''),
  AWS_SECRET_ACCESS_KEY: Joi.string().optional().allow(''),
  AWS_S3_BUCKET: Joi.string().default('quickapps-builds'),
  AWS_S3_REGION: Joi.string().default('ap-south-1'),

  // Razorpay (optional in dev)
  RAZORPAY_KEY_ID: Joi.string().optional().allow(''),
  RAZORPAY_KEY_SECRET: Joi.string().optional().allow(''),
  RAZORPAY_WEBHOOK_SECRET: Joi.string().optional().allow(''),

  // Email (optional in dev)
  RESEND_API_KEY: Joi.string().optional().allow(''),
  MSG91_AUTH_KEY: Joi.string().optional().allow(''),

  // EAS (optional in dev)
  EXPO_TOKEN: Joi.string().optional().allow(''),
});

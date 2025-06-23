import Joi from "joi";

const settingsSchema = Joi.object({
  general: Joi.object({
    siteTitle: Joi.string().max(100).required(),
    supportEmail: Joi.string().email().required(),
    timezone: Joi.string().required(),
    dateFormat: Joi.string().valid("MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD").required(),
  }).required(),

  maintenance: Joi.object({
    enabled: Joi.boolean().required(),
    message: Joi.string().max(300),
  }).required(),

  security: Joi.object({
    twoFactorAuth: Joi.boolean().required(),
    passwordExpiry: Joi.number().integer().min(0).max(365).required(),
    failedAttempts: Joi.number().integer().min(1).max(10).required(),
  }).required(),

  notifications: Joi.object({
    emailAdmin: Joi.boolean().required(),
    emailUsers: Joi.boolean().required(),
    slackIntegration: Joi.boolean().required(),
  }).required(),
});

export const validateSettings = (req, res, next) => {
  const { error } = settingsSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      message: "Validation failed",
      details: error.details.map((d) => d.message),
    });
  }
  next();
};
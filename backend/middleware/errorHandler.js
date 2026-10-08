export const errorHandler = (err, req, res, next) => {
  console.error('🔥 [HackX Error]:', err);

  const status = err.status || err.statusCode || 500;
  let message = err.message || 'An unexpected internal server error occurred.';

  // Detect Gemini rate limit or quota
  if (err.message && (err.message.includes('429') || err.message.includes('RESOURCE_EXHAUSTED') || err.message.includes('rate limit'))) {
    return res.status(429).json({
      error: 'Google Gemini rate limit reached. Please wait 30 seconds and retry.',
      code: 'RATE_LIMIT_EXCEEDED',
    });
  }

  // Detect Missing Gemini Key
  if (err.message && err.message.includes('Gemini API key is not configured')) {
    return res.status(400).json({
      error: 'Gemini API key is missing. Add GEMINI_API_KEY in backend/.env to run AI generation.',
      code: 'GEMINI_KEY_MISSING',
    });
  }

  // Zod Validation Error
  if (err.name === 'ZodError') {
    return res.status(422).json({
      error: 'AI response failed schema validation. Please click regenerate.',
      details: err.errors,
      code: 'SCHEMA_VALIDATION_ERROR',
    });
  }

  return res.status(status).json({
    error: message,
    code: err.code || 'INTERNAL_ERROR',
  });
};

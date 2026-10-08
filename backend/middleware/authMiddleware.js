import { supabaseAdmin, createUserClient } from '../utils/supabaseClient.js';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // In local dev without supabase credentials, we can allow a demo user if explicitly allowed
      if (process.env.ALLOW_GUEST_DEV === 'true' || !process.env.SUPABASE_URL) {
        req.user = { id: '00000000-0000-0000-0000-000000000000', email: 'dev@hackx.local' };
        req.supabase = supabaseAdmin;
        return next();
      }
      return res.status(401).json({ error: 'Authorization token required. Please sign in.' });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired authentication session.' });
    }

    req.user = user;
    req.supabase = createUserClient(token);
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({ error: 'Internal error verifying authentication.' });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      if (user) {
        req.user = user;
        req.supabase = createUserClient(token);
      }
    }
  } catch (err) {
    // Continue unauthenticated
  }
  next();
};

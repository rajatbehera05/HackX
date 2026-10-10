import { supabaseAdmin, createUserClient, isSupabaseConfigured } from '../utils/supabaseClient.js';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required. Please sign in.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authorization token is empty. Please sign in.' });
    }

    if (isSupabaseConfigured()) {
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
      if (error || !user) {
        return res.status(401).json({ error: 'Invalid or expired authentication session.' });
      }

      req.user = user;
      req.supabase = createUserClient(token);
      return next();
    }

    // In production, unconfigured database or bypass tokens are strictly disallowed
    if (process.env.NODE_ENV === 'production') {
      return res.status(401).json({ error: 'Production environment requires valid Supabase authentication session.' });
    }

    // Dev Memory Mode: accept dev tokens formatted as dev-token or dev-token-<id>
    if (token.startsWith('dev-token') || token === 'guest-token') {
      const userId = token.startsWith('dev-token-') ? token.replace('dev-token-', '') : 'dev-user';
      req.user = {
        id: userId,
        email: `${userId}@hackx.local`,
        user_metadata: { name: userId === 'dev-user' ? 'Hackathon Lead' : userId },
      };
      return next();
    }

    return res.status(401).json({ error: 'Invalid authentication token in Dev mode.' });
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
      if (token) {
        if (isSupabaseConfigured()) {
          const { data: { user } } = await supabaseAdmin.auth.getUser(token);
          if (user) {
            req.user = user;
            req.supabase = createUserClient(token);
          }
        } else if (token.startsWith('dev-token') || token === 'guest-token') {
          const userId = token.startsWith('dev-token-') ? token.replace('dev-token-', '') : 'dev-user';
          req.user = {
            id: userId,
            email: `${userId}@hackx.local`,
            user_metadata: { name: userId },
          };
        }
      }
    }
  } catch (err) {
    // Continue unauthenticated
  }
  next();
};

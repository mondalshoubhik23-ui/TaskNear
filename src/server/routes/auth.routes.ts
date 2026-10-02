import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { query, queryOne } from '../db/client.js';
import { authMiddleware, signToken, type AuthenticatedRequest } from '../middleware/auth.js';

export const authRouter = Router();

// Helper to fetch full user model with profile and college
export async function getFullUser(userId: string) {
  const user = await queryOne<any>(
    `SELECT id, email, phone, name, role, account_status, email_verified, phone_verified, created_at, updated_at
     FROM users WHERE id = $1`,
    [userId]
  );
  if (!user) return null;

  const profile = await queryOne<any>(
    `SELECT p.*, 
            c.id as college_id_fk, c.name as college_name, c.code as college_code, c.city as college_city, c.state as college_state
     FROM profiles p
     LEFT JOIN colleges c ON p.college_id = c.id
     WHERE p.user_id = $1`,
    [userId]
  );

  let college = undefined;
  if (profile && profile.college_id_fk) {
    college = {
      id: profile.college_id_fk,
      name: profile.college_name,
      code: profile.college_code,
      city: profile.college_city,
      state: profile.college_state,
    };
  }

  const cleanProfile = profile
    ? {
        user_id: profile.user_id,
        avatar_url: profile.avatar_url || '',
        bio: profile.bio || '',
        college_id: profile.college_id,
        college,
        department: profile.department || '',
        year_of_study: profile.year_of_study || '',
        skills: typeof profile.skills === 'string' ? JSON.parse(profile.skills) : (profile.skills || []),
        is_available: Boolean(profile.is_available),
        preferred_categories: typeof profile.preferred_categories === 'string' ? JSON.parse(profile.preferred_categories) : (profile.preferred_categories || []),
        max_purchase_limit: Number(profile.max_purchase_limit || 500),
        rating_avg: Number(profile.rating_avg || 5.0),
        tasks_completed: Number(profile.tasks_completed || 0),
        tasks_posted: Number(profile.tasks_posted || 0),
        approx_lat: profile.approx_lat ? Number(profile.approx_lat) : undefined,
        approx_lng: profile.approx_lng ? Number(profile.approx_lng) : undefined,
        approx_address: profile.approx_address || '',
        verification_status: profile.verification_status,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      }
    : undefined;

  return {
    ...user,
    profile: cleanProfile,
  };
}

// POST /api/auth/register - Public Registration (No artificial user caps)
authRouter.post('/register', async (req, res): Promise<void> => {
  try {
    const { email, password, name, phone, collegeId, department, yearOfStudy } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: 'Name, email, and password are required.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check existing
    const existing = await queryOne(`SELECT id FROM users WHERE LOWER(email) = $1`, [cleanEmail]);
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    const userId = `usr_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    await query(
      `INSERT INTO users (id, email, phone, password_hash, name, role, account_status, email_verified, phone_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [userId, cleanEmail, phone?.trim() || null, passwordHash, name.trim(), 'user', 'active', false, false]
    );

    // Initial default verification status: PENDING
    await query(
      `INSERT INTO profiles (user_id, college_id, department, year_of_study, is_available, verification_status)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, collegeId || 'col_srm_ktr', department || '', yearOfStudy || '', true, 'PENDING']
    );

    // Record audit and analytics
    await query(
      `INSERT INTO analytics_events (id, event_name, user_id, properties) VALUES ($1, $2, $3, $4::jsonb)`,
      [`evt_${crypto.randomUUID()}`, 'signup', userId, JSON.stringify({ email: cleanEmail, collegeId })]
    );

    await query(
      `INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5, $6::jsonb)`,
      [`log_${crypto.randomUUID()}`, userId, 'USER_REGISTERED', 'user', userId, JSON.stringify({ email: cleanEmail })]
    );

    const fullUser = await getFullUser(userId);
    const token = signToken({
      id: userId,
      email: cleanEmail,
      role: 'user',
      name: name.trim(),
    });

    res.cookie('taskhop_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ user: fullUser, token });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed. Please try again later.' });
  }
});

// POST /api/auth/login
authRouter.post('/login', async (req, res): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await queryOne<any>(
      `SELECT id, email, password_hash, name, role, account_status FROM users WHERE LOWER(email) = $1`,
      [cleanEmail]
    );

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    if (user.account_status === 'suspended') {
      res.status(403).json({ error: 'Account has been suspended by trust & safety team.' });
      return;
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const fullUser = await getFullUser(user.id);
    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    res.cookie('taskhop_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ user: fullUser, token });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again later.' });
  }
});

// POST /api/auth/logout
authRouter.post('/logout', (req, res) => {
  res.clearCookie('taskhop_token');
  res.json({ success: true, message: 'Logged out successfully.' });
});

// GET /api/auth/me - Current logged-in user profile
authRouter.get('/me', authMiddleware, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const fullUser = await getFullUser(req.user!.id);
    if (!fullUser) {
      res.status(404).json({ error: 'User profile not found.' });
      return;
    }
    res.json({ user: fullUser });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
});

// POST /api/auth/verify-email
authRouter.post('/verify-email', authMiddleware, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    await query(`UPDATE users SET email_verified = true, updated_at = NOW() WHERE id = $1`, [req.user!.id]);
    const fullUser = await getFullUser(req.user!.id);
    res.json({ success: true, user: fullUser });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update email verification.' });
  }
});
